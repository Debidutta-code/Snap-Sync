import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "../authentication/LoadingSpinner";
import "./UploadVideo.css";
import { RiFolderUploadFill } from "react-icons/ri";
import { useVideo } from "./VideoContext";
import { useNavigate } from "react-router-dom";
import ShowAlert from "../authentication/ShowAlert";

const UploadVideo = () => {
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [alertMessage, setAlertMessage] = useState("Uploaded Successfully");

  const { userLoggedIn, userId, userName, avatarUrl } = useVideo();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoggedIn) {
      navigate("/login");
    }
  });

  // brought from simple upload
  const [img, setImg] = useState(null);
  const [video, setVideo] = useState(null);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const handleThumbnailChange = (e) => {
    console.log(userLoggedIn);
    const file = e.target.files[0];
    setImg(file);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview); // Revoke previous object URL
    }
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handlePreviewVideoChange = (e) => {
    // Renamed from handleVideoChange to handlePreviewVideoChange
    const file = e.target.files[0];
    setVideo(file);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview); // Revoke previous object URL
    }
    setVideoPreview(URL.createObjectURL(file));
  };

  const handlePreviewClick = (inputRef) => () => {
    inputRef.current.click();
  };

  const uploadFile = async (type) => {
    const data = new FormData();
    data.append("file", type === "image" ? img : video);
    data.append(
      "upload_preset",
      type === "image" ? "images_preset" : "videos_preset"
    );

    try {
      let cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      let resourceType = type === "image" ? "image" : "video";
      let api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const res = await axios.post(api, data);
      const { secure_url } = res.data;
      return secure_url;
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const likeCount = 0;
      const viewsCount = 0;
      const disLikeCount = 0;
      // console.log(title, description, likeCount, disLikeCount, viewsCount);

      const imgUrl = await uploadFile("image");
      const videoUrl = await uploadFile("video");

      setImg(null);
      setVideo(null);
      setThumbnailPreview(null);
      setVideoPreview(null);

      const response = await fetch("https://snap-sync-tau.vercel.app/upload-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          userName,
          title,
          description,
          viewsCount,
          likeCount,
          disLikeCount,
          imgUrl,
          videoUrl,
          avatarUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLoading(false);
        setIsUploaded(true);
      } else {
        console.log(data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setAlertMessage("Error while uploading video");
    }
  };

  const handleOkClick = () => {
    navigate('/');
  }

  return (
    <div className="upload-main-container">
      {loading && <LoadingSpinner />}
      {/* {loading && <PropagateLoader color="#ffffff" />} */}
      {isUploaded && (
                <ShowAlert message={alertMessage} onClose={handleOkClick} />
            )}
      <div className={`upload-video-form`}>
        <h2 className={`upload-video-heading`}>Upload Video</h2>
        <form onSubmit={handleSubmit} className={`upload-video-form`}>
          <div className="upload-first-container">
            <div className={`upload-video-form-group`}>
              <label htmlFor="video" className={`upload-video-label`}>
                Video:
              </label>
              <div
                className="preview-wrapper"
                onClick={handlePreviewClick(videoInputRef)}
              >
                {videoPreview ? (
                  <video controls className="video-preview" key={videoPreview}>
                    <source src={videoPreview} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="preview-overlay">
                    <RiFolderUploadFill className="upload-icon" />
                  </div>
                )}
              </div>
              <input
                type="file"
                id="video"
                onChange={handlePreviewVideoChange} // Changed from handleVideoChange to handlePreviewVideoChange
                className={`upload-video-input`}
                ref={videoInputRef}
                required
              />
            </div>
            <div className={`upload-video-form-group`}>
              <label htmlFor="thumbnail" className={`upload-video-label`}>
                Thumbnail:
              </label>
              <div
                className="preview-wrapper"
                onClick={handlePreviewClick(thumbnailInputRef)}
              >
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className="thumbnail-preview"
                    key={thumbnailPreview}
                  />
                ) : (
                  <div className="preview-overlay">
                    <RiFolderUploadFill className="upload-icon" />
                  </div>
                )}
              </div>
              <input
                type="file"
                id="thumbnail"
                onChange={handleThumbnailChange}
                className={`upload-video-input`}
                ref={thumbnailInputRef}
                required
              />
            </div>
          </div>
          <div className={`upload-video-form-group-title`}>
            <label htmlFor="title" className={`upload-video-label`}>
              Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`upload-video-input uplaod-title`}
              required
            />
          </div>
          <div className="upload-video-form-group">
            <label htmlFor="description" className="upload-video-label">
              Description:
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="upload-video-textarea upload-description"
              placeholder="Enter description with line breaks..."
              rows={5} // Set the number of visible rows
              cols={50} // Set the number of visible columns
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`upload-video-button`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;
