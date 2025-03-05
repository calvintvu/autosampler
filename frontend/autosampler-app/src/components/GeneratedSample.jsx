import React, { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline";
import Hover from "wavesurfer.js/dist/plugins/hover";

function GeneratedSample({ index }) {
  // reference to audio player
  const wavesurferRef = useRef(null);

  // reference to audio waveform
  const waveformRef = useRef(null);
  return (
    <div
      style={{
        marginRight: "100px",
        border: "3px solid  #ffffff",
        borderRadius: "1px",
        textAlign: "center",
        marginBottom: "1rem",
        cursor: "pointer",
        height: "100px",
        width: "300px",
      }}
    >
      Generated Sample {index}
    </div>
  );
}

export default GeneratedSample;
