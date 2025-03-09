import { useState } from "react";
import React from "react";
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline";
import Hover from "wavesurfer.js/dist/plugins/hover";

import "./styles/App.css";

import AudioDropZone from "./components/AudioDropZone";
import Slider from "./components/Slider";
import GeneratedSample from "./components/GeneratedSample";
import GenerateButton from "./components/GenerateButton";
import RecentlyGenerated from "./components/RecentlyGenerated";
import InfoHeaders from "./components/InfoHeaders";

function App() {
  // current audio file for sample inference
  const [audioFile, setAudioFile] = useState(null);

  // parameters for inference
  const [pitchSliderValue, setPitchSliderValue] = useState(0.0);
  const [variationSliderValue, setVariationSliderValue] = useState(0.0);

  // URLs to generated samples
  const [fileUrls, setFileUrls] = useState([]);

  // URLs to ALL generated samples -> make a recently generated list
  const [allFileUrls, setAllFileUrls] = useState([]);

  // loading state for generating samples
  const [loading, setLoading] = useState(false);

  // counter to signal showing recently generated samples
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <InfoHeaders />
      </div>
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
        {audioFile && (
          <div>
            <GenerateButton
              audioFile={audioFile}
              fileUrls={fileUrls}
              setFileUrls={setFileUrls}
              setAllFileUrls={setAllFileUrls}
              count={count}
              setCount={setCount}
            />
          </div>
        )}
      </div>
      <div style={{ marginLeft: "50px", marginBottom: "15px" }}>
        {allFileUrls.length > 0 && (
          <div>
            <h2>Recently Generated Samples</h2>
            {allFileUrls.map((url, index) => (
              <li key={index}>
                <RecentlyGenerated
                  audioFileURL={url}
                  fileUrls={fileUrls}
                  allFileUrls={allFileUrls}
                  setAllFileUrls={setAllFileUrls}
                />
              </li>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
