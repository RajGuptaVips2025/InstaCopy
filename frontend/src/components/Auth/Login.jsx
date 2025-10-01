// Login.jsx
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addUser } from '@/features/userDetail/userDetailsSlice';
import { toast } from 'react-toastify';
import { googleAuth } from './api'; // This helper should send the code to your backend

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // This callback handles the response from Google after the user signs in.
  const handleGoogleResponse = async (response) => {
    try {
      // The response should include an authorization code when using 'auth-code' flow.
      if (response['code']) {
        // Send the code to your backend to exchange for tokens and user info.
        const result = await googleAuth(response['code']);
        // Destructure user details from the backend response.
      console.log(result.data)
        const { email, fullName, username, profilePicture } = result.data.user;
        console.log(result.data.user)
        const token = result.data.token;

        // Dispatch the user data to Redux.
        dispatch(addUser({
          fullName,
          username, // or adjust if you want a different username
          email,
          id: result.data.user._id,
          profilePic: profilePicture,
        }));

        // Optionally, store the token or user data in localStorage.
        // Store user info in localStorage
        localStorage.setItem('user-info', JSON.stringify({ email, name, profilePicture, token }));

        // Store token in cookies (expires in 7 days)
        if (token) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 7); // Expires in 7 days

          document.cookie = `userToken=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;
        }

        toast.success('Google login successful');
        // Navigate to the user's profile/dashboard.
        navigate(`/profile/${result.data.user.username}`);
      } else {
        toast.error('No authorization code received');
      }
    } catch (err) {
      console.error('Google login error:', err.message);
      toast.error('Google login failed');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log("Google Login Response:", response); // Log the response
      handleGoogleResponse(response);
    },
    onError: (error) => {
      console.error("Google login failed:", error);
      toast.error("Google login failed");
    },
    flow: "auth-code",
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Logo or branding can go here */}
      <div className="mb-8">
        <img
          src="https://static.cdninstagram.com/rsrc.php/v3/yM/r/8n91YnfPq0s.png"
          alt="Logo"
          style={{ width: '175px', height: '51px' }}
        />
      </div>

      {/* Google Login Button */}
      <button
        onClick={() => googleLogin()}
        className="w-80 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded shadow-md"
      >
        Login with Google
      </button>
    </div>
  );
};

export default Login;








