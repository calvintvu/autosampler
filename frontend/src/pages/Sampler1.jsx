import { useState, useEffect } from "react";
import AudioUploader from "@/components/audio-uploader";
import SampleTracks from "@/components/sample-tracks";
import AudioCarousel from "@/components/audio-carousel";

// Sample audio tracks
const sampleTracks = ["1", "2"];

const apiEndpointURL = import.meta.env.VITE_GET_API_URL;

export default function AudioWaveformPage() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState("");

  // URLs to generated samples
  const [generatedFileUrls, setGeneratedFileUrls] = useState(sampleTracks);

  // URLs to ALL generated samples -> make a recently generated list
  const [allFileUrls, setAllFileUrls] = useState([]);

  // On page load/refresh, query all samples generated
  useEffect(() => {
    const onPageLoad = async () => {
      try {
        const response = await fetch(`${apiEndpointURL}/api/get_all_audio`, {
          method: "GET",
        });
        if (!response.ok) {
          console.log("error getting all");
          return;
        }
        const data = await response.json();
        // console.log(data.file_urls);
        setAllFileUrls(data.file_urls);
      } catch {
        console.log("error getting all");
        return;
      }
    };

    // Immediately invoke the async function
    onPageLoad();
  }, []);

  const handleFileChange = (file) => {
    // Revoke previous URL to avoid memory leaks
    if (uploadedAudioUrl) {
      URL.revokeObjectURL(uploadedAudioUrl);
    }

    setUploadedFile(file);

    // Create a URL for the uploaded file
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedAudioUrl(url);
    } else {
      setUploadedAudioUrl("");
    }
  };

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <h1 className="text-6xl font-bold mb-6 py-8">Drum Sample Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main upload section */}
        <div className="lg:col-span-2">
          <div className="mb-3">
            <h2 className="text-3xl font-semibold">
              Upload Your Drum Sample File
            </h2>
            <p className="text-gray-500">
              Upload a drum sample file and generate variations of your sample
              using AI.
            </p>
          </div>

          <AudioUploader
            file={uploadedFile}
            audioUrl={uploadedAudioUrl}
            onFileChange={handleFileChange}
            generatedFileUrls={generatedFileUrls}
            setGeneratedFileUrls={setGeneratedFileUrls}
            allFileUrls={allFileUrls}
            setAllFileUrls={setAllFileUrls}
          />
        </div>
        {/* Right side waveforms */}
        <SampleTracks tracks={generatedFileUrls.slice(0, 2)} />
      </div>

      {/* Bottom carousel */}
      {generatedFileUrls.length > 0 && (
        <div className="mt-8 py-8">
          <h2 className="text-xl font-semibold mb-4">
            Recently Generated Samples
          </h2>
          <AudioCarousel tracks={allFileUrls} />
        </div>
      )}
    </main>
  );
}
