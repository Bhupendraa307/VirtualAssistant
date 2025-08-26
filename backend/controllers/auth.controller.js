import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ 
                success: false,
                message: "Email already exists. Please use a different email or sign in." 
            });
        }

        // Create a new user (password will be hashed by the model middleware)
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        // Generate JWT token
        const token = await genToken(user._id);
        
        // Set secure cookie
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: isProduction ? "strict" : "lax",
            secure: isProduction,
            path: "/"
        });

        // Return user data without password
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: userResponse
        });

    } catch (error) {
        console.error("Sign up error:", error);
        
        // Handle specific errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already exists. Please use a different email."
            });
        }
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        return res.status(500).json({ 
            success: false,
            message: "Internal server error. Please try again later." 
        });
    }
};




export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid email or password" 
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid email or password" 
            });
        }

        // Generate JWT token
        const token = await genToken(user._id);
        
        // Set secure cookie
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: isProduction ? "strict" : "lax",
            secure: isProduction,
            path: "/"
        });

        // Return user data without password
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: "Sign in successful",
            user: userResponse
        });

    } catch (error) {
        console.error("Sign in error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error. Please try again later." 
        });
    }
};


export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: "/"
        });
        
        return res.status(200).json({ 
            success: true,
            message: "Logged out successfully" 
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error logging out. Please try again." 
        });
    }
};










