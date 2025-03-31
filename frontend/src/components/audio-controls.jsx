import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toaster, toast } from "sonner";

export default function AudioControls({
  audioFile,
  setGeneratedFileUrls,
  generatedFileUrls,
  setAllFileUrls,
  onProcessAudio,
}) {
  const [speed, setSpeed] = useState(0);
  const [loading, setLoading] = useState(false);

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
      console.log(data.file_urls);
      console.log("end of handle sample generation.");
      //   setGeneratedFileUrls(data.file_urls);
      setLoading(false);
      setGeneratedFileUrls(data.file_urls);
      console.log(generatedFileUrls);
    } catch {
      setLoading(false);
      toast.error("Error generating samples.");
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
  }, [generatedFileUrls]);

  return (
    <div>
      <Button
        onClick={handleSampleGeneration}
        disabled={loading}
        className="w-full"
      >
        Generate Samples
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
