import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { userDataContext } from '../context/userContext';

const PrivateRoute = ({ children }) => {
  const { userData } = useContext(userDataContext);

  const isAuthenticated = userData && userData.assistantName && userData.assistantImage;

  return isAuthenticated ? children : <Navigate to="/customize" />;
};

export default PrivateRoute;
