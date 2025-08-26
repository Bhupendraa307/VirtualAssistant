import React, { useState, useContext } from "react";
import { userDataContext } from "../../context/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const { serverUrl } = useContext(userDataContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      // Match backend route: /api/auth/forgot-password/send-otp
      const res = await axios.post(`${serverUrl}/api/auth/forgot-password/send-otp`, { email });
      setMessage(res.data.message);
      // Navigate to OTP entry screen with email prefilled
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4 bg-gray-900 text-white">
      <form
        onSubmit={handleSendOtp}
        className="bg-[#000000cc] p-6 rounded-lg max-w-md w-full flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="p-3 rounded bg-gray-800 text-white outline-none border border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 py-3 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
        {message && <p className="text-green-400">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}

export default ForgotPassword;
