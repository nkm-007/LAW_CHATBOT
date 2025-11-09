const express = require("express");
const cors = require("cors");
// const { Resend } = require("resend"); // REMOVE RESEND
const nodemailer = require("nodemailer"); // ADD NODEMAILER

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address from Render
    pass: process.env.EMAIL_PASS, // Your App Password from Render
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (Keep this)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main booking endpoint (Keep this)
app.post("/api/book-consultation", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      occupation,
      caseType,
      description,
      firmEmail,
      firmName,
    } = req.body; // Re-include Validation

    if (!name || !email || !phone || !occupation || !caseType || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // Re-include Email Validation (assuming isValidEmail is defined below)
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Send email to firm
    const firmEmailResult = await sendFirmEmail({
      name,
      email,
      phone,
      occupation,
      caseType,
      description,
      firmEmail,
      firmName,
    });

    // Send confirmation email to client
    const clientEmailResult = await sendClientEmail({
      name,
      email,
      firmName,
    });

    console.log("Emails sent successfully:", {
      firmEmail: firmEmailResult.messageId, // Use messageId for Nodemailer
      clientEmail: clientEmailResult.messageId,
    });

    res.json({
      success: true,
      message: "Consultation booked successfully",
      emailIds: {
        firm: firmEmailResult.messageId,
        client: clientEmailResult.messageId,
      },
    });
  } catch (error) {
    console.error("Error processing booking or sending email:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to process booking or send emails. Check server logs for Nodemailer error.",
      error: error.message,
    });
  }
});

// 2. Updated Send Email Functions (using Nodemailer)

async function sendFirmEmail({
  name,
  email,
  phone,
  occupation,
  caseType,
  description,
  firmEmail,
  firmName,
}) {
  // HTML Content remains the same... (Skipped for brevity)

  const htmlContent = `
        <!DOCTYPE html><html><body>
        <div style="font-family: sans-serif;">
            <h1 style="color: #ED1C24;">🔔 New Consultation Request for ${firmName}</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Case Type:</strong> ${caseType}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p style="margin-top: 20px;">Please contact this client ASAP.</p>
        </div>
        </body></html>
    `;

  return await transporter.sendMail({
    from: process.env.EMAIL_USER, // Sent from your configured Gmail account
    to: firmEmail, // Recipient is the firm's email provided in the script tag
    subject: `New Consultation Request - ${name}`,
    html: htmlContent,
  });
}

async function sendClientEmail({ name, email, firmName }) {
  // HTML Content remains the same... (Skipped for brevity)

  const htmlContent = `
        <!DOCTYPE html><html><body>
        <div style="font-family: sans-serif;">
            <h1 style="color: #28a745;">✓ Request Confirmed, ${name}!</h1>
            <p>Thank you for reaching out to <strong>${firmName}</strong>. We have shared your details with our team.</p>
            <p>We'll contact you within 24-48 hours.</p>
            <p>Best regards,<br>The ${firmName} Team</p>
        </div>
        </body></html>
    `;

  return await transporter.sendMail({
    from: process.env.EMAIL_USER, // Sent from your configured Gmail account
    to: email, // Recipient is the client's email
    subject: `Consultation Request Confirmed - ${firmName}`,
    html: htmlContent,
  });
}

// ... (rest of the helper functions and app.listen remain the same) ...

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chatbot API server running on port ${PORT}`);
  console.log(`📧 Email Transporter configured: ${transporter ? "Yes" : "No"}`);
});
