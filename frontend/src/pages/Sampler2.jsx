"use client";

import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";
import AudioWaveform from "../components/audio-waveform";
import AudioCarousel from "../components/audio-carousel";
import { Toaster, toast } from "sonner";

// Initial sample generated audio tracks
const apiEndpointURL = import.meta.env.VITE_GET_API_URL;

export default function TextToSpeechPage() {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState([]);
  const [generatedTracks, setGeneratedTracks] = useState([]);
  const [processingResult, setProcessingResult] = useState(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  const handleSampleGeneration = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to convert to audio.");
      return;
    }
    setIsGenerating(true);

    const formData = new FormData();
    formData.append("text_prompt", text);

    try {
      const response = await fetch(`${apiEndpointURL}/api/generate2`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        setIsGenerating(false);
        toast.error("Error generating sample.");
      }

      const data = await response.json();
      setGeneratedAudio(data.file_urls);
      setIsGenerating(false);
    } catch {
      setIsGenerating(false);
      toast.error("Error generating sample.");
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
      try {
        const response = await fetch(`${apiEndpointURL}/api/get_all_audio2`, {
          method: "GET",
        });
        if (!response.ok) {
          // toast.error("Error retrieving samples.");
          return;
        }
        // parse and update response
        const data = await response.json();
        setGeneratedTracks(data.file_urls);
        handleProcessAudio(data);
      } catch {
        // toast.error("Error retrieving samples.");
        return;
      }
    };
    fetchLinks();
  }, [generatedAudio]);

  return (
    <main className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-6xl font-bold mb-6 py-8">
          Text to Sample Generator
        </h1>
        <p className="text-gray-500">Convert text to audio to use as sample.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Text input section */}
        <Card className="p-4 h-[400px] flex flex-col">
          <h2 className="text-lg font-medium mb-3">Enter Text</h2>
          <div className="flex-1 flex flex-col">
            <Textarea
              placeholder="Type or paste text here to convert to audio..."
              className="flex-1 resize-none mb-4 p-3"
              value={text}
              onChange={handleTextChange}
            />
            <Button
              className="w-full"
              onClick={handleSampleGeneration}
              disabled={isGenerating || !text.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Sample
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Audio waveform section */}
        <Card className="p-4 h-[400px] flex flex-col">
          <h2 className="text-lg font-medium mb-3">Generated Sample</h2>
          <div className="flex-1 flex flex-col">
            {generatedAudio ? (
              <div className="flex-1 flex flex-col">
                <div className="border-2 border-dashed border-transparent rounded-lg flex-1 mb-4 flex items-center justify-center">
                  <div className="w-full px-4">
                    <AudioWaveform
                      audioUrl={`${apiEndpointURL}/api/get_audio/${generatedAudio[0]}`}
                      height={150}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No audio generated yet</p>
                  <p className="text-sm">
                    Enter text and click Generate to create audio
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom carousel */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Recently Generated Samples
        </h2>
        <AudioCarousel tracks={generatedTracks} />
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
    </main>
  );
}
