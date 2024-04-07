import React, { useEffect, useState } from "react";
import "./Navbar.css";
import ytLogo from "../assets/yt-logo2.png"; // Correct way to import image
import { IoSearchOutline } from "react-icons/io5";
import { useVideo } from "../pages/VideoContext";
import { Link, useNavigate } from "react-router-dom";
import ProfileImage from "../assets/avatar1.png";

const Navbar = () => {
    const { userLoggedIn, userId, setSearchedItem, setUserProfileClicked, setUserProfileImage, userName, avatarUrl } = useVideo();
    const [avatarImgUrl, setAvatarImgUrl] = useState(ProfileImage);
    const [searchedItemText, setSearchedItemText] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAvatarImgUrl = async () => {
            try {
                const response = await fetch(`https://snap-sync-tau.vercel.app/allusers/${userId}/avatarimg`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setAvatarImgUrl(data.avatarimgUrl);
            } catch (error) {
                console.error('Error fetching avatar image URL:', error);
            }
        };

        if (userLoggedIn) {
            fetchAvatarImgUrl();
        }
    }, [userLoggedIn, userId]);

    const handleSearchChanged = (e) => {
      setSearchedItemText(e.target.value);
    }

    const handleSearchButtonClicked = () => {
      const search = searchedItemText;
      if(search.length === 0){
        return;
      }
      else{
        setSearchedItem(search);
        navigate('/search');
      }
    }

    const profileClicked = () => {
      navigate('/user-profile');
      setUserProfileClicked(userName);
      setUserProfileImage(avatarUrl);
    }

  return (
    <div className="nav-bar">
      <div className="yt-logo nav-item">
        <img src={ytLogo} alt="YouTube Logo" className="yt-logo-icon" />{" "}
        {/* Use imported image */}
        <h2 className="yt-text">CloneTube</h2>
      </div>
      <div className="search nav-item">
        <input type="text" className="search-input" placeholder="search" onChange={handleSearchChanged}/>
        <button className="search-button" onClick={handleSearchButtonClicked}>
          {" "}
          <IoSearchOutline />{" "}
        </button>
      </div>
      <div className="profile nav-item">
        {userLoggedIn ? (
            <div className="navbar-profile-main-component">
                <Link to="/logout">
                    {" "}
                    <button className="navbar-auth-button-logout">Logout</button>{" "}
                </Link>
                <div className="navbar-profile-icon" onClick={() => profileClicked()}>
                    <img className="navbar-profile-image" src={avatarImgUrl} alt="Profile" />
                </div>
            </div>
        ) : (
          <div className="navbar-auth-links">
            <Link to="/login">
              {" "}
              <button className="navbar-auth-button-login">Login</button>{" "}
            </Link>
            <Link to="/register">
              {" "}
              <button className="navbar-auth-button-register">
                Register
              </button>{" "}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
