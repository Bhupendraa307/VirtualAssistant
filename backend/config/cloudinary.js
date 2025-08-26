import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Validate required environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️  Cloudinary environment variables are not fully configured');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            throw new Error('File path is required for upload');
        }

        if (!fs.existsSync(filePath)) {
            throw new Error('File does not exist at the specified path');
        }

        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto',
            folder: 'virtual_assistant',
            use_filename: true,
            unique_filename: true
        });

        // Clean up local file after successful upload
        try {
            fs.unlinkSync(filePath);
        } catch (unlinkError) {
            console.warn('Warning: Could not remove local file after upload:', unlinkError.message);
        }

        return result.secure_url;
    } catch (error) {
        // Clean up local file if upload fails
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkError) {
                console.warn('Warning: Could not remove local file after failed upload:', unlinkError.message);
            }
        }

        console.error('❌ Cloudinary upload error:', error);
        
        if (error.message.includes('Invalid API key')) {
            throw new Error('Cloudinary API configuration is invalid. Please check your credentials.');
        } else if (error.message.includes('File does not exist')) {
            throw new Error('The file to upload could not be found.');
        } else {
            throw new Error('Failed to upload file to Cloudinary. Please try again.');
        }
    }
};

export default uploadOnCloudinary;