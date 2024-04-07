import { useEffect } from "react";
import { useVideo } from "../pages/VideoContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const { setUserLoggedIn, setUserId, setUserName } = useVideo();
    const navigate = useNavigate();

    useEffect(() => {
        // Log out the user by setting userLoggedIn, userId, and userName to null
        setUserLoggedIn(false);
        setUserId(null);
        setUserName(null);

        // Navigate to the login page
        navigate("/login");
    }, [navigate, setUserLoggedIn, setUserId, setUserName]); // Include navigate in the dependency array

    return null; // You can return null or an empty fragment <></>
}

export default Logout;
