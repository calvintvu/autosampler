import os
import glob
import numpy as np
import librosa
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import soundfile as sf
from pydub import AudioSegment

global device
def set_device():
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Using device: {device}")

# parameters for audio processing
SR = 44100          # sample rate
DURATION = 1.0      # duration
EXPECTED_LENGTH = int(SR * DURATION)
N_MELS = 64
TIME_STEPS = 44

def load_audio(filename, sr=SR, duration=DURATION):
    audio, _ = librosa.load(filename, sr=sr, duration=duration)
    if len(audio) < EXPECTED_LENGTH:
        audio = np.pad(audio, (0, EXPECTED_LENGTH - len(audio)), mode='constant')
    else:
        audio = audio[:EXPECTED_LENGTH]
    return audio

def audio_to_melspectrogram(audio, sr=SR, n_mels=N_MELS, eps=1e-8):
    S = librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=n_mels)
    log_S = librosa.power_to_db(S, ref=np.max)
    diff = log_S.max() - log_S.min()
    if diff < eps:
        log_S_norm = np.zeros_like(log_S)
    else:
        log_S_norm = (log_S - log_S.min()) / diff
    return log_S_norm

def extract_pitch(audio, sr=SR):
    f0, voiced_flag, _ = librosa.pyin(audio, fmin=librosa.note_to_hz('C2'),
                                      fmax=librosa.note_to_hz('C7'))
    if np.sum(voiced_flag) > 0:
        pitch = np.nanmedian(f0[voiced_flag])
    else:
        pitch = 0.0
    normalized_pitch = pitch / 500.0
    return normalized_pitch

def extract_variation(audio):
    variation = np.std(audio)
    normalized_variation = variation / 0.1  
    return normalized_variation

def extract_conditions(audio, sr=SR):
    pitch = extract_pitch(audio, sr)
    variation = extract_variation(audio)
    return np.array([pitch, variation])

class AudioDataset(Dataset):
    def __init__(self, file_paths, sr=SR, duration=DURATION, n_mels=N_MELS, time_steps=TIME_STEPS):
        self.file_paths = file_paths
        self.sr = sr
        self.duration = duration
        self.n_mels = n_mels
        self.time_steps = time_steps

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        filename = self.file_paths[idx]
        audio = load_audio(filename, sr=self.sr, duration=self.duration)
        spectrogram = audio_to_melspectrogram(audio, sr=self.sr, n_mels=self.n_mels)
        if spectrogram.shape[1] < self.time_steps:
            pad_width = self.time_steps - spectrogram.shape[1]
            spectrogram = np.pad(spectrogram, ((0, 0), (0, pad_width)), mode='constant')
        else:
            spectrogram = spectrogram[:, :self.time_steps]
        audio_feature = spectrogram.flatten().astype(np.float32)
        condition = extract_conditions(audio, sr=self.sr).astype(np.float32)
        return {'audio': audio_feature, 'condition': condition}



def reparameterize(mu, logvar):
    std = torch.exp(0.5 * logvar)
    eps = torch.randn_like(std)
    return mu + eps * std

class Encoder(nn.Module):
    def __init__(self, input_dim, cond_dim, hidden_dim, latent_dim):
        super(Encoder, self).__init__()
        self.fc1 = nn.Linear(input_dim + cond_dim, hidden_dim)
        self.fc_mu = nn.Linear(hidden_dim, latent_dim)
        self.fc_logvar = nn.Linear(hidden_dim, latent_dim)

    def forward(self, x, cond):
        x = torch.cat([x, cond], dim=1)
        h = F.relu(self.fc1(x))
        mu = self.fc_mu(h)
        logvar = self.fc_logvar(h)
        return mu, logvar

class Decoder(nn.Module):
    def __init__(self, latent_dim, cond_dim, hidden_dim, output_dim):
        super(Decoder, self).__init__()
        self.fc1 = nn.Linear(latent_dim + cond_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, output_dim)

    def forward(self, z, cond):
        z = torch.cat([z, cond], dim=1)
        h = F.relu(self.fc1(z))
        recon = torch.sigmoid(self.fc2(h))
        return recon

class CVAE(nn.Module):
    def __init__(self, input_dim, cond_dim, hidden_dim, latent_dim, output_dim):
        super(CVAE, self).__init__()
        self.encoder = Encoder(input_dim, cond_dim, hidden_dim, latent_dim)
        self.decoder = Decoder(latent_dim, cond_dim, hidden_dim, output_dim)

    def forward(self, x, cond):
        mu, logvar = self.encoder(x, cond)
        z = reparameterize(mu, logvar)
        recon = self.decoder(z, cond)
        return recon, mu, logvar

def prepare_dataset():
    dataset_folder = './drums_dataset2'
    mp3_files = glob.glob(os.path.join(dataset_folder, '**', '*.mp3'), recursive=True)
    wav_files = glob.glob(os.path.join(dataset_folder, '**', '*.wav'), recursive=True)
    file_paths = mp3_files + wav_files

    valid_files = []
    for file in file_paths:
        try:
            audio, _ = librosa.load(file, sr=None, duration=1.0)
            valid_files.append(file)
        except Exception as e:
            print(f"Skipping file {file} due to error: {e}")
    print(f"Found {len(valid_files)} audio files.")

    global dataset
    dataset = AudioDataset(valid_files, sr=SR, duration=DURATION, n_mels=N_MELS, time_steps=TIME_STEPS)
    batch_size = 32
    global data_loader
    data_loader = DataLoader(dataset, batch_size=batch_size, shuffle=True, num_workers=0)

