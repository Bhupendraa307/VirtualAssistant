import jwt from 'jsonwebtoken';

const genToken = async (userId) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not configured');
        }
        
        if (!userId) {
            throw new Error('User ID is required to generate token');
        }

        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        });

        return token;
    } catch (error) {
        console.error("Error generating token:", error);
        throw error; // Re-throw to handle in calling function
    }
};

export default genToken;