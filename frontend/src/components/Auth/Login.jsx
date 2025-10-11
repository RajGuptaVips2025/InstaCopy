// Login.jsx
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addUser } from '@/features/userDetail/userDetailsSlice';
import { toast } from 'react-toastify';
import { googleAuth } from './api';
import { motion } from "framer-motion";
import { IoEarthSharp } from "react-icons/io5";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleResponse = async (response) => {
    try {
      if (response['code']) {
        const result = await googleAuth(response['code']);
        const { email, fullName, username, profilePicture } = result.data.user;
        const token = result.data.token;

        dispatch(addUser({
          fullName,
          username,
          email,
          id: result.data.user._id,
          profilePic: profilePicture,
        }));

        localStorage.setItem('user-info', JSON.stringify({ email, name: fullName, profilePicture, token }));

        if (token) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 7);
          document.cookie = `userToken=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;
        }

        toast.success('Google login successful');
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
      handleGoogleResponse(response);
    },
    onError: (error) => {
      console.error("Google login failed:", error);
      toast.error("Google login failed");
    },
    flow: "auth-code",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex items-center justify-center min-h-screen bg-[#0f172a]"
    >
      {/* Card Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-[#1e293b] rounded-2xl shadow-2xl p-10 flex flex-col items-center w-[90%] max-w-md"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 400 100"
          className="w-52 h-auto mb-4 text-purple-500"
        >
          <motion.text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="36"
            fontWeight="bold"
            fill="currentColor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Login to SocialSphere
          </motion.text>
        </motion.svg>

        <motion.div
          initial={{ rotate: -20, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <IoEarthSharp className="text-purple-500 w-14 h-14" />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => googleLogin()}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-md transition duration-200"
        >
          Login with Google
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Login;




// // Login.jsx
// import { useGoogleLogin } from '@react-oauth/google';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { addUser } from '@/features/userDetail/userDetailsSlice';
// import { toast } from 'react-toastify';
// import { googleAuth } from './api'; // This helper should send the code to your backend

// const Login = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   // This callback handles the response from Google after the user signs in.
//   const handleGoogleResponse = async (response) => {
//     try {
//       // The response should include an authorization code when using 'auth-code' flow.
//       if (response['code']) {
//         // Send the code to your backend to exchange for tokens and user info.
//         const result = await googleAuth(response['code']);
//         // Destructure user details from the backend response.
//       console.log(result.data)
//         const { email, fullName, username, profilePicture } = result.data.user;
//         console.log(result.data.user)
//         const token = result.data.token;

//         // Dispatch the user data to Redux.
//         dispatch(addUser({
//           fullName,
//           username, // or adjust if you want a different username
//           email,
//           id: result.data.user._id,
//           profilePic: profilePicture,
//         }));

//         // Optionally, store the token or user data in localStorage.
//         // Store user info in localStorage
//         localStorage.setItem('user-info', JSON.stringify({ email, name, profilePicture, token }));

//         // Store token in cookies (expires in 7 days)
//         if (token) {
//           const expiryDate = new Date();
//           expiryDate.setDate(expiryDate.getDate() + 7); // Expires in 7 days

//           document.cookie = `userToken=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;
//         }

//         toast.success('Google login successful');
//         // Navigate to the user's profile/dashboard.
//         navigate(`/profile/${result.data.user.username}`);
//       } else {
//         toast.error('No authorization code received');
//       }
//     } catch (err) {
//       console.error('Google login error:', err.message);
//       toast.error('Google login failed');
//     }
//   };

//   const googleLogin = useGoogleLogin({
//     onSuccess: (response) => {
//       console.log("Google Login Response:", response); // Log the response
//       handleGoogleResponse(response);
//     },
//     onError: (error) => {
//       console.error("Google login failed:", error);
//       toast.error("Google login failed");
//     },
//     flow: "auth-code",
//   });

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       {/* Logo or branding can go here */}
//       <div className="mb-8">
//         <img
//           src="https://static.cdninstagram.com/rsrc.php/v3/yM/r/8n91YnfPq0s.png"
//           alt="Logo"
//           style={{ width: '175px', height: '51px' }}
//         />
//       </div>

//       {/* Google Login Button */}
//       <button
//         onClick={() => googleLogin()}
//         className="w-80 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded shadow-md"
//       >
//         Login with Google
//       </button>
//     </div>
//   );
// };

// export default Login;





















