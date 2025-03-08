import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState } from "react";

function GenerateButton({ audioFile, fileUrls, setFileUrls }) {
  const [loading, setLoading] = useState(false);
  const showToastErrorMessage = () => {
    toast.error("Sample generation failed!", {
      position: "bottom-right",
    });
  };
  const handleSampleGeneration = async () => {
    // set loading state
    // setFileUrls([]);
    setLoading(true);
    // create request body
    const formData = new FormData();
    formData.append("file", audioFile);
    // call generate samples api
    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        setLoading(false);
        return { showToastErrorMessage };
      }
      // parse and update response
      const data = await response.json();
      setFileUrls(data.file_urls);
      setLoading(false);
      console.log(data.file_urls);
    } catch {
      console.error("Error generating audio samples:", error);
      setLoading(false);
      return { showToastErrorMessage };
    }
  };

  return (
    <div>
      <button
        onClick={handleSampleGeneration}
        disabled={loading}
        style={{ backgroundColor: "blue" }}
      >
        Generate Samples
      </button>
    </div>
  );
}

export default GenerateButton;
