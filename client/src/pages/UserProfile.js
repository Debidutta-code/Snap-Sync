import "./UserProfile.css";
// import profileImageUrl from "../assets/avatar.jpg";
// import profile from '../assets/yt-logo2.png';
import { useVideo } from "./VideoContext";
import { useEffect, useState } from "react";
import { FaUpRightFromSquare } from "react-icons/fa6";
import VideoCard from "./VideoCard";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { FaTimes } from "react-icons/fa";
import { MdVisibility } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { TbView360 } from "react-icons/tb";
import { IoMdDoneAll } from "react-icons/io";

const UserProfile = () => {
  const {
    userProfileClicked,
    userProfileImage,
    setVideoId,
    setVideoUrl,
    setVideoTitle,
    userLoggedIn,
    userId,
  } = useVideo();
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [onHome, setOnHome] = useState(true);
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivHome, setSelectedDivHome] = useState("selected");
  const [selectedDivAllVideos, setSelectedDivAllVideos] = useState("");
  const [videosCount, setVideosCount] = useState(0);
  const [video, setVideo] = useState({});
  const [showCard, setShowCard] = useState(false);
  const [profileReach, setProfileReach] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if(!userLoggedIn){
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    const fetchSubscriberCount = async () => {
      setLoading(true);
      try {
        // Use template literals for URL interpolation
        const response = await fetch(
          `https://snap-sync-tau.vercel.app/get-Subscriber-Count-with-user-name/${userProfileClicked}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setSubscriberCount(data.subscriberCount);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchSubscriberCount();
  }, [userProfileImage, isSubscribed]);

  useEffect(() => {
    const fetchAllVideos = async () => {
      setLoading(true);
      try {
        // Use template literals for URL interpolation
        const response = await fetch(
          `https://snap-sync-tau.vercel.app/get-all-videos-with-user-name/${userProfileClicked}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setAllVideos(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchAllVideos();
  }, [userProfileImage]);

  // Frontend code

  useEffect(() => {
    const fetchVideoCount = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://snap-sync-tau.vercel.app/get-video-count/${userProfileClicked}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setVideosCount(data.videoCount);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchVideoCount();
  }, [userProfileClicked]);

  const handleHomeClicked = () => {
    setSelectedDivHome("selected");
    setSelectedDivAllVideos("");
    setOnHome(true);
  };

  const handleAllVideosClicked = () => {
    setSelectedDivAllVideos("selected");
    setSelectedDivHome("");
    setOnHome(false);
  };

  useEffect(() => {
    const fetchRecentVideo = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://snap-sync-tau.vercel.app/get-recent-video/${userProfileClicked}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        // console.log("this is the data",data);
        setVideo(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchRecentVideo();
  }, [userProfileClicked]);

  const handleVideoClick = (videoId, videoUrl, title) => {
    // Navigate to the '/video' route with props
    setVideoId(videoId);
    setVideoUrl(videoUrl);
    setVideoTitle(title);
    navigate(`/video`);
  };

  const toggleCard = () => {
    setShowCard(!showCard);
  };

  useEffect(() => {
    const increaseVisitCountAndGetTheCount = async () => {
      setLoading(true);
      try {
        // Use template literals for URL interpolation
        const response = await fetch(
          `https://snap-sync-tau.vercel.app/increase-visit-count/${userProfileClicked}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setProfileReach(data.visitCount);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    // Call the async function
    increaseVisitCountAndGetTheCount();
  }, [userProfileClicked]); // Add dependency array to specify when the effect should run

  useEffect(() => {
    // Fetch subscription status when component mounts
    if (userLoggedIn) {
      fetchSubscriptionStatus();
    } else {
      setIsSubscribed(false);
    }
  }, [isSubscribed]);

  const baseUrl = "https://snap-sync-tau.vercel.app/";

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(
        `${baseUrl}check-subscription-for-user-profile?userId=${userId}&userProfileClicked=${userProfileClicked}`
      );
      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
      } else {
        throw new Error("Failed to fetch subscription status");
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    }
  };
  
  const handleSubscribeClicked = async () => {
    if (!userLoggedIn) {
      navigate("/login");
    } else {
      // Extract user id and video owner's user id
      const response = await fetch(
        `https://snap-sync-tau.vercel.app/subscribed-to-user-id/${userProfileClicked}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const subscribedToUserId = await response.json();

      // If already subscribed, unsubscribe
      if (isSubscribed) {
        // Send a DELETE request to the backend to unsubscribe
        fetch(`${baseUrl}unsubscribe`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, subscribedToUserId }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to unsubscribe");
            }
            // Unsubscribe successful
            // console.log("unsubscribe successful");
            setIsSubscribed(false); // Update subscription status in the state
            // Also update local storage
            localStorage.setItem("isSubscribed", false);
          })
          .catch((error) => {
            console.error("Error unsubscribing:", error);
            // Handle error, e.g., show an error message to the user
          });
      } else {
        // If not subscribed, subscribe
        // Create subscription data
        const subscriptionData = {
          userId: userId,
          subscribedTo: subscribedToUserId,
        };

        // Send a POST request to the backend to store subscription data
        fetch(`${baseUrl}subscribe-to`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscriptionData),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to subscribe");
            }
            // Subscription successful
            setIsSubscribed(true); // Update subscription status in the state
            // Also update local storage
            localStorage.setItem("isSubscribed", true);
          })
          .catch((error) => {
            console.error("Error subscribing:", error);
            // Handle error, e.g., show an error message to the user
          });
      }
    }
  };

  // Check if subscription status is stored in local storage
  useEffect(() => {
    const storedStatus = localStorage.getItem("isSubscribed");
    if (storedStatus) {
      setIsSubscribed(JSON.parse(storedStatus));
    }
  }, []);

  return (
    <div className="user-profile-main-container">
      {showCard && (
        <div className="centered-card">
          <div className="card-content">
            {/* Close button */}
            <button className="close-button" onClick={toggleCard}>
              <FaTimes />
            </button>

            {/* Card content */}
            <h2>Channel Details</h2>
            <p>This is the content of the card.</p>
          </div>
          <div className="main-card-container">
            <div className="card-icon-and-details-container">
              <div className="profile-container">
                <div className="single-details-icon">
                  <MdVisibility />
                </div>
                <div className="profile-visited">
                  {profileReach} People Visited This Page
                </div>
              </div>
              <div className="profile-container">
                <div className="single-details-icon">
                  <MdEmail />
                </div>
                <div className="profile-visited">
                  debiduttaacharya2002@gmail.com
                </div>
              </div>
              <div className="profile-container">
                <div className="single-details-icon">
                  <HiUserGroup />
                </div>
                <div className="profile-visited">
                  {subscriberCount} Subscribers
                </div>
              </div>
              <div className="profile-container">
                <div className="single-details-icon">
                  <MdOutlineSlowMotionVideo />
                </div>
                <div className="profile-visited">{videosCount} Videos</div>
              </div>
              <div className="profile-container">
                <div className="single-details-icon">
                  <TbView360 />
                </div>
                <div className="profile-visited">102324 views</div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="user-profile-and-details-section">
        <div className="user-profile-image-and-details">
          <div className="user-profile-image-container">
            <img
              src={userProfileImage}
              alt="Profile"
              className="user-profile-image"
            />
          </div>
          <div className="user-profile-details-and-subscribe-button-container">
            <div className="user-profile-heading-container">
              <h1 className="user-profile-heading-text">
                {userProfileClicked}
              </h1>
            </div>
            <div className="user-profile-subscriber-count-and-video-count">
              <div className="user-profile-subscriber-count">
                {" "}
                {subscriberCount} Subscribers
              </div>
              <div className="user-profile-video-count">
                {videosCount} Videos
              </div>
            </div>
            <div
              className="user-profile-more-about-this-channel"
              onClick={toggleCard}
            >
              More About This Channel <FaUpRightFromSquare />
            </div>
            <div className="user-profile-subscribe-button-container">
              {" "}
              <button
                className={`user-video-subscribe-button ${
                  userLoggedIn && isSubscribed ? "user-subscribed" : ""
                }`}
                onClick={handleSubscribeClicked}
              >
                {userLoggedIn && isSubscribed ? <>Subscribed <IoMdDoneAll /> </> : "Subscribe"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="user-profile-all-videos-section">
        <div className="toggle-section-recent-video-and-all-video">
          <div
            onClick={handleHomeClicked}
            className={`homediv ${selectedDivHome}`}
          >
            Recent
          </div>
          <div
            onClick={handleAllVideosClicked}
            className={`homediv ${selectedDivAllVideos}`}
          >
            All Videos
          </div>
        </div>
        <hr
          style={{
            border: "none" /* Remove default border */,
            borderTop: "4px solid grey" /* Customize top border */,
            margin: "0px auto" /* Center the line and add margin */,
            width: "92%",
            borderRadius: "20px",
          }}
        />
        {!onHome ? (
          <div className="on-home-container">
            {!loading && allVideos.length > 0 && (
              <div className="user-profile-videos-list">
                {allVideos.map((video) => (
                  <VideoCard
                    key={video._id}
                    videoId={video._id}
                    videoUrl={video.videoUrl}
                    title={video.title}
                    // owner={video.userName}
                    profileImageUrl={video.avatarUrl}
                    thumbImageUrl={video.imgUrl}
                    viewsCount={video.viewsCount}
                    datePosted={video.postedAt} // Add the datePosted prop here
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="on-all-videos">
            {loading && (
              <div className="loader-container">
                <div className="loader">
                  <BarLoader
                    color="yellow"
                    height={2}
                    speedMultiplier={1}
                    width={800}
                  />
                </div>
              </div>
            )}
            {!loading && Object.keys(video).length === 0 && (
              <div className="no-videos-container">
                <h1 className="no-videos-text">No Videos Found</h1>
              </div>
            )}
            {!loading && Object.keys(video).length > 0 && (
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
                    <div className="searched-views">
                      {video.viewsCount} views
                    </div>
                    <div className="searched-date-posted">
                      {video.datePosted}
                    </div>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
