import React, { useState, useContext, useEffect } from 'react';
import { userDataContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';
import { MdKeyboardBackspace, MdPerson, MdImage, MdSave } from 'react-icons/md';
import { FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import img1 from '../assets/image1.png';
import img2 from '../assets/image2.jpg';
import img4 from '../assets/image4.png';
import img5 from '../assets/image5.png';
import img6 from '../assets/image6.jpeg';
import img7 from '../assets/image7.jpeg'; 

function Customize() {
  const { userData, serverUrl, setUserData, setFrontendImage, setBackendImage } = useContext(userDataContext);
  const navigate = useNavigate();

  const [assistantName, setAssistantName] = useState(userData?.assistantName || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(userData?.assistantImage || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Available assistant images (use Vite asset imports)
  const assistantImages = [
    img1,
    img2,
    img4,
    img5,
    img6,
    img7
  ];

  useEffect(() => {
    if (userData?.assistantImage) {
      setPreviewImage(userData.assistantImage);
    }
  }, [userData?.assistantImage]);

  const handleImageSelect = (imagePath) => {
    setSelectedImage(imagePath);
    setPreviewImage(imagePath);
    setError('');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setSelectedImage(file);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setPreviewImage(userData?.assistantImage || '');
    setError('');
  };

  const handleSave = async () => {
    if (!assistantName.trim()) {
      setError('Please enter an assistant name');
      return;
    }

    if (!previewImage) {
      setError('Please select an assistant image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;

      // If a new file was selected, send it as multipart with field name 'assistantImage'
      if (selectedImage instanceof File) {
        const formData = new FormData();
        formData.append('assistantName', assistantName.trim());
        formData.append('assistantImage', selectedImage);

        response = await axios.post(`${serverUrl}/api/user/update`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Otherwise, send URL reference
        response = await axios.post(`${serverUrl}/api/user/update`, {
          assistantName: assistantName.trim(),
          imageUrl: previewImage
        }, { withCredentials: true });
      }

      if (response.data.success) {
        const imageUrl = response.data.user?.assistantImage || previewImage;
        setSuccess('Assistant updated successfully!');
        
        // Update context
        setUserData(prev => ({
          ...prev,
          assistantName: assistantName.trim(),
          assistantImage: imageUrl
        }));

        // Update frontend and backend images
        setFrontendImage(imageUrl);
        setBackendImage(imageUrl);

        // Redirect after showing success message
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating assistant:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while updating your assistant');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <MdKeyboardBackspace className="w-6 h-6" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Customize Your Assistant</h1>
            <p className="text-gray-300 mt-2">Personalize your virtual assistant's appearance and name</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Assistant Name Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <MdPerson className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Assistant Name</h2>
              </div>
              
              <div className="space-y-3">
                <label htmlFor="assistantName" className="block text-sm font-medium text-gray-200">
                  What should I call you?
                </label>
                <input
                  type="text"
                  id="assistantName"
                  value={assistantName}
                  onChange={(e) => {
                    setAssistantName(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter assistant name (e.g., Jarvis, Alexa, Siri)"
                  maxLength={30}
                />
                <p className="text-xs text-gray-400">
                  {assistantName.length}/30 characters
                </p>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <MdImage className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Upload Custom Image</h2>
              </div>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={loading}
                  />
                  <label
                    htmlFor="imageUpload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <FaUpload className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Click to upload image</p>
                      <p className="text-gray-400 text-sm">PNG, JPG up to 5MB</p>
                    </div>
                  </label>
                </div>

                {previewImage && (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-600"
                    />
                    <button
                      onClick={removeSelectedImage}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                      title="Remove image"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading || !assistantName.trim() || !previewImage}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <MdSave className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>

            {/* Messages */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}
          </div>

          {/* Right Column - Image Gallery */}
          <div className="space-y-6">
            {/* Preset Images Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Choose from Preset Images</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {assistantImages.map((imagePath, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                      previewImage === imagePath ? 'border-blue-500 shadow-lg shadow-blue-500/50' : 'border-gray-600 hover:border-blue-400'
                    }`}
                    onClick={() => handleImageSelect(imagePath)}
                  >
                    <img
                      src={imagePath}
                      alt={`Assistant ${index + 1}`}
                      className="w-full h-24 sm:h-32 object-cover"
                    />
                    {previewImage === imagePath && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="bg-blue-500 text-white p-1 rounded-full">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
              
              <div className="text-center space-y-4">
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Assistant Preview"
                      className="w-48 h-64 mx-auto object-cover rounded-2xl shadow-2xl shadow-blue-950 hover:shadow-blue-500 transition-all duration-300 transform hover:scale-105"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {assistantName || 'Your Assistant'}
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-64 mx-auto bg-gray-700 rounded-2xl flex items-center justify-center">
                    <p className="text-gray-400 text-center">
                      Select an image<br />to see preview
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customize;