import React from "react";

const InfoHeaders = () => {
  const containerStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: "1.5rem",
    justifyContent: "center",
  };

  const logoContainerStyle = {
    marginRight: "2rem",
    animation: "spin 2s linear infinite",
  };

  const sectionsContainerStyle = {
    display: "flex",
    flexDirection: "row",
    gap: "3rem",
  };

  const sectionStyle = {
    display: "flex",
    flexDirection: "column",
    width: "16rem",
  };

  const lineStyle = {
    height: "0.25rem",
    backgroundColor: "#3B82F6",
    width: "125%",
    marginBottom: "1rem",
  };

  const headingStyle = {
    fontSize: "1.125rem",
    fontWeight: "500",
    marginBottom: "0.5rem",
    textAlign: "left",
  };

  const textStyle = {
    color: "#ffffff",
    textAlign: "left",
  };

  // Add the keyframe animation via a style tag
  const keyframes = `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={containerStyle}>
        {/* Spinning Logo */}
        <div style={logoContainerStyle}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="#3B82F6"
            />
          </svg>
        </div>

        <div style={sectionsContainerStyle}>
          {/* Section 1 */}
          <div style={sectionStyle}>
            <div style={lineStyle}></div>
            <h3 style={headingStyle}>Autosampler v0.1</h3>
            <p style={textStyle}>
              Leverage AI to generate variations of your own drum samples!
            </p>
          </div>

          {/* Section 2 */}
          <div style={sectionStyle}>
            <div style={lineStyle}></div>
            <h3 style={headingStyle}>How To Use</h3>
            <p style={textStyle}>
              Upload a drum sample of your own and click the generate button.
            </p>
          </div>

          {/* Section 3 */}
          <div style={sectionStyle}>
            <div style={lineStyle}></div>
            <h3 style={headingStyle}>Something Wrong?</h3>
            <p style={textStyle}>
              This site is still in development and will likely have issues.
              Please submit any issues to calvintvu@berkeley.edu.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoHeaders;
