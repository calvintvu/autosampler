import React, { useCallback, useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import Hover from "wavesurfer.js/dist/plugins/hover.js";
import axios from "axios";

function RecentlyGenerated({
  audioFileURL,
  fileUrls,
  allFileUrls,
  setAllFileUrls,
}) {
  const apiEndpointURL = import.meta.env.VITE_GET_API_URL;
  // reference to audio player
  const wavesurferRef = useRef(null);

  // reference to audio waveform
  const waveformRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      // start sample playback from beginning
      wavesurferRef.current.seekTo(0);
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSampleDownload = async () => {
    try {
      // make call to API
      const response = await axios.get(
        `${apiEndpointURL}/api/get_audio/${audioFileURL}`,
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
    if (audioFileURL && allFileUrls.length > 0) {
      // retrieve audio file from API using URL
      if (!wavesurferRef.current) {
        wavesurferRef.current = WaveSurfer.create({
          container: waveformRef.current, // div container for waveform
          waveColor: "#999",
          progressColor: "#555",
          cursorColor: "#ffffff",
          backend: "WebAudio",
          height: 32,
          width: 400,
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
      }
      wavesurferRef.current.load(
        `${apiEndpointURL}/api/get_audio/${audioFileURL}`
      );
    }
  }, [audioFileURL, fileUrls, allFileUrls]);

  return (
    <div>
      <div>
        <div style={{ padding: "7px" }}></div>
        {audioFileURL && (
          <div>
            <div ref={waveformRef} onClick={handlePlayPause} />
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

export default RecentlyGenerated;
