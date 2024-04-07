import React from "react";
import "./ShowAlert.css"; // Import the CSS file for styling

const ShowAlert = ({ message, onClose }) => {
  return (
    <>
      <div className="alert-container"></div>
      <div className="alert-overlay">
        <div className="alert-box">
          <p>{message}</p>
          <button onClick={onClose} className="ok-button">
            OK
          </button>
        </div>
      </div>
    </>
  );
};

export default ShowAlert;
