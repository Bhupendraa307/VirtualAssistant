import { userDataContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImage from "../assets/ai.gif"
import userImage from "../assets/user.gif"
import { useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {CgMenuRight} from "react-icons/cg"
import {RxCross1} from "react-icons/rx"
import { IoMic, IoMicOff, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { BiHistory } from "react-icons/bi";
import { FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();

  // State variables
  const [listening, setListening] = useState(false);
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Enhancements: manual input + listening control
  const [listeningEnabled, setListeningEnabled] = useState(true);
  const [manualInput, setManualInput] = useState("");
  const [sendingManual, setSendingManual] = useState(false);
  
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");

  // Refs for managing speech and recognition state
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const synth = window.speechSynthesis;
  const errorTimeoutRef = useRef(null);

  // Memoized values for performance
  const assistantName = useMemo(() => userData?.assistantName || "Assistant", [userData?.assistantName]);
  const assistantImage = useMemo(() => userData?.assistantImage || "https://via.placeholder.com/300", [userData?.assistantImage]);

  // Clear error after timeout
  const clearError = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => setError(null), 5000);
  }, []);

  // Show error with auto-clear
  const showError = useCallback((message) => {
    setError(message);
    clearError();
  }, [clearError]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.error("Error logging out:", error);
      navigate("/signin");
    } finally {
      setIsLoading(false);
    }
  };

  // Improved speak function with promise and error handling
  const speak = useCallback((text) => {
    if (isMuted) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      try {
        synth.cancel(); // Cancel any ongoing speech
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => v.lang === 'en-US') || voices[0];
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
        
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        isSpeakingRef.current = true;
        
        utterance.onend = () => {
          isSpeakingRef.current = false;
          resolve();
        };

        utterance.onerror = (event) => {
          isSpeakingRef.current = false;
          console.error("Speech synthesis error:", event);
          reject(new Error("Speech synthesis failed"));
        };

        synth.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }, [isMuted, synth]);

  const handleCommand = useCallback(async (data) => {
    const { type, userInput, response } = data;
    
    console.log("Executing command:", type, "with input:", userInput);
    
    try {
      // Set AI text and speak response
      setAiText(response);
      await speak(response);

      // Add to conversation history
      const newConversation = {
        id: Date.now(),
        user: userInput,
        assistant: response,
        timestamp: new Date().toLocaleTimeString(),
        type: type
      };
      setConversationHistory(prev => [newConversation, ...prev.slice(0, 9)]); // Keep last 10

      // Execute command based on type
      switch (type) {
        case 'google_search':
          window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank');
          break;
          
        case 'youtube_search':
          window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank');
          break;
          
        case 'youtube_play':
          window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank');
          break;
          
        case 'calculator_open':
          try {
            // Try to open system calculator first
            if (navigator.platform.includes('Win')) {
              window.open('calculator://', '_self');
            } else {
              window.open('https://www.google.com/search?q=calculator', '_blank');
            }
          } catch (error) {
            window.open('https://www.google.com/search?q=calculator', '_blank');
          }
          break;
          
        case 'facebook_open':
          window.open('https://www.facebook.com', '_blank');
          break;
          
        case 'instagram_open':
          window.open('https://www.instagram.com', '_blank');
          break;
          
        case 'weather_show':
          window.open(`https://www.google.com/search?q=weather+${encodeURIComponent(userInput || 'current location')}`, '_blank');
          break;
          
        default:
          console.log(`Command ${type} executed with response: ${response}`);
      }

      // Clear texts after some time
      setTimeout(() => {
        setUserText("");
        setAiText("");
      }, 8000);
    } catch (error) {
      console.error("Error in handleCommand:", error);
      showError("Failed to process command. Please try again.");
    }
  }, [speak, showError]);

  // Function to safely start recognition
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || isSpeakingRef.current || isRecognizingRef.current) {
      return;
    }

    try {
      recognitionRef.current.start();
      console.log("Recognition started");
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Start error:", error);
        showError("Failed to start speech recognition");
      }
    }
  }, [showError]);

  // Function to process speech transcript
  const processTranscript = useCallback(async (transcript) => {
    console.log("Heard:", transcript);
    setUserText(transcript);

    // Stop recognition temporarily
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    isRecognizingRef.current = false;
    setListening(false);

    // Check if assistant name is mentioned
    if (assistantName && transcript.toLowerCase().includes(assistantName.toLowerCase())) {
      setIsAssistantActive(true); // Activate assistant when name is mentioned
      
      try {
        setIsLoading(true);
        const data = await getGeminiResponse(transcript);
        console.log("Assistant Response:", data);
        
        // Parse JSON response
        let parsedData;
        if (typeof data === 'string') {
          try {
            parsedData = JSON.parse(data);
          } catch (parseError) {
            console.error("Failed to parse JSON:", parseError);
            showError("Sorry, I couldn't understand the response.");
            await speak("Sorry, I couldn't understand the response.");
            return;
          }
        } else {
          parsedData = data;
        }

        // Execute command
        await handleCommand(parsedData);
      } catch (error) {
        console.error("Error getting response:", error);
        const errorMessage = error.message || "Sorry, there was an error processing your request.";
        showError(errorMessage);
        await speak("Sorry, there was an error processing your request.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [assistantName, getGeminiResponse, handleCommand, speak, showError]);

  // Main useEffect for speech recognition setup - Always listening for wake word
  useEffect(() => {
    console.log("Setting up speech recognition...");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showError("Speech Recognition API is not supported in your browser.");
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognitionRef.current = recognition;

    // Event handlers
    recognition.onstart = () => {
      console.log("Recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      isRecognizingRef.current = false;
      setListening(false);
      
      // Auto-restart recognition to keep listening for wake word
      if (!isSpeakingRef.current) {
        setTimeout(() => {
          startRecognition();
        }, 500);
      }
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      await processTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      
      // Handle specific errors
      if (event.error === 'not-allowed') {
        showError("Microphone access denied. Please allow microphone access and refresh the page.");
      } else if (event.error === 'no-speech') {
        // This is normal, just restart
        setTimeout(() => {
          startRecognition();
        }, 1000);
      } else if (event.error !== "aborted" && !isSpeakingRef.current) {
        // Auto-restart on recoverable errors
        setTimeout(() => {
          startRecognition();
        }, 1000);
      }
    };

    // Start initial recognition (only if enabled)
    const initialStart = setTimeout(() => {
      if (listeningEnabled) startRecognition();
    }, 1000);

    // Cleanup function
    return () => {
      console.log("Cleaning up speech recognition...");
      clearTimeout(initialStart);
      if (recognition) {
        recognition.stop();
      }
      recognitionRef.current = null;
      isRecognizingRef.current = false;
      setListening(false);
    };
  }, [assistantName, startRecognition, processTranscript, showError]);

  // useEffect for auto-restart recognition when speech ends
  useEffect(() => {
    const checkAndRestart = setInterval(() => {
      // If enabled, not speaking and not recognizing, restart recognition
      if (listeningEnabled && !isSpeakingRef.current && !isRecognizingRef.current && recognitionRef.current) {
        startRecognition();
      }
    }, 2000);

    return () => {
      clearInterval(checkAndRestart);
    };
  }, [startRecognition, listeningEnabled]);

  // Function to stop assistant (but keep listening for wake word)
  const stopAssistant = useCallback(() => {
    setIsAssistantActive(false);
    synth.cancel();
    setUserText("");
    setAiText("");
  }, [synth]);

  // Toggle mute function
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        // Muted now: stop any ongoing speech
        synth.cancel();
      }
      return next;
    });
  }, [synth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  return (
    <div className='w-full h-screen bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col relative gap-[12px] px-4 py-4 overflow-hidden'>

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Processing...</span>
        </div>
      )}

      {/* Top bar actions (mobile/menu toggle + listening switch) */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
        {/* Listening toggle */}
        <button
          className={`px-3 py-1 rounded-full text-xs font-semibold ${listeningEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'} hover:opacity-90`}
          onClick={() => {
            setListeningEnabled(prev => {
              const next = !prev;
              // Stop or start recognition accordingly
              try {
                if (!next && recognitionRef.current) {
                  recognitionRef.current.stop();
                } else if (next) {
                  startRecognition();
                }
              } catch (_) {}
              return next;
            });
          }}
          title={listeningEnabled ? 'Disable listening' : 'Enable listening'}
        >
          {listeningEnabled ? 'Listening: On' : 'Listening: Off'}
        </button>

        {/* Mobile Menu Toggle */}
        {!menuOpen && (
          <CgMenuRight 
            className='lg:hidden text-white w-[25px] h-[25px] cursor-pointer hover:text-blue-400 transition-colors'
            onClick={() => setMenuOpen(true)}
          />
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed top-0 left-0 w-full h-full bg-[#00000080] backdrop-blur-lg flex flex-col items-start p-6 transform transition-transform duration-300 z-40 lg:hidden ${
        menuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <RxCross1 
          className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer hover:text-red-400 transition-colors'
          onClick={() => setMenuOpen(false)}
        />

        <button 
          className="min-w-[150px] h-[60px] mt-[60px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? 'Logging Out...' : 'Log Out'}
        </button>

        <button 
          className="min-w-[200px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer px-4 hover:bg-gray-100 transition-colors"
          onClick={() => {
            navigate("/customize");
            setMenuOpen(false);
          }}
        >
          Customize Your Assistant
        </button>

        <div className='w-full h-[2px] bg-gray-400 mt-8'></div>

        <h1 className='text-white text-xl mt-4 mb-4 flex items-center gap-2'>
          <BiHistory />
          Recent Conversations
        </h1>

        <div className='w-full h-[40vh] overflow-auto flex flex-col gap-[10px]'>
          {conversationHistory.length > 0 ? (
            conversationHistory.map((conv) => (
              <div key={conv.id} className='text-white p-3 bg-gray-800/80 rounded-lg border border-gray-700'>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{conv.timestamp}</span>
                  <span className="text-xs bg-blue-500 px-2 py-1 rounded">{conv.type}</span>
                </div>
                <p className="text-sm mb-1"><strong>You:</strong> {conv.user}</p>
                <p className="text-sm text-gray-300"><strong>Assistant:</strong> {conv.assistant}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex absolute top-[20px] right-[20px] flex-col gap-4">
        <button 
          className="min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? 'Logging Out...' : 'Log Out'}
        </button>

        <button 
          className="min-w-[200px] h-[60px] px-[20px] py-[10px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => navigate("/customize")}
        >
          Customize Your Assistant
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center gap-6 max-w-md w-full mt-16 lg:mt-0">
        
        {/* Status Indicators */}
        <div className="flex flex-col items-center gap-2">
          {/* Single listening indicator (condensed) */}
          <div className="text-sm flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${listeningEnabled ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'}`}></span>
            <span className={`${listening ? 'text-green-400' : 'text-blue-400'}`}>
              {listeningEnabled ? (listening ? 'Listening…' : `Listening for "${assistantName}"…`) : 'Listening off'}
            </span>
          </div>
          {isAssistantActive && (
            <div className="text-yellow-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              Assistant Active
            </div>
          )}
        </div>

        {/* Assistant Image */}
        <div className="w-[220px] h-[300px] sm:w-[260px] sm:h-[340px] flex justify-center items-center overflow-hidden rounded-2xl shadow-2xl shadow-blue-950 hover:shadow-blue-500 transition-all duration-300 transform hover:scale-105">
          <img 
            src={assistantImage}
            alt="Assistant" 
            className="w-full h-full object-cover rounded-2xl"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/260x340/1e40af/ffffff?text=Assistant";
            }}
          />
        </div>

        {/* Assistant Name */}
        <h1 className='text-white text-xl sm:text-2xl font-bold text-center'>
          I'm {assistantName}
        </h1>

        {/* Control Buttons */}
        <div className="flex gap-4 items-center">
          {/* Stop Assistant Button (only show when active) */}
          {isAssistantActive && (
            <button 
              className="bg-red-600 hover:bg-red-700 text-white text-lg px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={stopAssistant}
            >
              Stop Assistant
            </button>
          )}

          {/* Mute/Unmute Button */}
          <button 
            className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <IoVolumeMute className="w-6 h-6 text-white" />
            ) : (
              <IoVolumeHigh className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Conversation Display */}
        <div className="w-full max-w-lg">
          {/* User/AI Image based on who's speaking */}
          <div className="flex justify-center mb-4">
            {userText && !aiText && (
              <img src={userImage} alt='User' className='w-[100px] sm:w-[150px] animate-bounce'/>
            )}
            {aiText && (
              <img src={aiImage} alt='AI' className='w-[100px] sm:w-[150px] animate-pulse'/>
            )}
          </div>

          {/* Text Display */}
          {userText && !aiText && (
            <div className="text-center animate-fadeIn">
              <h2 className='text-white text-[16px] sm:text-[18px] font-semibold break-words'>
                {userText}
              </h2>
            </div>
          )}
          
          {aiText && (
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center animate-fadeIn border border-blue-500/30">
              <h2 className='text-white text-[16px] sm:text-[18px] font-semibold break-words'>
                {aiText}
              </h2>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-300 text-sm max-w-md">
          <p>Say "{assistantName}" followed by your command to activate me!</p>
          <p className="mt-2 text-xs">Example: "Hey {assistantName}, search for cats on YouTube"</p>
        </div>

        {/* Manual command input (keyboard-friendly and mobile-friendly) */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!manualInput.trim()) return;
            try {
              setSendingManual(true);
              const data = await getGeminiResponse(manualInput.trim());
              const parsed = typeof data === 'string' ? JSON.parse(data) : data;
              await handleCommand(parsed);
            } catch (err) {
              console.error(err);
              showError(err.message || 'Failed to process command');
            } finally {
              setSendingManual(false);
              setManualInput('');
            }
          }}
          className="w-full max-w-md flex gap-2 mt-4"
        >
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={`Type a command (e.g., "${assistantName}, open YouTube")`}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sendingManual || isLoading}
          />
          <button
            type="submit"
            disabled={sendingManual || isLoading || !manualInput.trim()}
            className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {sendingManual ? 'Sending...' : 'Send'}
          </button>
        </form>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-sm transition-colors"
            onClick={() => window.open('https://www.google.com', '_blank')}
          >
            Open Google
          </button>
          <button 
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg text-sm transition-colors"
            onClick={() => window.open('https://www.youtube.com', '_blank')}
          >
            Open YouTube
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;