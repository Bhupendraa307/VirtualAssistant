// import express from 'express';
// import connectDb from "./config/db.js";
// import authRouter from './routes/auth.routes.js';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';    
// import userRouter from './routes/user.routes.js';
// import geminiResponse from './gemini.js';
// import helmet from 'helmet';
// import config from './config/env.js';
// import { generalLimiter } from './middlewares/rateLimit.js';

// const app = express();

// // Enhanced CORS configuration
// app.use(cors({
//     origin: config.CORS_ORIGINS,
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
// }));

// const PORT = config.PORT;

// // Enhanced middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(cookieParser());

// // Security middleware
// app.use(helmet());
// app.use(generalLimiter);

// // Additional security headers
// app.use((req, res, next) => {
//     res.setHeader('X-Content-Type-Options', 'nosniff');
//     res.setHeader('X-Frame-Options', 'DENY');
//     res.setHeader('X-XSS-Protection', '1; mode=block');
//     res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
//     next();
// });

// // Request logging middleware
// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//     next();
// });

// // Routes
// app.use("/api/auth", authRouter);
// app.use("/api/user", userRouter);

// // Health check endpoint
// app.get("/health", (req, res) => {
//     res.status(200).json({ 
//         status: "OK", 
//         timestamp: new Date().toISOString(),
//         uptime: process.uptime()
//     });
// });

// // Enhanced Gemini endpoint with better error handling
// app.get("/api/gemini", async (req, res) => {
//     const prompt = req.query.prompt;

//     if (!prompt) {
//         return res.status(400).json({ 
//             error: "Prompt query parameter is required",
//             message: "Please provide a prompt to get a response from the AI assistant"
//         });
//     }

//     try {
//         const text = await geminiResponse(prompt);
//         res.json({ 
//             success: true,
//             prompt, 
//             response: text,
//             timestamp: new Date().toISOString()
//         });
//     } catch (error) {
//         console.error("Gemini API Error:", error);
//         res.status(500).json({
//             success: false,
//             error: "Failed to fetch AI response",
//             message: "The AI service is temporarily unavailable. Please try again later.",
//             details: config.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// });

// // 404 handler
// app.use('*', (req, res) => {
//     res.status(404).json({
//         success: false,
//         error: "Route not found",
//         message: `The requested route ${req.originalUrl} does not exist`
//     });
// });

// // Global error handler
// app.use((error, req, res, next) => {
//     console.error('Global error handler:', error);
    
//     res.status(error.status || 500).json({
//         success: false,
//         error: "Internal server error",
//         message: config.NODE_ENV === 'development' ? error.message : "Something went wrong on the server",
//         ...(config.NODE_ENV === 'development' && { stack: error.stack })
//     });
// });

// // Graceful shutdown handling
// process.on('SIGTERM', () => {
//     console.log('SIGTERM received, shutting down gracefully');
//     process.exit(0);
// });

// process.on('SIGINT', () => {
//     console.log('SIGINT received, shutting down gracefully');
//     process.exit(0);
// });

// // Start server
// app.listen(PORT, async () => {
//     try {
//         await connectDb();
//         console.log(`✅ Server is running on port ${PORT}`);
//         console.log(`🌍 Environment: ${config.NODE_ENV}`);
//         console.log(`🔗 Frontend URL: ${config.FRONTEND_URL}`);
//     } catch (error) {
//         console.error('❌ Failed to start server:', error);
//         process.exit(1);
//     }
// });




import express from 'express';
import connectDb from "./config/db.js";
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/user.routes.js';
import geminiResponse from './gemini.js';
import helmet from 'helmet';
import config from './config/env.js';
import { generalLimiter } from './middlewares/rateLimit.js';

const app = express();

// CORS configuration
app.use(cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(helmet());
app.use(generalLimiter);

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get("/api/gemini", async (req, res) => {
    const prompt = req.query.prompt;

    if (!prompt) {
        return res.status(400).json({
            error: "Prompt query parameter is required",
            message: "Please provide a prompt to get a response from the AI assistant"
        });
    }

    try {
        const text = await geminiResponse(prompt);
        res.json({
            success: true,
            prompt,
            response: text,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch AI response",
            message: "The AI service is temporarily unavailable. Please try again later.",
            details: config.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 404 handler — works in Express 4 & 5
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
        message: `The requested route ${req.originalUrl} does not exist`
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    res.status(error.status || 500).json({
        success: false,
        error: "Internal server error",
        message: config.NODE_ENV === 'development' ? error.message : "Something went wrong on the server",
        ...(config.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
app.listen(config.PORT, async () => {
    try {
        await connectDb();
        console.log(`✅ Server is running on port ${config.PORT}`);
        console.log(`🌍 Environment: ${config.NODE_ENV}`);
        console.log(`🔗 Frontend URL: ${config.FRONTEND_URL}`);
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
});
