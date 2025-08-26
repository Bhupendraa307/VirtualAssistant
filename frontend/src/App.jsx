import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/forgotPassword/ForgotPassword';
import ResetWithOtp from './pages/forgotPassword/ResetWithOtp';
import Customize from './pages/Customize';
import Customize2 from './pages/Customize2';
import Home from './pages/Home';

import { userDataContext } from './context/userContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { userData } = useContext(userDataContext);

  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetWithOtp />}
        />
        <Route
          path="/customize"
          element={
            userData ? <Customize /> : <Navigate to="/signup" />
          }
        />
        <Route
          path="/customize2"
          element={
            userData ? <Customize2 /> : <Navigate to="/signup" />
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
