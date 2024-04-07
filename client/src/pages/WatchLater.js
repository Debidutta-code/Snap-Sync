import { Link, useNavigate } from "react-router-dom";
import { useVideo } from "./VideoContext";
import { useEffect, useState } from "react";
import "./WatchLater.css";
import { FaShuffle } from "react-icons/fa6";
import { IoMdPlay } from "react-icons/io";
import { FiDownload } from "react-icons/fi";
import { PropagateLoader } from "react-spinners";

const WatchLater = () => {
  const {
    userLoggedIn,
    userId,
    setVideoId,
    setVideoTitle,
    setVideoUrl,
    userName,
  } = useVideo();
  const [watchLaterVideos, setWatchLaterVideos] = useState([]);
  const [firstVideo, setFirstVideo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoggedIn) {
      navigate("/login");
    }
  }, [userLoggedIn, navigate]);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/get-watch-later-videos/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        data.reverse();

        if (data.length > 0) {
          setFirstVideo(data[0]);
        }

        setWatchLaterVideos(data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    };

    fetchVideos();
  }, [userId]);

  const handleShuffleClick = () => {
    const shuffledVideos = [...watchLaterVideos].sort(
      () => Math.random() - 0.5
    );
    setWatchLaterVideos(shuffledVideos);
    if (shuffledVideos.length > 0) {
      setFirstVideo(shuffledVideos[0]);
    }
  };

  const handleDownloadClick = async (videoURL, TITLE) => {
    try {
      const response = await fetch(videoURL);
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([blob]));

      // Create a link element
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", TITLE + ".mp4"); // Set download attribute to force download

      // Append the link to the document body and trigger the click event
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };

  const handleVideoClicked = (_id, videoUrl, title) => {
    setVideoId(_id);
    setVideoUrl(videoUrl);
    setVideoTitle(title);
    navigate(`/video`);
  };

  return (
    <div className="main-watch-later-container">
      {isLoading ? (
        <div className="loading-animation">
          <PropagateLoader color="#ffffff" />
        </div>
      ) : (
        <div className="watch-later-container">
          <div className="watch-later-top-video-container">
            <div className="watch-later-top-video-thumbnail">
              <div
                className="watch-later-top-video-thumbnail-image"
                onClick={() =>
                  handleVideoClicked(
                    firstVideo._id,
                    firstVideo.videoUrl,
                    firstVideo.title
                  )
                }
              >
                <img
                  src={firstVideo.imgUrl}
                  alt=""
                  className="watch-later-main-video-image"
                />
              </div>
            </div>
            <div className="watch-later-top-video-watch-later-heading">
              <h1> Watch Later </h1>
            </div>

            <div className="watch-later-top-video-my-user-name-and-videos-count">
              <p className="watch-later-my-name">{userName}</p>
              <p className="watch-later-total-videos-count">
                {watchLaterVideos.length} Videos
              </p>
            </div>

            <button
              className="watch-later-buttons-play"
              disabled={watchLaterVideos.length === 0}
              onClick={() =>
                handleVideoClicked(
                  firstVideo._id,
                  firstVideo.videoUrl,
                  firstVideo.title
                )
              }
              style={{
                cursor:
                  watchLaterVideos.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              <IoMdPlay /> Play
            </button>
            <div className="watch-later-download-shuffle-play-buttons">
              <button
                className="watch-later-buttons"
                onClick={
                  watchLaterVideos.length > 0 ? handleShuffleClick : null
                }
                disabled={watchLaterVideos.length === 0}
                style={{
                  cursor:
                    watchLaterVideos.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                <FaShuffle /> Shuffle
              </button>

              <button
                className="watch-later-buttons"
                onClick={
                  watchLaterVideos.length > 0
                    ? () =>
                        handleDownloadClick(
                          firstVideo.videoUrl,
                          firstVideo.title
                        )
                    : null
                }
                disabled={watchLaterVideos.length === 0}
                style={{
                  cursor:
                    watchLaterVideos.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                <FiDownload /> Download
              </button>
            </div>
          </div>

          <div className="watch-later-all-video-container">
            <div className="watch-later-all-video-list-container">
              {watchLaterVideos.length > 0 ? (
                watchLaterVideos.map((video) => (
                  <div
                    className="history-video-container"
                    key={video._id}
                    onClick={() =>
                      handleVideoClicked(video._id, video.videoUrl, video.title)
                    }
                  >
                    <div className="watch-later-thumbnail">
                      <img
                        src={video.imgUrl}
                        alt="Thumbnail"
                        className="watch-later-image"
                      />
                    </div>
                    <div className="history-video-details">
                      <div className="watch-later-video-title">
                        <h2>{video.title}</h2>
                      </div>
                      <div className="history-video-owner-and-views">
                        <div className="history-video-owner">
                          {video.userName}
                        </div>
                        <div className="history-video-views">
                          {video.viewsCount} views
                        </div>
                      </div>
                      <div className="watch-later-video-description">
                        <p className="watch-later-description-text">
                          {video.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="watch-later-no-videos-message">
                  <h2>
                    You haven't chosen anything to watch later yet -{" "}
                    <Link to="/" className="explore-here-button">
                      Explore
                    </Link>{" "}
                  </h2>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchLater;
