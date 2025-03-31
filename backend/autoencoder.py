import torch
import numpy as np
import librosa
import soundfile as sf

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
device = torch.device("mps" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")


# Load model
def load_model(model_path):
    print(f"Loading pretrained model from {model_path}")

    try:
        model = torch.jit.load(model_path)
        model.eval()
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None


# Load sample
def load_audio(file_path, sr=44100, duration=None):
    print(f"Loading audio from {file_path}")

    try:
        audio, sr = librosa.load(file_path, sr=sr, duration=duration)
        audio_tensor = torch.FloatTensor(audio).to(device)

        if audio_tensor.dim() == 1:
            audio_tensor = audio_tensor.unsqueeze(0).unsqueeze(0)

        print(f"Audio loaded. Shape: {audio_tensor.shape}, Sample rate: {sr}")
        return audio_tensor, sr
    except Exception as e:
        print(f"Error loading audio: {e}")
        return None, None


def generate_variations(model, audio_tensor, variation_amount=0.5, num_variations=2):
    if hasattr(model, "encode") and hasattr(model, "decode"):
        with torch.no_grad():
            latent = model.encode(audio_tensor)

            variations = []
            for i in range(num_variations):
                noise = (
                    torch.randn_like(latent) * variation_amount
                    + torch.randn_like(latent) * 1
                )
                modified_latent = latent + noise

                # Decode the modified latent vector back into audio.
                generated_audio = model.decode(modified_latent)
                variations.append(generated_audio)
            return variations
    else:
        raise AttributeError(
            "The loaded model does not expose encode/decode methods. "
            "Please verify the model's API."
        )


def save_audio(tensor, filename, sr=44100):
    # Convert to numpy and remove extra dimensions
    audio_np = tensor.squeeze().cpu().numpy()
    # Normalize to prevent clipping
    max_val = np.max(np.abs(audio_np))
    if max_val > 1.0:
        audio_np = audio_np / max_val * 0.95

    try:
        audio_np = audio_np.astype("float32")
        sf.write(
            filename,
            np.ravel(audio_np),
            44100,
            format="WAV",
            subtype="PCM_24",
        )
        print(f"Audio saved to {filename}")
        return True
    except Exception as e:
        print(f"Error saving audio: {e}")
        return False


if __name__ == "__main__":
    load_model()
    load_audio()
    generate_variations()
    save_audio()
