// import User from "../models/user.model.js";
// import nodemailer from "nodemailer";

// // In-memory OTP store (for production use DB or Redis)
// const otpStore = new Map();

// // Configure nodemailer transporter using SMTP env credentials
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
//   secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// export const sendOtpForReset = async (req, res) => {
//   const rawEmail = req.body?.email;
//   if (!rawEmail) return res.status(400).json({ success: false, message: "Email is required." });

//   const email = String(rawEmail).trim().toLowerCase();

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ success: false, message: "User not found." });

//     // Generate 6 digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     // Save OTP with 10 min expiration using normalized email as key
//     otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

//     // Send OTP email
//     await transporter.sendMail({
//       from: process.env.SMTP_USER,
//       to: user.email,
//       subject: "Password Reset OTP",
//       text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
//     });

//     res.json({ success: true, message: "OTP sent to your email." });
//   } catch (error) {
//     console.error("sendOtpForReset error:", error);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// };

// export const verifyOtpAndResetPassword = async (req, res) => {
//   const rawEmail = req.body?.email;
//   const rawOtp = req.body?.otp;
//   const newPassword = req.body?.newPassword;

//   if (!rawEmail || !rawOtp || !newPassword) {
//     return res.status(400).json({ success: false, message: "Email, OTP and new password are required." });
//   }

//   const email = String(rawEmail).trim().toLowerCase();
//   const otp = String(rawOtp).trim();

//   try {
//     const record = otpStore.get(email);

//     if (!record) {
//       return res.status(400).json({ success: false, message: "No OTP request found for this email." });
//     }

//     if (record.expires < Date.now()) {
//       otpStore.delete(email);
//       return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
//     }

//     if (record.otp !== otp) {
//       return res.status(400).json({ success: false, message: "Invalid OTP." });
//     }

//     // OTP valid - update password
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ success: false, message: "User not found." });

//     user.password = newPassword;  // Will be hashed by pre-save middleware
//     // Bypass full document validation to avoid unrelated history validation errors
//     await user.save({ validateBeforeSave: false });

//     otpStore.delete(email);

//     res.json({ success: true, message: "Password reset successful." });
//   } catch (error) {
//     console.error("verifyOtpAndResetPassword error:", error);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// };













import User from "../models/user.model.js";
import nodemailer from "nodemailer";

// In-memory OTP store (for production use DB or Redis)
const otpStore = new Map();

// Configure nodemailer transporter using SMTP env credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOtpForReset = async (req, res) => {
  const rawEmail = req.body?.email;
  if (!rawEmail) return res.status(400).json({ success: false, message: "Email is required." });

  const email = String(rawEmail).trim().toLowerCase();

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP with 10 min expiration using normalized email as key
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

    // HTML email template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                color: #333;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                font-size: 28px;
                margin-bottom: 10px;
            }
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .otp-container {
                background-color: #f8f9fa;
                border: 2px dashed #667eea;
                border-radius: 10px;
                padding: 25px;
                margin: 30px 0;
            }
            .otp-label {
                font-size: 16px;
                color: #666;
                margin-bottom: 15px;
            }
            .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                color: #856404;
            }
            .warning-icon {
                font-size: 20px;
                margin-right: 8px;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
                color: #666;
                font-size: 14px;
            }
            .footer p {
                margin-bottom: 5px;
            }
            @media (max-width: 600px) {
                .container {
                    margin: 10px;
                    border-radius: 5px;
                }
                .header, .content, .footer {
                    padding: 20px;
                }
                .otp-code {
                    font-size: 28px;
                    letter-spacing: 4px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset</h1>
                <p>Your security is our priority</p>
            </div>
            
            <div class="content">
                <h2>OTP Verification Code</h2>
                <p>Hi there! You requested to reset your password. Please use the OTP code below to proceed:</p>
                
                <div class="otp-container">
                    <div class="otp-label">Your OTP Code:</div>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="warning">
                    <span class="warning-icon">⚠️</span>
                    <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>. 
                    Do not share this code with anyone for your security.
                </div>
                
                <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message, please do not reply.</p>
                <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;

    // Send OTP email with HTML styling
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "🔐 Password Reset OTP - Action Required",
      text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`, // Fallback for text-only email clients
      html: htmlTemplate,
    });

    res.json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.error("sendOtpForReset error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const verifyOtpAndResetPassword = async (req, res) => {
  const rawEmail = req.body?.email;
  const rawOtp = req.body?.otp;
  const newPassword = req.body?.newPassword;

  if (!rawEmail || !rawOtp || !newPassword) {
    return res.status(400).json({ success: false, message: "Email, OTP and new password are required." });
  }

  const email = String(rawEmail).trim().toLowerCase();
  const otp = String(rawOtp).trim();

  try {
    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ success: false, message: "No OTP request found for this email." });
    }

    if (record.expires < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // OTP valid - update password
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    user.password = newPassword;  // Will be hashed by pre-save middleware
    // Bypass full document validation to avoid unrelated history validation errors
    await user.save({ validateBeforeSave: false });

    otpStore.delete(email);

    res.json({ success: true, message: "Password reset successful." });
  } catch (error) {
    console.error("verifyOtpAndResetPassword error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};