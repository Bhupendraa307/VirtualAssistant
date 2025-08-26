// import mongoose from 'mongoose';
// import config from './env.js';

// const connectDb = async () => {
//     try {
//         const options = {
//             maxPoolSize: 10,
//             serverSelectionTimeoutMS: 5000,
//             socketTimeoutMS: 45000,
//             bufferMaxEntries: 0,
//             bufferCommands: false
//         };

//         await mongoose.connect(config.MONGODB_URL, options);
//         console.log("✅ Database connected successfully");
        
//         // Handle connection events
//         mongoose.connection.on('error', (err) => {
//             console.error('❌ Database connection error:', err);
//         });

//         mongoose.connection.on('disconnected', () => {
//             console.warn('⚠️ Database disconnected');
//         });

//         mongoose.connection.on('reconnected', () => {
//             console.log('🔄 Database reconnected');
//         });

//     } catch (error) {
//         console.error("❌ Database connection failed:", error.message);
//         process.exit(1);
//     }
// };

// export default connectDb;




import mongoose from 'mongoose';
import config from './env.js';

const connectDb = async () => {
    try {
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            // Removed deprecated options
        };

        await mongoose.connect(config.MONGODB_URL, options);
        console.log("✅ Database connected successfully");
        
        mongoose.connection.on('error', (err) => {
            console.error('❌ Database connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ Database disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 Database reconnected');
        });

    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDb;
