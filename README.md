# Virtual Assistant 2.0

A modern, AI-powered virtual assistant application built with React, Node.js, and MongoDB. Features include voice commands, AI responses, user customization, and secure authentication.

## 🚀 Features

- **AI-Powered Assistant**: Integration with Google Gemini AI for intelligent responses
- **Voice Commands**: Speech recognition and text-to-speech capabilities
- **User Customization**: Personalize assistant name and image
- **Secure Authentication**: JWT-based authentication with password hashing
- **File Upload**: Cloudinary integration for image storage
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Error Handling**: Comprehensive error boundaries and validation
- **Rate Limiting**: Protection against abuse and spam
- **Security**: Helmet.js, CORS, and input sanitization

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for file storage
- **Google Gemini AI** API
- **Nodemailer** for email functionality
- **Multer** for file uploads
- **Express Validator** for input validation
- **Express Rate Limit** for rate limiting
- **Helmet.js** for security headers

### Frontend
- **React 19** with modern hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for HTTP requests
- **React Icons** for icons
- **Vite** for build tooling

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Gemini AI API key
- Cloudinary account (optional, for image uploads)
- Gmail account (optional, for password reset)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd VirtualAssistant2
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 4. Environment Configuration

#### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
MONGODB_URL=mongodb://localhost:27017/virtual_assistant

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend (.env)
Create a `.env` file in the `frontend` directory:

```env
VITE_SERVER_URL=http://localhost:8000
```

### 5. Start the application

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## 📱 Usage

### 1. Sign Up
- Create a new account with email and password
- Password must be at least 6 characters with uppercase, lowercase, and number

### 2. Customize Assistant
- Set your assistant's name
- Upload or provide an image URL for your assistant

### 3. Interact with Assistant
- Use voice commands or type your requests
- Ask for time, date, weather, or general questions
- The AI will respond appropriately

### 4. Voice Commands
- Click the microphone button to start voice recognition
- Speak your command clearly
- The assistant will process and respond

## 🔒 Security Features

- **Input Validation**: Comprehensive validation for all user inputs
- **Rate Limiting**: Protection against brute force and spam attacks
- **Password Hashing**: Bcrypt with salt for secure password storage
- **JWT Tokens**: Secure, time-limited authentication tokens
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for additional security headers
- **Input Sanitization**: Protection against XSS and injection attacks

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Build

### Frontend Production Build
```bash
cd frontend
npm run build
```

### Backend Production
```bash
cd backend
npm start
```

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in your environment
2. Ensure all environment variables are configured
3. Use a process manager like PM2
4. Set up reverse proxy (Nginx/Apache)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check API key configurations
5. Review the logs for detailed error information

## 🔄 Updates

- **v2.0.0**: Major security improvements, validation, and error handling
- **v1.0.0**: Initial release with basic functionality

## 📞 Contact

For questions or support, please open an issue in the repository.
"# VirtualAssistant" 
"# VirtualAssistant" 