def check_audio(file):
    try:
        audio, _ = librosa.load(file, sr=None, duration=1.0)
        return True
    except Exception as e:
        print(f"Skipping file {file} due to error: {e}")
        return False


input_dim = N_MELS * TIME_STEPS 
cond_dim = 2                  
hidden_dim = 512              
latent_dim = 64        
output_dim = input_dim

def train_model():

    model = CVAE(input_dim, cond_dim, hidden_dim, latent_dim, output_dim).to(device)
    optimizer = optim.Adam(model.parameters(), lr=1e-3)

    def loss_function(recon, x, mu, logvar):
        recon_loss = F.mse_loss(recon, x, reduction='sum')
        kl_loss = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
        return recon_loss + kl_loss

    num_epochs = 50
    model.train()
    for epoch in range(num_epochs):
        running_loss = 0.0
        # beta = min(1.0, epoch / 20.0)
        for batch in data_loader:

            audio_batch = batch['audio'].to(device)
            cond_batch = batch['condition'].to(device)
            audio_batch = audio_batch.float()  # shape: [batch_size, input_dim]
            cond_batch = cond_batch.float()    # shape: [batch_size, cond_dim]
            
            optimizer.zero_grad()
            recon, mu, logvar = model(audio_batch, cond_batch)
            loss = loss_function(recon, audio_batch, mu, logvar)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        
        avg_loss = running_loss / len(dataset)
        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {avg_loss:.4f}")

    model_dir = "./models/"

    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        print(f"'{model_dir}' dir created.")
    else:
        print(f"'{model_dir}' dir already exists.")

    model_save_path = './models/cvae_drum_model.pth'
    torch.save(model.state_dict(), model_save_path)
    print(f"Model saved to {model_save_path}")

def load_model():
    model_save_path = './models/cvae_drum_model.pth'
    model_loaded = CVAE(input_dim, cond_dim, hidden_dim, latent_dim, output_dim)
    model_loaded.load_state_dict(torch.load(model_save_path, map_location='cpu'))
    model_loaded.eval()
    return model_loaded

def generate_samples(audio_file, model_loaded=load_model(), pitch=0.0, variation=0.0):
    if not model_loaded:
        return
    
    min_dB = -40.0
    max_dB = 0.0

    audio_file = load_audio(audio_file, sr=SR, duration=DURATION)
    spectrogram_new = audio_to_melspectrogram(audio_file, sr=SR, n_mels=N_MELS)
    if spectrogram_new.shape[1] < TIME_STEPS:
        pad_width = TIME_STEPS - spectrogram_new.shape[1]
        spectrogram_new = np.pad(spectrogram_new, ((0, 0), (0, pad_width)), mode='constant')
    else:
        spectrogram_new = spectrogram_new[:, :TIME_STEPS]
    input_feature_new = spectrogram_new.flatten().astype(np.float32)
    input_tensor_new = torch.tensor(input_feature_new).unsqueeze(0)

    condition_new = extract_conditions(audio_file, sr=SR).astype(np.float32)
    cond_tensor_new = torch.tensor(condition_new).unsqueeze(0)

    n_fft = 1024      
    hop_length = 256   
    n_iter = 512       

    output = []

    for i in range(4):
        with torch.no_grad():
            mu, logvar = model_loaded.encoder(input_tensor_new, cond_tensor_new)
            z = reparameterize(mu, logvar)
            
            modified_cond = cond_tensor_new.clone()
            modified_cond[0, 0] *= (1.0 + pitch)
            modified_cond[0, 1] *= (1.0 + variation)
            new_sample_vector = model_loaded.decoder(z, modified_cond)
            
            new_spectrogram = new_sample_vector.view(N_MELS, TIME_STEPS).cpu().numpy()
            print("Generated new spectrogram from modified conditions.")

            denorm_log_S = new_spectrogram * (max_dB - min_dB) + min_dB

            S = librosa.db_to_power(denorm_log_S)

            # # reconstructed_audio = librosa.feature.inverse.mel_to_audio(S, sr=SR, n_fft=1024, hop_length=256, n_iter=512, power=1.0)
            # reconstructed_audio = librosa.core.spectrum.griffinlim(S, n_fft=1024)\

            S_stft = librosa.feature.inverse.mel_to_stft(S, sr=SR, n_fft=n_fft)

            reconstructed_audio = librosa.core.spectrum.griffinlim(S_stft,
                                                                n_iter=n_iter,
                                                                hop_length=hop_length,
                                                                win_length=n_fft,
                                                                window='hann')
            stereo_audio = np.stack([reconstructed_audio, reconstructed_audio], axis=1)

            output.append(stereo_audio)
    return output

if __name__ == "__main__":
   check_audio()
   load_model()
   generate_samples()