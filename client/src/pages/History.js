import React, { useEffect, useState } from "react";
import { useVideo } from "./VideoContext";
import { useNavigate } from "react-router-dom";
import "./History.css";
import { HashLoader, PacmanLoader, PropagateLoader } from "react-spinners";

const History = () => {
  const { userLoggedIn, userId, setVideoId, setVideoUrl, setVideoTitle } = useVideo();
  const navigate = useNavigate();
  const [historyVideos, setHistoryVideos] = useState([]);
  const [isloading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/get-user-history/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user history");
        }

        const historyData = await response.json();

        // Fetch details of each video based on videoId
        const videoDetailsPromises = historyData.history.map(
          async (videoId) => {
            const videoResponse = await fetch(
              `http://localhost:8080/get-video-details/${videoId}`
            );
            if (!videoResponse.ok) {
              throw new Error(
                `Failed to fetch video details for videoId ${videoId}`
              );
            }
            return await videoResponse.json();
          }
        );

        const videos = await Promise.all(videoDetailsPromises);
        setHistoryVideos(videos);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user history:", error);
        setIsLoading(false);
      }
    };

    if (userLoggedIn) {
      fetchHistory();
    } else {
      navigate("/login");
    }
  }, [userLoggedIn, navigate, userId]);

  const videoClicked = (videoId, videoUrl, title) => {
    setVideoId(videoId);
    setVideoUrl(videoUrl);
    setVideoTitle(title);
    navigate(`/video`);
  }

  return (
    <div className="histroy-main-container">
      {isloading && (
        <div className="loading-animation">
          <PacmanLoader color="#ffffff" margin={0} speedMultiplier={2} />
        </div>
      )}
      <div className="history-video-list-container">
        {!isloading && (
          <div className="history-heading">
            <h1 className="history-heading-text">Watch History</h1>
          </div>
        )}

        {historyVideos
          .slice()
          .reverse()
          .filter((_, index) => index % 2 === 0)
          .map((video, index) => (
            <div className="history-video-container" key={index} onClick={()=>videoClicked(video._id, video.videoUrl, video.title)}>
              <div className="history-thumbnail" >
                <img
                  src={video.imgUrl}
                  alt="Thumbnail"
                  className="history-image"
                />
              </div>
              <div className="history-video-details">
                <div className="history-video-title">
                  <h2>{video.title}</h2>
                </div>
                <div className="history-video-owner-and-views">
                  <div className="history-video-owner">{video.userName}</div>
                  <div className="history-video-views">
                    {video.viewsCount} views
                  </div>
                </div>
                <div className="history-video-description">
                  <p className="history-video-description-text">
                    {video.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default History;
