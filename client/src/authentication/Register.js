import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AvatarImage from "../assets/avatar1.png";
import "./Register.css";
import axios from "axios";
import { BarLoader } from "react-spinners";
import ShowAlert from "./ShowAlert";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(AvatarImage);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [emailAvailable, setEmailAvailable] = useState(true);
  const [passwordRequirements, setPasswordRequirements] = useState([
    "Password must be 8 characters",
    "Password must have at least one special character",
    "Password must have at least one uppercase character",
    "Password must have at least one lowercase character",
  ]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUsernameAvailable(true);
    setEmailAvailable(true);
  }, [userName, email]);

  const checkUsernameAvailability = async () => {
    if (userName.trim() === "") {
      return true; // Assume username is available if it's empty
    }

    try {
      const res = await axios.get(
        `https://snap-sync-tau.vercel.app/check-username/${userName}`
      );
      setUsernameAvailable(res.data.available);
      return res.data.available; // Return the availability status
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false; // Return false in case of error
    }
  };

  const checkEmailAvailability = async () => {
    if (email.trim() === "") {
      return true; // Assume email is available if it's empty
    }

    try {
      const res = await axios.get(`https://snap-sync-tau.vercel.app/check-email/${email}`);
      setEmailAvailable(res.data.available);
      return res.data.available; // Return the availability status
    } catch (error) {
      console.error("Error checking email availability:", error);
      return false; // Return false in case of error
    }
  };

  const uploadFile = async (type) => {
    const data = new FormData();
    data.append("file", avatar);
    data.append("upload_preset", "images_preset");

    try {
      let cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      let resourceType = type === "image" ? "image" : "video";
      let api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      setLoading(true);

      const res = await axios.post(api, data);
      const { secure_url } = res.data;

      setLoading(false);

      return secure_url;
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleAvatar = (event) => {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setAvatar(reader.result);
    };

    if (selectedFile) {
      event.target.nextElementSibling.style.display = "none";
      reader.readAsDataURL(selectedFile);
    } else {
      event.target.nextElementSibling.style.display = "inline-block";
    }
  };

  const handleUsername = (e) => {
    setUserName(e.target.value);
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const checkPasswordStrength = (password) => {
    let requirements = [
      "Password must be 8 characters",
      "Password must have at least one special character",
      "Password must have at least one uppercase character",
      "Password must have at least one lowercase character",
    ];

    if (password.length >= 8) {
      requirements = requirements.filter(
        (req) => !req.includes("8 characters")
      );
    }
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      requirements = requirements.filter(
        (req) => !req.includes("special character")
      );
    }
    if (/[A-Z]/.test(password)) {
      requirements = requirements.filter(
        (req) => !req.includes("uppercase character")
      );
    }
    if (/[a-z]/.test(password)) {
      requirements = requirements.filter(
        (req) => !req.includes("lowercase character")
      );
    }

    setPasswordRequirements(requirements);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check username availability
    const isUsernameAvailable = await checkUsernameAvailability();

    // Check email availability
    const isEmailAvailable = await checkEmailAvailability();

    // If username or email is not available, return early
    if (!isUsernameAvailable || !isEmailAvailable) {
      return;
    }

    // Check if all password requirements are fulfilled
    if (passwordRequirements.length > 0) {
      alert("Please fulfill all password requirements.");
      return;
    }

    setLoading(true);

    const avatarimgUrl = await uploadFile("image");

    const formData = {
      username: userName,
      email: email,
      password: password,
      avatarimgUrl: avatarimgUrl,
    };

    try {
      const res = await fetch("https://snap-sync-tau.vercel.app//register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setLoading(false);
        setRegistrationSuccess(true);
      } else {
        console.error("Registration failed");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
    }
  };

  const handleOkClick = () => {
    navigate("/login");
  };

  return (
    <>
      <div className="register-container">
        {loading && (
          <div className="register-loader">
            <BarLoader
              color="#f6dede"
              cssOverride={{}}
              height={5}
              speedMultiplier={1.5}
              width={450}
            />
          </div>
        )}
        {registrationSuccess && (
          <ShowAlert
            message="Your Account Created Successfully"
            onClose={handleOkClick}
          />
        )}
        <div className="register-content">
          <h2 className="register-heading">Create an Account</h2>
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-form-group-avatar">
              <label htmlFor="avatar" className="avatar-label">
                <img src={avatar} alt="Avatar" className="avatar-image" />
              </label>
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/*"
                className="register-input-avatar"
                onChange={handleAvatar}
              />
              <h2 className="choose-avatar">Choose Avatar</h2>
            </div>

            <div className="register-form-group">
              <label htmlFor="username" className="register-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className={`register-input ${
                  !usernameAvailable && "unavailable"
                }`}
                placeholder="Enter your username"
                required
                value={userName}
                onChange={handleUsername}
                onBlur={checkUsernameAvailability}
              />
            </div>
            {!usernameAvailable && (
              <span className="availability-message">
                Username Already Exists
              </span>
            )}

            <div className="register-form-group">
              <label htmlFor="email" className="register-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`register-input ${!emailAvailable && "unavailable"}`}
                placeholder="Enter your email"
                required
                onChange={handleEmail}
                onBlur={checkEmailAvailability}
              />
            </div>
            {!emailAvailable && (
              <span className="availability-message">
                This Email Already Exists
              </span>
            )}

            <div className="register-form-group register-form-group-password">
              <label htmlFor="password" className="register-label">
                Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="register-input"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={handlePassword}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              <div className="password-requirements">
                <ul>
                  {passwordRequirements.map((requirement, index) => (
                    <li key={index} className="password-requirement">
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="submit"
              className={`register-button ${
                !usernameAvailable || !emailAvailable ? "no-drop" : ""
              }`}
              disabled={loading || !usernameAvailable || !emailAvailable}
              style={{
                cursor:
                  !usernameAvailable || !emailAvailable ? "no-drop" : "pointer",
              }}
            >
              {loading ? "Loading..." : "Register"}
            </button>
          </form>
          <p className="register-login-link">
            Already have an account?{" "}
            <Link to="/login" className="register-login-link-a">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
