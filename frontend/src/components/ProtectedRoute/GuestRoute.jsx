/* eslint-disable react/prop-types */
import { Navigate } from 'react-router-dom';

const GuestRoute = ({ children }) => {
  // const cookies = new Cookies();
  // const token = cookies.get('token'); // Check for the presence of the token cookie.
  const storedData = localStorage.getItem('user-info');
  const token = storedData ? JSON.parse(storedData).token : null;


  return !token ? children : <Navigate to="/" />;
};

export default GuestRoute;