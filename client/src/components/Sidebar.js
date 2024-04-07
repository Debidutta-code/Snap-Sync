import React, { useState, useEffect } from "react";
import { FaHome, FaHistory, FaBars } from "react-icons/fa";
import { MdOutlineSubscriptions } from "react-icons/md";
import { MdOutlineWatchLater } from "react-icons/md";
import { FiUpload } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { MdVideoLibrary } from "react-icons/md";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { MdOutlineWorkHistory } from "react-icons/md";
import { SiLeetcode } from "react-icons/si";
import "./Sidebar.css";

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [hasOpened, setHasOpened] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
    if (!hasOpened) {
      setHasOpened(true);
    }
  };

  useEffect(() => {
    if (isOpen && !hasOpened) {
      const timer = setTimeout(() => {
        setHasOpened(true);
      }, 500); // 0.5 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasOpened]);

  const menuItems = [
    {
      path: "/",
      name: "Home",
      icon: <FaHome />,
    },
    {
      path: "/my-videos",
      name: "My Videos",
      icon: <MdVideoLibrary />,
    },
    {
      path: "/watchlater",
      name: "Watch Later",
      icon: <MdOutlineWatchLater />,
    },
    {
      path: "/history",
      name: "History",
      icon: <FaHistory />,
    },
    {
      path: "/subs",
      name: "Subscriptions",
      icon: <MdOutlineSubscriptions />,
    },
    {
      path: "/upload-video",
      name: "Upload Video",
      icon: <FiUpload />,
    },
  ];

  return (
    <div className="container">
      <div style={{ minWidth: isOpen ? "12%" : "4%" }} className="sidebar">
        <div className="top_section">
          <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">
            -
          </h1>
          <div
            style={{ marginLeft: isOpen ? "125px" : "0px" }}
            className="bars"
          >
            <FaBars onClick={toggle} />
          </div>
        </div>
        {menuItems.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            className="link"
            activeClassName="active"
          >
            <div className="icon">{item.icon}</div>
            <div
              style={{
                opacity: isOpen ? 1 : 0.5,
                display: isOpen && hasOpened ? "block" : "none"
              }}
              className="link_text"
            >
              {item.name}
            </div>
          </NavLink>
        ))}

        <div className="sidebar-contact-links" style={{ flexDirection: isOpen ? "" : "column" }}>
          <a
            href="https://github.com/debidutta-code"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub />
          </a>

          <a
            href="https://www.linkedin.com/in/debidutta-acharya/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </a>

          <a
            href="https://leetcode.com/codewith_dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiLeetcode />
          </a>

          <a href="https://dev-my-portfolio-website.netlify.app/" rel="noopener noreferrer" target="_blank">
            <MdOutlineWorkHistory />
          </a>
        </div>
      </div>
      <main className="children-class">{children}</main>
    </div>
  );
};

export default Sidebar;