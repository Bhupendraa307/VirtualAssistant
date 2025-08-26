import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
    try {
        // Check if JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET environment variable is not configured");
            return res.status(500).json({ 
                success: false,
                message: "Server configuration error" 
            });
        }

        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication token not found. Please sign in again." 
            });
        }

        // Verify token
        const verifyToken = await jwt.verify(token, process.env.JWT_SECRET);
        
        if (!verifyToken || !verifyToken.userId) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid authentication token. Please sign in again." 
            });
        }

        // Set user ID in request object
        req.userId = verifyToken.userId;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: "Authentication token has expired. Please sign in again." 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: "Invalid authentication token. Please sign in again." 
            });
        } else {
            return res.status(500).json({ 
                success: false,
                message: "Authentication failed. Please try again." 
            });
        }
    }
};

export default isAuth;
