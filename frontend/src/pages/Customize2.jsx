import React, { useState, useContext } from 'react';
import { userDataContext } from '../context/userContext';
import axios from 'axios';
import { MdKeyboardBackspace } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

function Customize2() {
  const { userData, backendImage, selectedImage, serverUrl, setUserData, setBackendImage } = useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(userData?.assistantName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpdateAssistant = async () => {
    if (!assistantName.trim()) {
      setError('Please enter an assistant name');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Frontend selectedImage:', selectedImage);
      let formData = new FormData();
      formData.append("assistantName", assistantName.trim());
      
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else if (selectedImage) {
        formData.append("imageUrl", selectedImage);
      }

      const result = await axios.post(`${serverUrl}/api/user/update`, formData, { withCredentials: true });
      console.log(result.data);
      setUserData(result.data);
      navigate("/"); // Navigate to home after successful creation
    } catch (error) {
      console.error("Error updating assistant:", error);
      setError(error.response?.data?.message || "Failed to update assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <MdKeyboardBackspace 
        className="absolute top-[20px] left-[20px] sm:top-[30px] sm:left-[30px] text-white w-[25px] h-[25px] sm:w-[30px] sm:h-[30px] cursor-pointer hover:text-blue-400 transition-colors" 
        onClick={() => {navigate(-1)}} 
      />
      
      <div className="flex flex-col items-center w-full max-w-[800px] mx-auto mt-16 sm:mt-12 lg:mt-0">
        <h1 className="text-white mb-[30px] sm:mb-[40px] text-[24px] sm:text-[30px] lg:text-[36px] text-center font-bold px-4">
          Name your <span className="text-blue-500">Assistant</span>
        </h1>

        <div className="w-full flex flex-col items-center gap-6 sm:gap-8">
          <div className="w-full max-w-[600px]">
            <label className="block text-white text-sm sm:text-base mb-3 text-center">
              What would you like to call your assistant?
            </label>
            <input
              type="text"
              placeholder="e.g., Alexa, Siri, Jarvis..."
              className="w-full h-12 sm:h-14 outline-none border-2 border-white bg-transparent placeholder-gray-300 px-4 sm:px-5 rounded-full text-white text-base sm:text-lg focus:border-blue-400 transition-colors"
              required
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="w-full max-w-[600px]">
            <label className="block text-white text-sm sm:text-base mb-3 text-center">
              Upload Custom Image (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setBackendImage(file);
                    setError('');
                  }
                }}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="w-full max-w-[600px] text-center">
              <p className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30">
                {error}
              </p>
            </div>
          )}

          {assistantName.trim() && (
            <button
              className="w-full max-w-[400px] sm:max-w-[300px] h-[50px] sm:h-[60px] mt-[20px] sm:mt-[30px] text-black font-semibold bg-white rounded-full text-[16px] sm:text-[19px] cursor-pointer hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              disabled={loading}
              onClick={handleUpdateAssistant}
            >
              {!loading ? 'Create Your Assistant' : 'Creating...'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Customize2;