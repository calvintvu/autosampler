import React, { useState } from "react";

function Slider({ sliderValue, setSliderValue }) {
  // handler to update slider value
  const handleSliderChange = (event) => {
    setSliderValue(Number(event.target.value));
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "20px",
        }}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={sliderValue}
          onChange={handleSliderChange}
          style={{
            width: "300px",
            accentColor: "#ffffff",
            color: "#ffffff",
            outlineColor: "#ffffff",
            background: "#ffffff",
            opacity: "1.0",
          }}
        />
        <div
          style={{
            fontSize: "18px",
          }}
        >
          {sliderValue.toFixed(1)}
        </div>
      </div>
    </div>
  );
}

export default Slider;
