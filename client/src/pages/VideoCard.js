import React, { useState } from "react";
import "./VideoCard.css";
import { useNavigate } from "react-router-dom";
import { useVideo } from "./VideoContext";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { MdOutlineWatchLater } from "react-icons/md";
import { FaDownload, FaPlay } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

const VideoCard = ({
  videoId,
  videoUrl,
  title,
  owner,
  profileImageUrl,
  thumbImageUrl,
  viewsCount,
  datePosted,
}) => {
  const navigate = useNavigate();
  const { setVideoUrl, setVideoTitle, setVideoId, userId, userLoggedIn, setUserProfileClicked, setUserProfileImage } =
    useVideo();
  const [imageLoaded, setImageLoaded] = useState(false); // State to track if the image is loaded
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to track if the menu is open
  const [showMessage, setShowMessage] = useState(false);
  const [bottomMessage, setBottomMessage] = useState("");

  const handleThumbClicked = () => {
    // Navigate to the '/video' route with props
    setVideoId(videoId);
    setVideoUrl(videoUrl);
    setVideoTitle(title);
    navigate(`/video`);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handlePlayClicked = () => {
    // Handle play logic
    handleThumbClicked();
  };

  const handleDownloadClick = async (videoURL) => {
    try {
      const response = await fetch(videoURL);
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([blob]));

      // Create a link element
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", title + ".mp4"); // Set download attribute to force download

      // Append the link to the document body and trigger the click event
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowMessage(true);
      setBottomMessage("Download Started");

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowMessage(false);
        setBottomMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };

  const handleWatchLaterClick = async () => {
    if (!userLoggedIn) {
      navigate("/login");
    } else {
      await fetch("http://localhost:8080/add-to-watch-later", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId: videoId, userId: userId }),
      });

      setShowMessage(true);
      setBottomMessage("Saved To Watch Later");

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowMessage(false);
        setBottomMessage("");
      }, 3000);
    }
  };

  const handleCrossClicked = () => {
    setShowMessage(false);
  };

  const DownloadMessage = ({ message }) => {
    return (
      <div className="download-message">
        {message}
        <div className="cross-icon" onClick={handleCrossClicked}>
          {" "}
          <RxCross2 />{" "}
        </div>
      </div>
    );
  };

  const getTimeElapsed = (postedAt) => {
    const now = new Date();
    const difference = now - new Date(postedAt);
    const seconds = Math.floor(difference / 1000);
    if (seconds < 60) {
      return `${seconds} seconds ago`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hours ago`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} days ago`;
    }
    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
      return `${weeks} weeks ago`;
    }
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} months ago`;
    }
    const years = Math.floor(months / 12);
    return `${years} years ago`;
  };

  const profileClicked = (owner) => {
    navigate('/user-profile');
    setUserProfileClicked(owner);
    setUserProfileImage(profileImageUrl);
  }

  return (
    <div className="video-card">
      {showMessage && <DownloadMessage message={bottomMessage} />}
      <div className="thumb-container">
        {!imageLoaded && <div className="placeholder-box"></div>}
        <img
          src={thumbImageUrl}
          alt="Video Thumbnail"
          className={`thumb-img ${imageLoaded ? "loaded" : ""}`}
          onLoad={handleImageLoad}
          onClick={handleThumbClicked}
        />
      </div>
      <div className="video-details">
        <div className="profile-image-container" onClick={() => profileClicked(owner)}>
          <img src={profileImageUrl} alt="Profile" className="profile-image" />
        </div>
        <div className="details">
          <div className="video-title-and-owner-container">
            <h2 className="video-title">{title}</h2>
            <p className="video-owner" onClick={() => profileClicked(owner)}>{owner}</p>
            <div className="video-views-and-uploaded-date-and-time">
              <div>
                {" "}
                {viewsCount} views
              </div>
              <div> {getTimeElapsed(datePosted)}</div>
            </div>
          </div>
          <div className="video-card-three-dot" onClick={handleMenuToggle}>
            <PiDotsThreeOutlineVerticalFill />
            {isMenuOpen && (
              <div className="menu-item-list">
                <button onClick={handlePlayClicked}>
                  {" "}
                  <FaPlay /> Play Video
                </button>
                <button onClick={handleWatchLaterClick}>
                  {" "}
                  <MdOutlineWatchLater /> Save To Watch Later
                </button>
                <button onClick={handleDownloadClick}>
                  {" "}
                  <FaDownload /> Download
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
