from transformers import AutoProcessor, MusicgenForConditionalGeneration
import scipy
from huggingface_hub import snapshot_download
import os

# Define a local cache directory for the model
cache_dir = "./model_cache"

if os.path.isdir(cache_dir):
    print("Directory exists")
else:
    print("Directory does not exist")
    snapshot_download(repo_id="facebook/musicgen-small", local_dir=cache_dir)


def load_model(path):
    print(f"Loading pretrained model from {path}")
    processor = AutoProcessor.from_pretrained(path)
    model = MusicgenForConditionalGeneration.from_pretrained(path)

    return model, processor


def generate_sample(prompt, model, processor):
    inputs = processor(
        text=[prompt],
        padding=True,
        return_tensors="pt",
    )

    audio_values = model.generate(**inputs, max_new_tokens=256)
    return audio_values


def save_audio(path, audio_values, model):
    sampling_rate = model.config.audio_encoder.sampling_rate
    scipy.io.wavfile.write(path, rate=sampling_rate, data=audio_values[0, 0].numpy())


if __name__ == "__main__":
    load_model()
    generate_sample()
    save_audio()
