// App.jsx
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { setOnlineUsers } from './features/userDetail/userDetailsSlice';
import Profile from './components/Profile/Profile';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import BottomNavigation from './components/BottomNavigation';
import Navbar from './components/Navbar';
import Home from './components/Home/Home';
import Explore from './components/Explore/Explore';
import ReelSection from './components/Explore/ReelSection';
import { ProfileEdit } from './components/Profile/profile-edit';
import { ChatComponent } from './components/Chat/instagram-chat';
import Sidebar from './components/Home/Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GuestRoute from './components/ProtectedRoute/GuestRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';

function ChildApp() {
  const userDetails = useSelector((state) => state.counter.userDetails);
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Select the correct backend URL using environment variables
  const BASE_URL =
    import.meta.env.MODE === "development"
      ? import.meta.env.VITE_API_BASE_URL_DEV
      : import.meta.env.VITE_API_BASE_URL_PROD;

  // Initialize the socket connection once user details are available.
  useEffect(() => {
    if (userDetails?.id) {
      // Create the socket connection with the backend URL.
      const socket = io(BASE_URL, { query: { userId: userDetails.id } });
      socketRef.current = socket;

      // Set up event listeners.
      socket.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });
      socket.on('videoCallOffer', async ({ from, offer }) => {
        if (offer.type === 'offer') {
          navigate(`/call/${from}`);
        }
      });

      // Clean up the socket on unmount or when userDetails change.
      return () => {
        socket.disconnect();
        dispatch(setOnlineUsers([]));
      };
    }
  }, [userDetails, dispatch, navigate, BASE_URL]);

  // Determine when to hide Navbar and show Sidebar based on the current route.
  const hideNavbar = ['/login', '/register', '/direct/inbox'].includes(location.pathname) ||
    matchPath("/profile/:username", location.pathname) ||
    matchPath("/call/:remoteUserId/", location.pathname) ||
    matchPath("/profile/:username/:reelId", location.pathname);

  const showSidebar = ['/', '/profile/:username', '/explore', '/reels', '/admindashboard']
    .some((path) => location.pathname.startsWith(path)) &&
    !['/login', '/register', '/direct/inbox'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {showSidebar && <Sidebar />}
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home socketRef={socketRef} /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:username/:reelId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/direct/inbox/:id?" element={<ProtectedRoute><ChatComponent socketRef={socketRef} /></ProtectedRoute>} />
        <Route path="/explore/" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/reels/" element={<ProtectedRoute><ReelSection /></ProtectedRoute>} />
        <Route path="/accounts/edit/:id" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      </Routes>
      <BottomNavigation />
    </>
  );
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <ChildApp />
        <ToastContainer />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;