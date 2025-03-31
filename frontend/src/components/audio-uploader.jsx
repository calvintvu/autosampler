import { useCallback, useRef, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AudioWaveform from "./audio-waveform";
import AudioControls from "./audio-controls";
import { Toaster, toast } from "sonner";

export default function AudioUploader({
  file,
  audioUrl,
  onFileChange,
  setGeneratedFileUrls,
  generatedFileUrls,
  allFileUrls,
  setAllFileUrls,
}) {
  const fileInputRef = useRef(null);
  const [processingResult, setProcessingResult] = useState(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 megabytes

  // Audio file to send over API
  const [audioFile, setAudioFile] = useState(null);

  useEffect(() => {
    setProcessingResult(null);
  }, [file]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const audioFile = acceptedFiles[0];
        console.log("uploading file!");
        onFileChange(audioFile);
        setAudioFile(audioFile);
        setProcessingResult(null);
      } else {
        toast.error(
          "Audio upload failed! Make sure to upload only audio files no more than 5MB."
        );
      }
    },
    [onFileChange]
  );

  // Only use dropzone for initial upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: {
      "audio/*": [],
    },
    maxFiles: 1,
    // Disable dropzone when a file is already uploaded
    disabled: !!file,
  });

  // Handle file change via button
  const handleChangeFile = (e) => {
    e.stopPropagation();
    setProcessingResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProcessingResult(null);
      onFileChange(e.target.files[0]);
    }
  };

  const handleProcessAudio = (result) => {
    setProcessingResult(result);
    if (processingResult) {
      toast("Audio processed successfully! Added to your library.");
    }
  };

  return (
    <Card className="p-4 h-[400px] flex flex-col">
      <div className="flex-1 flex flex-col">
        {!file ? (
          // Initial upload state - use dropzone
          <div
            {...getRootProps()}
            className={`border-2 border-dashed ${
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300"
            } rounded-lg p-12 h-full flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Upload an audio file</p>
            <p className="text-sm text-gray-500 mt-2">
              {isDragActive
                ? "Drop the audio file here"
                : "Drag and drop an audio file, or click to browse"}
            </p>
            <Button className="mt-4">Select File</Button>
          </div>
        ) : (
          // File uploaded state - disable dropzone
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium truncate">{file.name}</h2>
              <Button variant="outline" size="sm" onClick={handleChangeFile}>
                Change File
              </Button>
              {/* Hidden file input for the Change File button */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="audio/*"
                onChange={handleFileInputChange}
              />
            </div>

            {/* Waveform area - NOT a dropzone */}
            <div className="border-2 border-dashed border-transparent rounded-lg h-[140px] mb-4">
              <div className="h-full flex items-center justify-center">
                <AudioWaveform audioUrl={audioUrl} height={120} />
              </div>
            </div>

            {/* Display processing result if available */}

            {/* Controls section */}
            <AudioControls
              audioFile={audioFile}
              setGeneratedFileUrls={setGeneratedFileUrls}
              generatedFileUrls={generatedFileUrls}
              allFileUrls={allFileUrls}
              setAllFileUrls={setAllFileUrls}
              onProcessAudio={handleProcessAudio}
            />
          </div>
        )}
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
    </Card>
  );
}
