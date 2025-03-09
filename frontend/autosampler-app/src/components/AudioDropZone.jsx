import React, { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import WaveSurfer from "wavesurfer.js";
import Hover from "wavesurfer.js/dist/plugins/hover";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AudioDropZone({ audioFile, setAudioFile }) {
  // max file upload size
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 megabytes

  const [isPlaying, setIsPlaying] = useState(false);

  // reference to audio player
  const wavesurferRef = useRef(null);

  // reference to audio waveform
  const waveformRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    // update audio file
    console.log("Updating audio file");
    if (acceptedFiles && acceptedFiles.length > 0) {
      setAudioFile(acceptedFiles[0]);
    } else {
      showToastWarnMessage();
    }
  }, []);

  const showToastWarnMessage = () => {
    toast.warn(
      "Audio upload failed! Make sure to upload only audio files no more than 2MB.",
      {
        position: "bottom-right",
      }
    );
  };

  const showToastErrorMessage = () => {
    toast.error("File cannot be read!", {
      position: "bottom-right",
    });
  };

  // Configure react-dropzone to accept only audio
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: {
      "audio/*": [], // Accept any audio type
    },
    multiple: false, // Limit to one file at a time
  });

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      // start sample playback from beginning
      wavesurferRef.current.seekTo(0);
      wavesurferRef.current.playPause();
      console.log("clicking waveform");
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (audioFile) {
      // create new instance if null
      if (!wavesurferRef.current) {
        wavesurferRef.current = WaveSurfer.create({
          container: waveformRef.current, // div container for waveform
          waveColor: "#999",
          progressColor: "#555",
          cursorColor: "#ffffff",
          backend: "WebAudio",
          normalize: true,
          plugins: [
            Hover.create({
              lineColor: "red",
              lineWidth: 2,
              labelContainer: true,
            }),
          ],
        });

        wavesurferRef.current.on("ready", () => {
          setIsPlaying(false);
          console.log("Audio is ready to play");
        });

        wavesurferRef.current.on("finish", () => {
          setIsPlaying(false);
          wavesurferRef.current.seekTo(0); // reset to the beginning
        });
      } else {
        // clear old reference
        wavesurferRef.current.empty();
      }

      // read file and load it as a blob

      const reader = new FileReader();
      reader.onload = (event) => {
        const audioData = event.target.result;
        // load blob array buffer
        wavesurferRef.current.loadBlob(new Blob([audioData]));
      };
      reader.readAsArrayBuffer(audioFile);
    }
  }, [audioFile]);

  return (
    <div>
      {/* Drag-and-Drop Area */}
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        <input {...getInputProps()} />
        {audioFile ? (
          <p>Drag and drop to replace file here, or click to browse file</p>
        ) : (
          <p>Drag and drop audio file here, or click to browse file</p>
        )}
      </div>
      <div
        style={{
          border: "3px solid  #ffffff",
          borderRadius: "1px",
          textAlign: "center",
          marginBottom: "1rem",
          cursor: "pointer",
        }}
      >
        {audioFile && (
          <div>
            <div ref={waveformRef} onClick={handlePlayPause} />
            <div className="flex items-center gap-4 p-4">
              <button
                onClick={handlePlayPause}
                className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors flex items-center justify-center w-8 h-8"
                aria-label="Play"
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "100px",
                  alignItems: "center",
                  borderWidth: 1,
                  padding: "10px",
                  marginBottom: "0.5rem",
                  backgroundColor: "white",
                }}
              ></button>
              <span
                style={{ fontSize: "12px", padding: "15px 15px 15px 15px" }}
                className="text-lg"
              >
                {audioFile.name}
              </span>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default AudioDropZone;
