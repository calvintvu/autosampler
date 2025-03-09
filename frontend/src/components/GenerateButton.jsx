import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useCallback, useState, useRef, useEffect } from "react";

function GenerateButton({
  audioFile,
  fileUrls,
  setFileUrls,
  setAllFileUrls,
  count,
  setCount,
}) {
  const apiEndpointURL = import.meta.env.VITE_GET_API_URL;
  const [loading, setLoading] = useState(false);
  const showToastErrorMessage = () => {
    toast.error("Sample generation failed! File cannot be read.", {
      position: "bottom-right",
    });
  };
  const handleSampleGeneration = async () => {
    // set loading state
    setLoading(true);
    // create request body
    const formData = new FormData();
    formData.append("file", audioFile);
    // call generate samples api
    try {
      const response = await fetch(`${apiEndpointURL}/api/generate`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        setLoading(false);
        showToastErrorMessage();
      }
      // parse and update response
      const data = await response.json();
      setFileUrls(data.file_urls);
      setLoading(false);
      setCount(count + 1);
    } catch {
      setLoading(false);
      showToastErrorMessage();
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
            return { showToastErrorMessage };
          }
          // parse and update response
          const data = await response.json();
          console.log(data.file_urls);
          setAllFileUrls(data.file_urls);
        } catch {
          console.error("Error retrieving audio samples:", error);
          return { showToastErrorMessage };
        }
      }
    };
    fetchLinks();
  }, [fileUrls]);

  return (
    <div>
      <button
        onClick={handleSampleGeneration}
        disabled={loading}
        style={{ backgroundColor: "blue" }}
      >
        Generate Samples
      </button>
      <ToastContainer />
    </div>
  );
}

export default GenerateButton;
