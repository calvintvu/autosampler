import uvicorn
import os
import io
import uuid
import logging
import tempfile

import autoencoder
import tta

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
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

    # clear database
    logger.info("clearing database")
    collections = await db.list_collection_names()
    for coll in collections:
        await db.drop_collection(coll)


app = FastAPI(lifespan=lifespan)

# MongoDB connection URI; adjust if needed.
MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")
# Create a Motor client and select a database.
client = AsyncIOMotorClient(MONGO_DETAILS)
db = client.samples_db
# Set up GridFS bucket
fs = AsyncIOMotorGridFSBucket(db)


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
        # sf.write(file_path, o, 44100, "PCM_24")
        autoencoder.save_audio(o, file_path, sr=44100)
        in_memory_cache.append(f"{file_name}")
        file_urls.append(f"{file_name}")

        # add output files to database
        with open(file_path, "rb") as f:
            file_data = f.read()
        stream = io.BytesIO(file_data)
        file_id = await fs.upload_from_stream(
            file_name,
            stream,
            metadata={"content_type": "audio/wav", "unique_key": file_name},
        )
        print(file_id)
        os.remove(file_path)

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

    # add output files to database
    with open(file_path, "rb") as f:
        file_data = f.read()
    stream = io.BytesIO(file_data)
    file_id = await fs.upload_from_stream(
        file_name,
        stream,
        metadata={"content_type": "audio/wav", "unique_key": file_name},
    )
    print(file_id)
    os.remove(file_path)
    return GenerationResponse(file_urls=file_urls2)


@app.get("/api/get_audio/{file_name}")
async def get_audio(file_name: str, background_tasks: BackgroundTasks):
    file_doc = await db.fs.files.find_one({"metadata.unique_key": file_name})
    if file_doc is None:
        print("unique key not found")
        raise HTTPException(status_code=404, detail="File not found.")
    file_id = file_doc["_id"]
    try:
        print("id not found")
        grid_out = await fs.open_download_stream(file_id)
    except Exception:
        print("exception", Exception)
        raise HTTPException(status_code=404, detail="File not found.")
    # Read the entire file data into memory.
    file_data = await grid_out.read()

    # Create a temporary file to write the audio data.
    # Using the original file extension if available.
    filename, file_ext = os.path.splitext(file_doc["filename"])
    suffix = file_ext if file_ext else ".tmp"
    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp_file.write(file_data)
    tmp_file.close()

    # Get the media type from metadata (default to 'audio/mpeg' if not available).
    media_type = grid_out.metadata.get("content_type", "audio/wav")

    # Define a cleanup task to remove the temporary file after response is sent.
    def cleanup_file(path: str):
        os.remove(path)

    background_tasks.add_task(cleanup_file, tmp_file.name)
    test_response = FileResponse(
        path=tmp_file.name, media_type=media_type, filename=filename
    )

    print("test response ", test_response.path)
    return test_response


@app.get("/api/get_all_audio/")
def get_all_audio():
    return GenerationResponse(file_urls=in_memory_cache)


@app.get("/api/get_all_audio2/")
def get_all_audio2():
    return GenerationResponse(file_urls=in_memory_cache2)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
