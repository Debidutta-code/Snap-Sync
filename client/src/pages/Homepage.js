import React, { useEffect, useState, useRef } from "react";
import VideoCard from "./VideoCard";
import "./Homepage.css";
import { PropagateLoader, BarLoader } from "react-spinners";

const Homepage = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [allVideosLoaded, setAllVideosLoaded] = useState(false); // Flag to track if all videos are loaded
  const [moreLoading, setMoreLoading] = useState(true);
  const videosPerPage = 9;

  const observer = useRef();
  const lastVideoRef = useRef();

  const fetchVideos = async () => {
    setMoreLoading(true);
    try {
      const response = await fetch(
        `https://snap-sync-tau.vercel.app/get-videos?page=${currentPage}&limit=${videosPerPage}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await response.json();
      if (data.length === 0) {
        setAllVideosLoaded(true); // No more videos left to load
      } else {
        setAllVideos((prevVideos) => [...prevVideos, ...data]);
      }
      setLoading(false);
      setMoreLoading(false);
    } catch (error) {
      console.error("Error fetching videos:", error.message);
      setLoading(false);
      setMoreLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [currentPage]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    observer.current = new IntersectionObserver(handleObserver, options);
    if (lastVideoRef.current) {
      observer.current.observe(lastVideoRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [allVideos]);

  const handleObserver = (entities) => {
    const target = entities[0];
    if (target.isIntersecting && !allVideosLoaded) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="homepage-container">
      {loading && (
        <div className="loading-animation">
          <PropagateLoader color="#ffffff" />
        </div>
      )}
      <div className="videos-list">
        {allVideos.slice(0).map((video, index) => {
          if (allVideos.length === index + 2) {
            return (
              <div ref={lastVideoRef} key={video._id}>
                <VideoCard
                  videoId={video._id}
                  videoUrl={video.videoUrl}
                  title={video.title}
                  owner={video.userName}
                  profileImageUrl={video.avatarUrl}
                  thumbImageUrl={video.imgUrl}
                  viewsCount={video.viewsCount}
                  datePosted={video.postedAt}
                />
              </div>
            );
          } else {
            return (
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
            );
          }
        })}
      </div>
      {moreLoading && (
        <div className="loading-animation-home">
          <BarLoader color="#999159" height={2} width={500} />
        </div>
      )}

      {/* {!moreLoading && allVideos.length > 0 && allVideosLoaded && (
        <div className="home-no-videos-message-home">
          <h2>You've reached the end of the road, nothing left to discover!</h2>
        </div>
      )} */}
    </div>
  );
};

export default Homepage;
