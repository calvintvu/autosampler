import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toaster, toast } from "sonner";
import { Loader2, Wand2 } from "lucide-react";

export default function AudioControls({
  audioFile,
  setGeneratedFileUrls,
  setAllFileUrls,
  onProcessAudio,
}) {
  const [speed, setSpeed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);

  const apiEndpointURL = import.meta.env.VITE_GET_API_URL;

  const handleSampleGeneration = async () => {
    // // set loading state
    setLoading(true);
    // // create request body
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("variation", speed);

    console.log(audioFile.audioFile);
    // // call generate samples api
    try {
      const response = await fetch(`${apiEndpointURL}/api/generate`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        setLoading(false);
        toast.error("Error generating samples.");
      }
      // parse and update response
      const data = await response.json();
      if (onProcessAudio) {
        onProcessAudio(data);
      }
      setLoading(false);
      setGeneratedFileUrls(data.file_urls);
      handleProcessAudio(data);
    } catch {
      setLoading(false);
      toast.error("Error generating samples.");
    }
  };

  const handleProcessAudio = (result) => {
    setProcessingResult(result);
    if (processingResult) {
      toast("Audio processed successfully! Added to your library.");
    }
  };

  useEffect(() => {
    const fetchLinks = async () => {
      if (audioFile) {
        try {
          const response = await fetch(`${apiEndpointURL}/api/get_all_audio`, {
            method: "GET",
          });
          if (!response.ok) {
            console.log("error getting all");
            toast.error("Error retrieving samples.");
          }
          // parse and update response
          const data = await response.json();
          console.log(data.file_urls);
          setAllFileUrls(data.file_urls);
        } catch {
          console.log("error getting all");
          toast.error("Error retrieving samples.");
        }
      }
    };
    fetchLinks();
  }, [audioFile, setAllFileUrls]);

  return (
    <div>
      <Button
        className="w-full"
        onClick={handleSampleGeneration}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Samples
          </>
        )}
      </Button>

      {/* Two sliders stacked vertically */}
      <div className="mt-4 space-y-4">
        {/* <div className="space-y-1">
          <div className="flex justify-between">
            <label htmlFor="volume-slider" className="text-sm font-medium">
              Volume
            </label>
            <span className="text-sm text-gray-500">{volume}%</span>
          </div>
          <Slider
            id="volume-slider"
            defaultValue={[volume]}
            max={100}
            step={1}
            className="w-full"
            onValueChange={(value) => setVolume(value[0])}
          />
        </div> */}

        <div className="space-y-1 pt-10">
          <div className="flex justify-between">
            <label htmlFor="speed-slider" className="text-sm font-medium">
              Variation
            </label>
            <span className="text-sm text-gray-500">
              {(speed / 100).toFixed(1)}
            </span>
          </div>
          <Slider
            id="speed-slider"
            defaultValue={[speed]}
            min={0}
            max={100}
            step={10}
            className="w-full pt-6"
            onValueChange={(value) => setSpeed(value[0])}
          />
        </div>
      </div>
      <Toaster
        toastOptions={{
          style: {
            background: "black",
            color: "white",
            fontSize: "1.25rem",
            padding: "1rem",
          },
        }}
      />
    </div>
  );
}
