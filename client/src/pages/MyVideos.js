import React, { useEffect, useState } from "react";
import VideoCard from "./VideoCard"; // Assuming VideoCard component is in the same directory
import "./MyVideos.css";
import { useVideo } from "./VideoContext";
import { Link, useNavigate } from "react-router-dom";
import { PropagateLoader } from "react-spinners"; // Import PropagateLoader

const MyVideos = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true); // State to track loading state
  const { userLoggedIn, userId } = useVideo();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoggedIn) {
      navigate("/login");
    }
  }, [userLoggedIn, navigate]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true); // Set loading state to true when starting fetch
      try {
        const response = await fetch(`http://localhost:8080/get-my-videos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }
        const data = await response.json();
        // Reverse the allVideos array before setting it
        setAllVideos(data.reverse());
        console.log(data);
      } catch (error) {
        console.error("Error fetching videos:", error.message);
      } finally {
        setLoading(false); // Set loading state to false when fetch completes
      }
    };
    if (userLoggedIn) {
      fetchVideos();
    }
  }, [userId, userLoggedIn]);

  return (
    <div className="my-videos-homepage-container">
      {loading ? (
        <div className="loading-animation">
          <PropagateLoader color="#ffffff" />
        </div>
      ) : allVideos.length === 0 ? (
        <h1 className="no-videos-message">
          You Have Not Uploaded Anything Yet -{" "}
          <Link to="/upload-video" className="upload-here-button">
            {" "}
            Upload Here
          </Link>{" "}
        </h1>
      ) : (
        <div className="my-videos-videos-list">
          {allVideos.map((video) => (
            <VideoCard
              key={video._id}
              videoId={video._id}
              videoUrl={video.videoUrl}
              title={video.title}
              owner={video.userName}
              profileImageUrl={video.avatarUrl}
              thumbImageUrl={video.imgUrl}
              viewsCount={video.viewsCount}
              datePosted={video.postedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVideos;
