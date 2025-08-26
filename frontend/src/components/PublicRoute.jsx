import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { userDataContext } from '../context/userContext';

const PublicRoute = ({ children }) => {
  const { userData } = useContext(userDataContext);

  return !userData ? children : <Navigate to="/" />;
};

export default PublicRoute;
