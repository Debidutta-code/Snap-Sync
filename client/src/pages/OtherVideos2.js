import { useEffect, useState } from "react";
import "./OtherVideos.css";
import { useVideo } from "./VideoContext";
import { useNavigate } from "react-router-dom";

const OtherVideos2 = () => {
    const [allVideos, setAllVideos] = useState([]);
    const { setVideoId, setVideoTitle, setVideoUrl } = useVideo();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(`http://localhost:8080/get-videos?page=${1}&limit=${12}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch videos");
                }
                const data = await response.json();
                setAllVideos(data);
            } catch (error) {
                console.error("Error fetching videos:", error.message);
            }
        };

        fetchVideos();
    }, []);

    const handleVideoClicked = (_id, videoUrl, title) => {
        setVideoId(_id);
        setVideoUrl(videoUrl);
        setVideoTitle(title);
        navigate(`/video`);
    }

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

    return (
        <>
            {allVideos.map(video => (
                <div key={video.videoId} className="otherVideos-container" onClick={() => handleVideoClicked(video._id, video.videoUrl, video.title)}>
                    <div className="boxy-videos">
                        <div className="otherVideos-video-container">
                            <img
                                className="otherVideos-image-tag"
                                src={video.imgUrl}
                                alt="Video Thumbnail"
                            />
                        </div>
                        <div className="otherVideos-text-container">
                            <h3 className="otherVideos-video-title">{video.title}</h3>
                            <div className="otherVideos-video-info">
                                <h4> {video.userName} </h4>
                                <div className="otherVideos-views-and-datePosted">
                                    <p className="otherVideos-views"> {video.viewsCount} views </p>
                                    <p className="otherVideos-date-posted"> {getTimeElapsed(video.postedAt)} </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default OtherVideos2;
