import { useState } from "react";
import React from "react";
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline";
import Hover from "wavesurfer.js/dist/plugins/hover";

import "./App.css";

import AudioDropZone from "./components/AudioDropZone";
import Slider from "./components/Slider";
import GeneratedSample from "./components/GeneratedSample";
import GenerateButton from "./components/GenerateButton";

function App() {
  // current audio file for sample inference
  const [audioFile, setAudioFile] = useState(null);

  // parameters for inference
  const [pitchSliderValue, setPitchSliderValue] = useState(0.0);
  const [variationSliderValue, setVariationSliderValue] = useState(0.0);

  // URLs to generated samples
  const [fileUrls, setFileUrls] = useState([]);

  // loading state for generating samples
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div style={{ display: "flex", padding: "50px", flexDirection: "row" }}>
        <div style={{ marginRight: "100px" }}>
          <h2>Place Sample Here</h2>
          <AudioDropZone audioFile={audioFile} setAudioFile={setAudioFile} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
          }}
        >
          <div>
            <GeneratedSample index={1} audioFileURL={fileUrls[0]} />
          </div>
          <div>
            <GeneratedSample index={2} audioFileURL={fileUrls[1]} />
          </div>
          <div>
            <GeneratedSample index={3} audioFileURL={fileUrls[2]} />
          </div>
          <div>
            <GeneratedSample index={4} audioFileURL={fileUrls[3]} />
          </div>
        </div>
      </div>
      <div>
        {/* Pitch Shift Value Slider */}
        <div style={{ marginLeft: "50px" }}>
          Pitch Shift
          <Slider
            sliderValue={pitchSliderValue}
            setSliderValue={setPitchSliderValue}
          />
        </div>
      </div>
      <div>
        {/* Variation Value Slider */}
        <div style={{ marginLeft: "50px" }}>
          Variation
          <Slider
            sliderValue={variationSliderValue}
            setSliderValue={setVariationSliderValue}
          />
        </div>
      </div>
      <div style={{ marginLeft: "50px" }}>
        {
          <GenerateButton
            audioFile={audioFile}
            fileUrls={fileUrls}
            setFileUrls={setFileUrls}
          />
        }
      </div>
    </>
  );
}

export default App;
