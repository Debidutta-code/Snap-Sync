// VideoContext.js
import React, { createContext, useContext, useState } from "react";

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoTitle, setVideoTitle] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [searchedItem, setSearchedItem] = useState("");
  const [userProfileClicked, setUserProfileClicked] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);

  return (
    <VideoContext.Provider
      value={{
        videoUrl,
        setVideoUrl,

        videoTitle,
        setVideoTitle,

        userLoggedIn,
        setUserLoggedIn,
        
        userId,
        setUserId,

        userName,
        setUserName,

        videoId,
        setVideoId,

        avatarUrl,
        setAvatarUrl,

        searchedItem,
        setSearchedItem,

        userProfileClicked,
        setUserProfileClicked,

        userProfileImage,
        setUserProfileImage,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => useContext(VideoContext);
