import React, { useState, useContext, useEffect } from "react";
import { userDataContext } from "../../context/userContext";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function ResetWithOtp() {
  const { serverUrl } = useContext(userDataContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill email from navigation state
  useEffect(() => {
    const stateEmail = location?.state?.email;
    if (stateEmail) setEmail(stateEmail);
  }, [location?.state?.email]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email || !otp || !newPassword) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      // Match backend route: /api/auth/forgot-password/verify-otp
      const res = await axios.post(`${serverUrl}/api/auth/forgot-password/verify-otp`, {
        email,
        otp,
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4 bg-gray-900 text-white">
      <form
        onSubmit={handleReset}
        className="bg-[#000000cc] p-6 rounded-lg max-w-md w-full flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Reset Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="p-3 rounded bg-gray-800 text-white outline-none border border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <input
          type="text"
          placeholder="Enter OTP"
          className="p-3 rounded bg-gray-800 text-white outline-none border border-gray-600"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={loading}
          required
        />
        <input
          type="password"
          placeholder="Enter new password"
          className="p-3 rounded bg-gray-800 text-white outline-none border border-gray-600"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 py-3 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        {message && <p className="text-green-400">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}

export default ResetWithOtp;
