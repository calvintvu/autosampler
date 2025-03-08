import React, { useCallback, useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline";
import Hover from "wavesurfer.js/dist/plugins/hover";
import axios from "axios";

function GeneratedSample({ index, audioFileURL }) {
  // reference to audio player
  const wavesurferRef = useRef(null);

  // reference to audio waveform
  const waveformRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSampleDownload = async () => {
    try {
      // make call to API
      const response = await axios.get(
        `http://127.0.0.1:8000/api/get_audio/${audioFileURL}`,
        { responseType: "blob" }
      );

      // create blob from response and create a temp URL
      const audioBlob = new Blob([response.data], { type: "audio/wav" });
      const url = window.URL.createObjectURL(audioBlob);

      // create download link and trigger it
      const tempLink = document.createElement("a");
      tempLink.href = url;
      tempLink.setAttribute("download", `${audioFileURL}`);
      document.body.appendChild(tempLink);
      tempLink.click();

      // clean up
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading sample: ", error);
    }
  };

  useEffect(() => {
    if (audioFileURL) {
      console.log(index + audioFileURL);

      // retrieve audio file from API using URL
      if (!wavesurferRef.current) {
        wavesurferRef.current = WaveSurfer.create({
          container: waveformRef.current, // div container for waveform
          waveColor: "#999",
          progressColor: "#555",
          cursorColor: "#ffffff",
          backend: "WebAudio",
          plugins: [
            Timeline.create({
              container: "#wave-timeline",
              primaryColor: "#ffffff",
              secondaryColor: "#ffffff",
              primaryFontColor: "#ffffff",
              secondaryFontColor: "#ffffff",
            }),
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
      }
      wavesurferRef.current.load(
        `http://127.0.0.1:8000/api/get_audio/${audioFileURL}`
      );
    }
  }, [audioFileURL]);
  return (
    <div>
      <div
        style={{
          marginRight: "100px",
          border: "3px solid  #ffffff",
          borderRadius: "1px",
          textAlign: "center",
          marginBottom: "1rem",
          cursor: "pointer",
          height: "200px",
          width: "275px",
        }}
      >
        <div style={{ padding: "7px" }}>Generated Sample {index}</div>
        {audioFileURL && (
          <div>
            <div ref={waveformRef} onClick={handlePlayPause} />
            <div id="wave-timeline" />
            <button
              style={{ fontSize: "12px", padding: "5px 5px" }}
              onClick={handleSampleDownload}
            >
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GeneratedSample;
