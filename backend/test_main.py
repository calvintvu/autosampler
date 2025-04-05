import os
import io
import pytest
import shutil
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import numpy as np
from main import app, GENERATED_DIR

client = TestClient(app)

# Mock data and functions
mock_audio_data = b"mock audio data"
mock_file_name = "mock_file.wav"
mock_uuid = "12345678-1234-5678-1234-567812345678"


@pytest.fixture(scope="module")
def setup_temp_dir():
    """Create temporary directory for test files."""
    os.makedirs(GENERATED_DIR, exist_ok=True)
    yield
    # Clean up after tests
    if os.path.exists(GENERATED_DIR):
        shutil.rmtree(GENERATED_DIR)


@pytest.fixture
def mock_models():
    with patch("main.models") as mock_models:
        mock_models["new_drums"] = MagicMock()
        mock_models["tta"] = MagicMock()
        mock_models["tta_processor"] = MagicMock()
        yield mock_models


@pytest.fixture
def mock_uuid4():
    with patch("uuid.uuid4", return_value=mock_uuid):
        yield


@pytest.fixture
def mock_audio_functions():
    with (
        patch("autoencoder.load_audio") as mock_load_audio,
        patch("autoencoder.generate_variations") as mock_generate_variations,
        patch("autoencoder.save_audio") as mock_save_audio,
    ):
        # Setup mock return values
        mock_load_audio.return_value = (np.zeros((44100,)), 44100)
        mock_generate_variations.return_value = [np.zeros((44100,))]

        yield {
            "load_audio": mock_load_audio,
            "generate_variations": mock_generate_variations,
            "save_audio": mock_save_audio,
        }


@pytest.fixture
def mock_tta_functions():
    with (
        patch("tta.generate_sample") as mock_generate_sample,
        patch("tta.save_audio") as mock_save_audio,
    ):
        # Setup mock return values
        mock_generate_sample.return_value = np.zeros((44100,))

        yield {"generate_sample": mock_generate_sample, "save_audio": mock_save_audio}


def test_generate_audio(mock_models, mock_uuid4, mock_audio_functions):
    # Create test file
    test_file = io.BytesIO(mock_audio_data)

    # Test the endpoint
    response = client.post(
        "/api/generate",
        files={"file": ("test.wav", test_file, "audio/wav")},
        data={"variation": 0.5},
    )

    # Assert response status and content
    assert response.status_code == 200
    assert response.json() == {"file_urls": [f"{mock_uuid}_0.wav"]}

    # Verify function calls
    mock_audio_functions["load_audio"].assert_called_once()
    mock_audio_functions["generate_variations"].assert_called_once_with(
        mock_models["new_drums"],
        mock_audio_functions["load_audio"].return_value[0],
        0.5,
    )
    mock_audio_functions["save_audio"].assert_called_once()


def test_generate_audio2(mock_models, mock_uuid4, mock_tta_functions):
    # Test data
    test_prompt = "test prompt"

    # Test the endpoint
    response = client.post("/api/generate2", data={"text_prompt": test_prompt})

    # Assert response status and content
    assert response.status_code == 200
    assert response.json() == {"file_urls": [f"{mock_uuid}.wav"]}

    # Verify function calls
    mock_tta_functions["generate_sample"].assert_called_once_with(
        test_prompt, mock_models["tta"], mock_models["tta_processor"]
    )
    mock_tta_functions["save_audio"].assert_called_once()


def test_get_audio(setup_temp_dir):
    # Actually create the mock file
    file_path = os.path.join(GENERATED_DIR, mock_file_name)

    try:
        # Create the directory and file
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(mock_audio_data)

        # Test the endpoint
        response = client.get(f"/api/get_audio/{mock_file_name}")
        assert response.status_code == 200
    finally:
        # Clean up after test
        if os.path.exists(file_path):
            os.remove(file_path)


def test_get_audio_not_found():
    # Test with a non-existent file
    non_existent_file = "non_existent_file.wav"
    response = client.get(f"/api/get_audio/{non_existent_file}")
    assert response.status_code == 404
    assert response.json() == {"detail": "File not found"}


def test_get_all_audio():
    # Setup test data
    test_files = ["file1.wav", "file2.wav"]
    with patch("main.in_memory_cache", test_files):
        response = client.get("/api/get_all_audio/")
        assert response.status_code == 200
        assert response.json() == {"file_urls": test_files}


def test_get_all_audio2():
    # Setup test data
    test_files = ["file1.wav", "file2.wav"]
    with patch("main.in_memory_cache2", test_files):
        response = client.get("/api/get_all_audio2/")
        assert response.status_code == 200
        assert response.json() == {"file_urls": test_files}


# Note about the asyncio test
# To run this test properly, install pytest-asyncio with: pip install pytest-asyncio
@pytest.mark.asyncio
async def test_lifespan():
    # Mock required functions
    with (
        patch("os.makedirs") as mock_makedirs,
        patch("autoencoder.load_model") as mock_load_model,
        patch("tta.load_model") as mock_tta_load_model,
        patch("shutil.rmtree") as mock_rmtree,
        patch("main.models", {}) as mock_models,
        patch("main.in_memory_cache", []) as mock_cache,
        patch("main.in_memory_cache2", []) as mock_cache2,
    ):
        # Setup mock returns
        mock_load_model.return_value = "model"
        mock_tta_load_model.return_value = ("tta_model", "tta_processor")

        # Test lifespan context manager
        from main import lifespan

        app_mock = MagicMock()
        async with lifespan(app_mock):
            # Check startup operations
            mock_makedirs.assert_called_once_with(
                "./temp_generated_files", exist_ok=True
            )
            mock_load_model.assert_called_once_with("./models/percussion.ts")
            mock_tta_load_model.assert_called_once_with("./model_cache")
            assert mock_models["new_drums"] == "model"
            assert mock_models["tta"] == "tta_model"
            assert mock_models["tta_processor"] == "tta_processor"

        # Check shutdown operations
        mock_rmtree.assert_called_once_with("./temp_generated_files")
        assert len(mock_models) == 0
        assert len(mock_cache) == 0
        assert len(mock_cache2) == 0
