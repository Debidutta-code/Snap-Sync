import React, { useEffect, useState } from "react";
import VideoCard from "./VideoCard"; // Assuming VideoCard component is in the same directory
import "./Homepage.css";
import { PropagateLoader } from "react-spinners"; // Importing PropagateLoader

const Homepage = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 9;

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://snap-sync-tau.vercel.app/get-videos?page=${currentPage}&limit=${videosPerPage}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }
        const data = await response.json();
        setAllVideos(prevVideos => [...prevVideos, ...data]); // Stack new videos with previous ones
        setLoading(false);
      } catch (error) {
        console.error("Error fetching videos:", error.message);
        setLoading(false);
      }
    };

    fetchVideos();
  }, [currentPage]);

  const handleNextClick = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  return (
    <div className="homepage-container">
      {loading && ( // Display loading indicator if loading is true
        <div className="loading-animation">
          <PropagateLoader color="#ffffff" />
        </div>
      )}
      {!loading && allVideos.length === 0 && (
        <div className="home-no-videos-message">
          <h2>You've reached the end of the road, nothing left to discover!</h2>
        </div>
      )}

      {!loading && allVideos.length > 0 && (
        <div className="videos-list">
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
              datePosted={video.postedAt} // Add the datePosted prop here
            />
          ))}
        </div>
      )}

      {!loading && allVideos.length > 0 && (
        <div className="button-container">
          <button className="page-button" onClick={handleNextClick}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Homepage;
