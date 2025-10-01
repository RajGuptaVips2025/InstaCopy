/* eslint-disable react/prop-types */
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Retrieve the stored user information from localStorage
  const storedData = localStorage.getItem('user-info');
  // Parse the data to extract the token (if it exists)
  const token = storedData ? JSON.parse(storedData).token : null;

  // If a token exists, render the children (protected content)
  if (token) {
    return children;
  }

  // Otherwise, redirect to the login page
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;