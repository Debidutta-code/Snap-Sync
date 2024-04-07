import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import History from './pages/History';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Subscriptions from './pages/Subscriptions';
import WatchLater from './pages/WatchLater';
import MainVideoPlay from './pages/MainVideoPlay';
import { VideoProvider } from './pages/VideoContext';
import UploadVideo from './pages/UploadVideo';
import Login from './authentication/Login';
import Register from './authentication/Register';
import Logout from './components/Logout';
import MainVideoPlay2 from './pages/MainVideoPlay2';
import MyVideos from './pages/MyVideos';
import SearchedContentPage from './pages/SearchedContentPage';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <Router>
      <VideoProvider>
        <Navbar />
        <Sidebar>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/watchlater" element={<WatchLater />} />
            <Route path="/history" element={<History />} />
            <Route path="/subs" element={<Subscriptions />} />
            <Route path="/my-videos" element={<MyVideos />} />
            {/* Use a dynamic segment to capture videoUrl as a parameter */}
            <Route path="/video" element={<MainVideoPlay />} />
            <Route path="/video2" element={<MainVideoPlay2 />} />
            <Route path='/upload-video' element={<UploadVideo />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/logout' element={<Logout />} />
            <Route path='/search' element={<SearchedContentPage />} />
            <Route path='/user-profile' element={<UserProfile />} />

          </Routes>
        </Sidebar>
      </VideoProvider>
    </Router>
  );
}

export default App;
