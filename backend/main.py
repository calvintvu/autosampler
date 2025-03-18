import uvicorn
import os
import io
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import logging
import soundfile as sf

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


from contextlib import asynccontextmanager

import train_autoencoder

models = {}
in_memory_cache, file_urls = [], []
GENERATED_DIR = "./temp_generated_files"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the model
    models["drums"] = train_autoencoder.load_model()
    logger.info("model loaded")

    # create temp dir
    logger.info("making temporary directory")
    os.makedirs(GENERATED_DIR, exist_ok=True)
    
    yield
    # Clean up the ML models and release the resources
    logger.info("clearing model")
    models.clear()
    in_memory_cache.clear()

    # delete temp dir
    import shutil
    shutil.rmtree(f'{GENERATED_DIR}')
    logger.info("clearing temporary directory")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerationResponse(BaseModel):
    file_urls: List[str]

@app.post("/api/generate", response_model=GenerationResponse)
async def generate_audio(file: UploadFile = File(...), pitch: float=0.0, variation: float=0.0):
    print(file)
    input_audio = await file.read()
    audio_file_obj = io.BytesIO(input_audio)

    # first check if audio file is even  valid
    # valid = train_autoencoder.check_audio(audio_file_obj)
    # if not valid:
    #     raise HTTPException(status_code=500, detail="File is invalid!")

    output = train_autoencoder.generate_samples(audio_file_obj, models["drums"], pitch, variation)
    file_urls.clear()
    for i, o in enumerate(output):
        # write to temp dir
        file_name = f"{uuid.uuid4()}_{i}.wav"
        file_path = os.path.join(GENERATED_DIR, file_name)
        sf.write(file_path, o, 44100, 'PCM_24')
        in_memory_cache.append(f"{file_name}")
        file_urls.append(f"{file_name}")

    return GenerationResponse(file_urls=file_urls)

@app.get("/api/get_audio/{file_name}")
def get_audio(file_name: str):
    file_path = os.path.join(GENERATED_DIR, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path, media_type="audio/wav", filename=file_name)

@app.get("/api/get_all_audio/")
def get_all_audio():
    return GenerationResponse(file_urls=in_memory_cache)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
