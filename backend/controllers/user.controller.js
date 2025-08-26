import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import moment from "moment/moment.js";

// Input validation helper
const validateInput = (data, requiredFields) => {
    const errors = [];
    requiredFields.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            errors.push(`${field} is required`);
        }
    });
    return errors;
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: "User not authenticated" 
            });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            user 
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ 
            success: false,
            message: "Failed to fetch user data",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body;
        
        // Input validation
        const validationErrors = validateInput({ assistantName }, ['assistantName']);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Sanitize assistant name
        const sanitizedName = assistantName.trim().substring(0, 50); // Limit length
        
        let assistantImage;
        if (req.file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid file type. Please upload JPEG, PNG, or WebP images only.'
                });
            }

            // Validate file size (5MB limit)
            if (req.file.size > 5 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: 'File size too large. Please upload images smaller than 5MB.'
                });
            }

            assistantImage = await uploadOnCloudinary(req.file.path);
            if (!assistantImage) {
                return res.status(500).json({ 
                    success: false,
                    message: 'Failed to upload image to Cloudinary' 
                });
            }
        } else if (imageUrl && imageUrl.trim() !== '') {
            // Validate URL format
            try {
                new URL(imageUrl);
                assistantImage = imageUrl.trim();
            } catch (urlError) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid image URL format'
                });
            }
        } else {
            return res.status(400).json({ 
                success: false,
                message: 'No image provided or uploaded' 
            });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { 
                assistantName: sanitizedName, 
                assistantImage,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Assistant updated successfully',
            user,
        });
    } catch (error) {
        console.error('Error updating assistant:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to update assistant',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body;
        
        // Input validation
        if (!command || typeof command !== 'string' || command.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Command is required and must be a non-empty string"
            });
        }

        // Sanitize command
        const sanitizedCommand = command.trim().substring(0, 1000); // Limit length
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Atomically push to history and keep only last 100 entries without validating full document
        const update = {
            $push: {
                history: {
                    $each: [{ command: sanitizedCommand, timestamp: new Date() }],
                    $slice: -100
                }
            }
        };
        await User.findByIdAndUpdate(req.userId, update, { runValidators: false });

        const userName = user.name;
        const assistantName = user.assistantName || "Assistant";
        
        // Get AI response
        const result = await geminiResponse(sanitizedCommand, assistantName, userName);

        // Parse JSON response
        const jsonMatch = result.match(/{[\s\S]*}/);
        if (!jsonMatch) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid response format from AI assistant" 
            });
        }

        let gemResult;
        try {
            gemResult = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            return res.status(500).json({
                success: false,
                message: "Failed to parse AI response"
            });
        }

        const type = gemResult.type;

        // Handle different command types with proper error handling
        switch (type) {
            case 'get_date':
                return res.json({
                    success: true,
                    type,
                    userInput: gemResult.userInput,
                    response: `Current date is ${moment().format("YYYY-MM-DD")}`,
                    timestamp: new Date().toISOString()
                });

            case 'get_time':
                return res.json({
                    success: true,
                    type,
                    userInput: gemResult.userInput,
                    response: `Current time is ${moment().format("hh:mm A")}`,
                    timestamp: new Date().toISOString()
                });

            case 'get_day':
                return res.json({
                    success: true,
                    type,
                    userInput: gemResult.userInput,
                    response: `Today is ${moment().format("dddd")}`,
                    timestamp: new Date().toISOString()
                });

            case 'get_month':
                return res.json({
                    success: true,
                    type,
                    userInput: gemResult.userInput,
                    response: `Current month is ${moment().format("MMMM")}`,
                    timestamp: new Date().toISOString()
                });

            case 'google_search':
            case 'youtube_search':
            case 'youtube_play':
            case 'general':
            case 'calculator_open':
            case 'instagram_open':
            case 'facebook_open':
            case 'weather_show':
                return res.json({
                    success: true,
                    type,
                    userInput: gemResult.userInput,
                    response: gemResult.response,
                    timestamp: new Date().toISOString()
                });

            default:
                return res.status(400).json({ 
                    success: false,
                    response: "I didn't understand the command. Please try rephrasing it.",
                    type: 'unknown'
                });
        }

    } catch (error) {
        console.error("Error in askToAssistant:", error);
        
        // Provide user-friendly error messages
        let errorMessage = "Failed to process your request. Please try again.";
        let statusCode = 500;

        if (error.message.includes('API configuration')) {
            errorMessage = "AI service is not properly configured. Please contact support.";
            statusCode = 503;
        } else if (error.message.includes('timeout')) {
            errorMessage = "Request timed out. Please try again.";
            statusCode = 408;
        } else if (error.message.includes('rate limit')) {
            errorMessage = "Too many requests. Please wait a moment and try again.";
            statusCode = 429;
        }

        return res.status(statusCode).json({ 
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
