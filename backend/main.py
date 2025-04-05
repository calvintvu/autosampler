import uvicorn
import os
import io
import uuid
import logging

import autoencoder
import tta

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi import Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from contextlib import asynccontextmanager


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

models = {}
in_memory_cache, file_urls = [], []
in_memory_cache2, file_urls2 = [], []
GENERATED_DIR = "./temp_generated_files"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the model
    # models["drums"] = train_autoencoder.load_model()
    models["new_drums"] = autoencoder.load_model("./models/percussion.ts")
    models["tta"], models["tta_processor"] = tta.load_model("./model_cache")
    logger.info("model loaded")

    # create temp dir
    logger.info("making temporary directory")
    os.makedirs(GENERATED_DIR, exist_ok=True)

    yield
    # Clean up the ML models and release the resources
    logger.info("clearing model")
    models.clear()
    in_memory_cache.clear()
    in_memory_cache2.clear()

    # delete temp dir
    import shutil

    shutil.rmtree(f"{GENERATED_DIR}")
    logger.info("clearing temporary directory")


app = FastAPI(lifespan=lifespan)


# Async generator to stream file data in chunks.
async def file_iterator(grid_out, chunk_size=1024 * 1024):
    while True:
        chunk = await grid_out.read(chunk_size)
        if not chunk:
            break
        yield chunk


origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerationResponse(BaseModel):
    file_urls: List[str]


@app.post("/api/generate", response_model=GenerationResponse)
async def generate_audio(file: UploadFile = File(...), variation: float = Form(0.0)):
    print(file)
    input_audio = await file.read()
    audio_file_obj = io.BytesIO(input_audio)

    audio_loaded, sr = autoencoder.load_audio(audio_file_obj)
    output = autoencoder.generate_variations(
        models["new_drums"], audio_loaded, variation
    )
    file_urls.clear()
    for i, o in enumerate(output):
        # write to temp dir
        file_name = f"{uuid.uuid4()}_{i}.wav"
        file_path = os.path.join(GENERATED_DIR, file_name)
        autoencoder.save_audio(o, file_path, sr=44100)
        in_memory_cache.append(f"{file_name}")
        file_urls.append(f"{file_name}")

    return GenerationResponse(file_urls=file_urls)


@app.post("/api/generate2", response_model=GenerationResponse)
async def generate_audio2(text_prompt: str = Form("")):
    if text_prompt is None:
        return

    file_urls2.clear()
    output = tta.generate_sample(
        str(text_prompt), models["tta"], models["tta_processor"]
    )
    file_name = f"{uuid.uuid4()}.wav"
    file_path = os.path.join(GENERATED_DIR, file_name)
    tta.save_audio(file_path, output, models["tta"])
    in_memory_cache2.append(f"{file_name}")
    file_urls2.append(f"{file_name}")

    return GenerationResponse(file_urls=file_urls2)


@app.get("/api/get_audio/{file_name}")
async def get_audio(file_name: str, background_tasks: BackgroundTasks):
    file_path = os.path.join(GENERATED_DIR, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path, media_type="audio/wav", filename=file_name)


@app.get("/api/get_all_audio/")
def get_all_audio():
    return GenerationResponse(file_urls=in_memory_cache)


@app.get("/api/get_all_audio2/")
def get_all_audio2():
    return GenerationResponse(file_urls=in_memory_cache2)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
