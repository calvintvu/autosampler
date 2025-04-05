import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import Hover from "wavesurfer.js/dist/plugins/hover.js";
import { useAppContext } from "../contexts/ThemeContext";

export default function AudioWaveform({ audioUrl, height = 128 }) {
  const { volume } = useAppContext();
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    // Clean up previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    setIsLoading(true);

    // Create new WaveSurfer instance
    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#4f46e5",
      progressColor: "#818cf8",
      cursorColor: "#6366f1",
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height,
      barGap: 2,
      responsive: true,
      plugins: [
        Hover.create({
          lineColor: "red",
          lineWidth: 2,
          labelContainer: true,
        }),
      ],
    });

    // Listen for errors during the load process
    wavesurferRef.current.on("error", (err) => {
      console.error("WaveSurfer error:", err);
    });

    // Load audio
    wavesurferRef.current.load(audioUrl);

    // Set up event listeners
    wavesurferRef.current.on("ready", () => {
      setDuration(wavesurferRef.current.getDuration());
      setIsLoading(false);
      wavesurferRef.current.setVolume(volume / 100);
    });

    wavesurferRef.current.on("audioprocess", () => {
      setCurrentTime(wavesurferRef.current.getCurrentTime());
    });

    wavesurferRef.current.on("play", () => setIsPlaying(true));
    wavesurferRef.current.on("pause", () => setIsPlaying(false));
    wavesurferRef.current.on("finish", () => {
      setIsPlaying(false);
      wavesurferRef.current.seekTo(0);
    });

    // Clean up
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioUrl, height, volume]);

  useEffect(() => {
    const handleVolumeChange = (event) => {
      if (wavesurferRef.current) {
        const newVolume = event.detail.volume / 100;
        wavesurferRef.current.setVolume(newVolume);
      }
    };

    window.addEventListener("app-volume-change", handleVolumeChange);

    return () => {
      window.removeEventListener("app-volume-change", handleVolumeChange);
    };
  }, []);

  // Update volume when the volume prop changes
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(volume / 100);
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (!wavesurferRef.current) return;

    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      wavesurferRef.current.play();
    }
  };

  const handleDownload = () => {
    // Create an anchor element
    const anchor = document.createElement("a");
    anchor.href = audioUrl;

    // Extract filename from URL or use a default name
    const filename = audioUrl.split("/").pop() || "audio-download.mp3";
    anchor.download = filename;

    // Trigger download
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="w-full">
      <div
        ref={waveformRef}
        className={`w-full ${isLoading ? "opacity-50" : "opacity-100"}`}
      />

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="h-8 w-8"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={isLoading}
            className="h-8 w-8 ml-1"
            title="Download audio"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}
