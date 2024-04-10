import { useVideo } from "./VideoContext";
import "./SearchedContentPage.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";

const SearchedContentPage = () => {
  const { searchedItem, setVideoId, setVideoUrl, setVideoTitle } = useVideo();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      setVideos([]);

      setLoading(true);
      try {
        const response = await fetch(
          `https://snap-sync-tau.vercel.app/find-searched-content/${searchedItem}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        console.log(data);
        setVideos(data); // Store fetched videos in state
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    if (searchedItem.length !== 0) {
      fetchVideos();
    }
  }, [searchedItem]); // Specify searchedItem as a dependency

  const handleVideoClick = (videoId, videoUrl, title) => {
    // Navigate to the '/video' route with props
    setVideoId(videoId);
    setVideoUrl(videoUrl);
    setVideoTitle(title);
    navigate(`/video`);
  };

  return (
    <div className="searched-content-page-main-container">
      <h2 className="searched-findings">
        Highlighting the findings for:{" "}
        <span className="searched-sentence">{searchedItem}</span>{" "}
      </h2>
      {!loading && videos.length === 0 && (
        <div className="searched-no-videos-message">
          <h2>
            Sorry, nothing matches your search.{" "}
            <Link to="/" className="search-keep-exploring">
              Keep Exploring!
            </Link>{" "}
          </h2>
        </div>
      )}
      {loading && (
        <div className="loading-animation-spinner">
          <PuffLoader color="#ffffff" size={60} />
        </div>
      )}
      <div className="searched-content-video-list-container">
        {/* Map through videos array and render each video */}
        {videos.map((video) => (
          <div key={video._id} className="searched-video">
            <div
              className="searched-thumbnail"
              onClick={() =>
                handleVideoClick(video._id, video.videoUrl, video.title)
              }
            >
              <img src={video.imgUrl} alt="Video Thumbnail" />
            </div>
            <div className="searched-video-details">
              <div className="searched-video-title">
                <h2 className="searched-title">{video.title}</h2>
              </div>
              <div className="searched-views-and-date-posted">
                <div className="searched-views">{video.viewsCount} views</div>
                <div className="searched-date-posted">{video.datePosted}</div>
              </div>
              <div className="searched-video-owner-and-views">
                <div className="searched-video-owner-image-container">
                  <img
                    src={video.avatarUrl}
                    alt="Video Owner Avatar"
                    className="searched-owner-image"
                  />
                </div>
                <p className="searched-channel-name">{video.userName}</p>
              </div>
              <div className="searched-video-description-container">
                <p className="searched-video-description">
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

export default SearchedContentPage;
