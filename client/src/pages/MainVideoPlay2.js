// MainVideoPlay.jsx

import React, { useEffect, useState } from "react";
import "./MainVideoPlay.css"; // Import CSS file
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { IoMdDownload } from "react-icons/io";
import { useVideo } from "./VideoContext";
import OtherVideos2 from "./OtherVideos2";
import Linkify from "react-linkify";
import { MdOutlineWatchLater } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
// const videoUrl = require("../assets/demovideo.mp4");

const CustomAnchorTag = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

const addLineBreaks = (text, maxLength) => {
  if (!text) return ""; // Check if text is null or undefined

  const regex = new RegExp(`.{1,${maxLength}}`, "g");
  return text.match(regex)?.join("\n") ?? ""; // Use optional chaining and nullish coalescing to handle potential null values
};

const MainVideoPlay2 = () => {
  const { videoUrl, videoTitle, videoId, userLoggedIn, userId, setVideoUrl, setUserProfileImage, setUserProfileClicked } =
    useVideo();

  const [likeCount, setLikeCount] = useState(0);
  const [likedorNot, setLikedOrNot] = useState(false);
  const [dislikedorNot, setDislikedorNot] = useState(false);
  const [dislikeCount, setdisLikeCount] = useState(0);
  const [videoData, setVideoData] = useState({});
  const [showMessage, setShowMessage] = useState(false);
  const [bottomMessage, setBottomMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://snap-sync-tau.vercel.app/main-video/${videoId}/${userLoggedIn}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setVideoData(data);
        setVideoUrl(data.videoUrl);

        // Process the response here
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error state if needed
      }
    };

    fetchData();
  }, [videoId, videoTitle, videoUrl]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetch(`https://snap-sync-tau.vercel.app/save-to-history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId: videoId,
            userId: userId,
          }),
        });
      } catch (error) {
        console.log("Error:", error);
      }
    };

    if (userLoggedIn) {
      fetchData();
    } else {
      console.log("User is not logged in, skipping data fetch");
    }
  }, [userLoggedIn]);

  const handleLikeCount = async () => {
    if (!likedorNot) {
      if (dislikedorNot) {
        setDislikedorNot(false);
        setdisLikeCount(dislikeCount - 1);
        await fetch(
          `https://snap-sync-tau.vercel.app/set-dislike-count/${videoId}/false`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      setLikeCount(likeCount + 1);
      setLikedOrNot(true);

      await fetch(`https://snap-sync-tau.vercel.app/set-like-count/${videoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "like" }), // Send like action in the body
      });
    } else {
      setLikeCount(likeCount - 1);
      setLikedOrNot(false);
      await fetch(`https://snap-sync-tau.vercel.app/set-like-count/${videoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "unlike" }), // Send unlike action in the body
      });
    }
  };

  const handleDislikeCount = async () => {
    if (!dislikedorNot) {
      if (likedorNot) {
        setLikeCount(likeCount - 1);
        setLikedOrNot(false);
        await fetch(`https://snap-sync-tau.vercel.app/set-like-count/${videoId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "unlike" }), // Send unlike action in the body
        });
      }
      setDislikedorNot(true);
      setdisLikeCount(dislikeCount + 1);
  
      await fetch(
        `https://snap-sync-tau.vercel.app/set-dislike-count/${videoId}/true`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      setDislikedorNot(false);
      setdisLikeCount(dislikeCount - 1);
      await fetch(
        `https://snap-sync-tau.vercel.app/set-dislike-count/${videoId}/false`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  };


  const handleWatchLaterClicked = async () => {
    if (!userLoggedIn) {
      navigate("/login");
    } else {
      await fetch("https://snap-sync-tau.vercel.app/add-to-watch-later", {
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

  useEffect(() => {
    // Fetch subscription status when component mounts
    if (userLoggedIn && videoData) {
      fetchSubscriptionStatus();
    } else {
      setIsSubscribed(false);
    }
  }, [videoData]); // Add videoData as a dependency

  const baseUrl = "https://snap-sync-tau.vercel.app/";

  const fetchSubscriptionStatus = async () => {
    // Assuming you have access to both userId and subscriptionId
    const subscriptionId = videoData.userId;
    console.log(subscriptionId);
    if (!subscriptionId) {
      return; // If subscriptionId is undefined, exit early
    }

    // Fetch subscription status from backend
    fetch(
      `${baseUrl}check-subscription?userId=${userId}&subscriptionId=${subscriptionId}`
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to fetch subscription status");
        }
      })
      .then((data) => {
        console.log(data);
        setIsSubscribed(data.isSubscribed);
      })
      .catch((error) => {
        console.error("Error fetching subscription status:", error);
      });
  };

  const handleSubscribeClicked = () => {
    if (!userLoggedIn) {
      navigate("/login");
    } else {
      // Extract user id and video owner's user id
      const subscribedToUserId = videoData.userId;

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

  useEffect(() => {
    const fetchSubscriberCount = async (videoId) => {
      try {
        const response = await fetch(`https://snap-sync-tau.vercel.app/getSubscriberCount/${videoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch subscriber count');
        }
        const data = await response.json();
        setSubscriberCount(data.subscriberCount);
      } catch (error) {
        console.error(error);
        setSubscriberCount(null);
      }
    };

    fetchSubscriberCount(videoId);
  }, [videoId, isSubscribed]);

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

  const profileClicked = (username, avatarimgUrl) => {
    navigate('/user-profile');
    setUserProfileClicked(username);
    setUserProfileImage(avatarimgUrl);
  }

  useEffect(() => {
    console.log(videoData);
    setLikeCount(videoData.likeCount);
    setdisLikeCount(videoData.disLikeCount);
  }, [videoData.likeCount, videoData.disLikeCount])

  const description = videoData.description || "";
  const formattedDescription = addLineBreaks(description, 106);

  return (
    <div className="main-video-play-container">
      {showMessage && <DownloadMessage message={bottomMessage} />}
      <div className="main-video-play">
        <div className="main-video-container">
          <video className="main-video" controls autoPlay>
            <source src={videoUrl} type="video/mp4" />
          </video>
          {/* <VideoPlayer src={videoUrl} classname = "main-video"  /> */}
        </div>
        <h2 className="video-title">{videoData.title}</h2>{" "}
        {/* Apply class to h1 */}
        <div className="video-like-share-container">
          <div className="like-share-container1">
            <div className="video-creator-name-and-image">
              <div className="video-channel-image" onClick={() => profileClicked(videoData.userName, videoData.avatarUrl)}>
                <img
                  src={videoData.avatarUrl}
                  alt="YouTube Logo"
                  className="video-yt-logo-icon"
                />{" "}
              </div>
              <div className="video-creater-info">
                <div className="video-owner" onClick={() => profileClicked(videoData.userName, videoData.avatarUrl)}>
                  <h3 className="video-creator-name">{videoData.userName}</h3>
                </div>
                <div className="video-ownersubs">
                  <h7> {subscriberCount} Subscribers</h7>
                </div>
              </div>
            </div>
            <button
              className={`video-subscribe-button ${
                isSubscribed ? "subscribed" : ""
              }`}
              onClick={handleSubscribeClicked}
            >
              {isSubscribed ? <>Subscribed</> : "Subscribe"}
            </button>
          </div>

          <div className="like-share-container4">
            <div className="like-share-container2">
              <div
                className="video-likes-button"
                onClick={handleLikeCount}
                style={{ backgroundColor: likedorNot ? "black" : "" }}
              >
                <div className="video-like-icon">
                {!likedorNot ? <BiLike /> : <BiSolidLike />}
                </div>
                <div className="video-like-count">{likeCount} </div>
              </div>
              {/* <div className="video-separates-button">
                <div className="video-separate-icon">|</div>
              </div> */}
              <div
                className="video-dislikes-button"
                onClick={handleDislikeCount}
                style={{ backgroundColor: dislikedorNot ? "black" : "" }}
              >
                <div className="video-dislike-icon">
                {!dislikedorNot ? <BiDislike /> : <BiSolidDislike />}
                </div>
                <div className="video-like-count">{dislikeCount} </div>
              </div>
            </div>
            <div className="like-share-container3">
              <div
                className="video-download-button"
                onClick={() =>
                  handleDownloadClick(videoData.videoUrl, videoData.title)
                }
              >
                <div className="video-download-text">Download</div>
                <div className="video-download-icon">
                  <IoMdDownload />
                </div>
              </div>
            </div>
            <div className="like-share-container3">
              <div
                className="video-download-button"
                onClick={handleWatchLaterClicked}
              >
                <div className="video-download-icon">
                  {" "}
                  <MdOutlineWatchLater />{" "}
                </div>
                <div className="video-download-text">Later</div>
              </div>
            </div>
          </div>
        </div>
        <div className="main-description-container">
          <div className="main-views-count-date-container">
            <div className="main-views-count-container">
              <p className="main-views-count">
                {Math.floor(videoData.viewsCount)} views
              </p>
            </div>
            <div className="main-date-container">
              <p className="main-date">{getTimeElapsed(videoData.postedAt)}</p>
            </div>
          </div>
          <div className="main-description-box">
            <Linkify
              componentDecorator={(decoratedHref, decoratedText, key) => (
                <CustomAnchorTag key={key} href={decoratedHref}>
                  {decoratedText}
                </CustomAnchorTag>
              )}
            >
              <pre className="main-description-text">
                {formattedDescription}
              </pre>
            </Linkify>
          </div>
        </div>
      </div>
      <div className="other-videos">
        <div className="other-videos-main-container">
          <OtherVideos2 />
        </div>
      </div>
    </div>
  );
};

export default MainVideoPlay2;