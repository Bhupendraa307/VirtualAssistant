import React, { useContext } from 'react'
import { userDataContext } from '../context/userContext';

function Card({image}) {
    const {serverUrl, userData, setUserData,
    frontendImage, setFrontendImage,
    backendImage, setBackendImage, selectedImage, setSelectedImage} = useContext(userDataContext);

  return (
    <div className={`w-[120px] h-[200px] sm:w-[140px] sm:h-[230px] md:w-[150px] md:h-[250px] bg-[#020220]
     border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl 
     hover:shadow-blue-500/50 cursor-pointer hover:border-2 hover:border-blue-300 transition-all duration-300 transform hover:scale-105
     ${selectedImage === image ? 'border-4 border-white shadow-2xl shadow-blue-500 scale-105' : 'hover:scale-105'}`}
     onClick={() => {
      setSelectedImage(image)
      setBackendImage(null)
      setFrontendImage(null);
      }}
     > 
        <img src={image} alt="Card Image" className='w-full h-full object-cover hover:scale-110 transition-transform duration-300' />
        
        {/* Selection indicator */}
        {selectedImage === image && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
     </div>
  )
}

export default Card