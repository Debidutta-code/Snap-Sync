import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVideo } from "./VideoContext";
import "./Subscriptions.css";
import avatar from "../assets/avatar.jpg";
// import { MagnifyingGlass } from "react-loader-spinner";
import VideoCard from "./VideoCard";
import { BounceLoader } from "react-spinners";

const Subscriptions = () => {
  const { userLoggedIn, userId,setUserProfileImage, setUserProfileClicked } = useVideo();
  const navigate = useNavigate();
  const [subscribedUsers, setSubscribedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subscribedVideo, setSubscribedVideo] = useState([]);

  useEffect(() => {
    if (!userLoggedIn) {
      navigate("/login");
    } else {
      fetchSubscribedUsers();
      fetchSubscribedUsersVideo();
    }
  }, [userLoggedIn, navigate]);

  const fetchSubscribedUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/subscriptions/${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSubscribedUsers(data);
      } else {
        console.error("Failed to fetch subscribed users");
      }
    } catch (error) {
      console.error("Error fetching subscribed users:", error);
      setIsLoading(false);
    }
  };

  const fetchSubscribedUsersVideo = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/get-subscribed-videos/${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSubscribedVideo(data);
      } else {
        console.error("Failed to fetch subscribed videos");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching subscribed videos:", error);
      setIsLoading(false);
    }
  };

  const profileClicked = (username, avatarimgUrl) => {
    navigate('/user-profile');
    setUserProfileClicked(username);
    setUserProfileImage(avatarimgUrl);
  }

  return (
    <div className="subscription-main-container">
      {/* Loading animation */}
      {isLoading && (
        <div className="no-video-found-error">
          <BounceLoader color="#36d7b7" speedMultiplier={2} />
        </div>
      )}
      {/* Display message if no subscribed users */}
      {!isLoading && subscribedUsers.length === 0 && (
        <div className="no-videos-found-error">
          You have not subscribed to anyone yet
        </div>
      )}
      {/* Display subscribed users */}
      {!isLoading && subscribedUsers.length > 0 && (
        <div className="subscription-artists-main-container">
          {subscribedUsers.map((user) => (
            <div
              key={user._id}
              className="subscription-artists-logo-and-details-container"
            >
              <div className="subscription-artists-profile" onClick={() => profileClicked(user.username, user.avatarimgUrl)}>
                <div className="subscription-artist-image">
                  <img
                    src={user.avatarimgUrl || avatar}
                    alt="Artist Image"
                    className="subscription-artist-image"
                  />
                </div>
                <div className="subscription-artist-details-container">
                  <div className="subscription-artist-details">
                    <div className="subscription-artist-name">
                      <h2 className="subscription-artist-name-text">
                        {user.username}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
        </div>
      )}

      {/* Display subscription videos */}
      {!isLoading && subscribedVideo.length > 0 && (
        <div className="subscription-videos-main-container">
          <div className="subscription-videos-list">
            {subscribedVideo.map((video) => (
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
        </div>
      )}
    </div>
  );
};

export default Subscriptions;