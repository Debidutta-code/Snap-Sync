import React, { useState, useEffect } from "react";
import "./LoadingSpinner.css"; // Add CSS for the spinner
import { HashLoader } from "react-spinners";

const LoadingSpinner = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000); // Update time every second

    // Clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, []); // Run this effect only once when the component mounts

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")} : ${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="loading-spinner-overlay">
      {/* <div className="loading-spinner"></div> */}
      <HashLoader color="#daa2ac" size={100} speedMultiplier={1.4} />
      <h1>Uploading to Snap Sync Galaxy</h1>
      <h1>{formatTime(time)}</h1>
    </div>
  );
};

export default LoadingSpinner;
