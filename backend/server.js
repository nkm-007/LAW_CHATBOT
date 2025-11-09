const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Configure Nodemailer Transporter (Requires EMAIL_USER & EMAIL_PASS ENV VARS)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Reference Data and Helper Function
const LAW_REFERENCES = {
  "Civil Law":
    "Focus on gathering contracts, correspondences, and financial records.",
  "Criminal Law":
    "Secure the date, time, and location of the incident. Review the Criminal Procedure Code.",
  "Corporate Law":
    "Prepare documents like the MOA, AOA, and relevant board meeting minutes.",
  "Family Law":
    "Consolidate marriage, birth certificates, and detailed financial statements.",
  "Property Law":
    "Ensure you have copies of the Sale Deed, Title Deeds, and property tax receipts.",
  "Tax Law":
    "Gather your latest ITR, financial statements, and all tax authority correspondence.",
  Other:
    "Please consolidate all relevant documentation, including timelines and names of involved parties.",
};

function getReferences(caseType) {
  return LAW_REFERENCES[caseType] || LAW_REFERENCES["Other"];
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main booking endpoint
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
    } = req.body; // Validation

    if (!name || !email || !phone || !occupation || !caseType || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!isValidEmail(email) || !isValidEmail(firmEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address detected for client or firm.",
      });
    }

    // Get the case reference message
    const caseReferences = getReferences(caseType); // Send email to firm

    const firmEmailResult = await sendFirmEmail({
      name,
      email,
      phone,
      occupation,
      caseType,
      description,
      firmEmail,
      firmName,
    }); // Send confirmation email to client

    const clientEmailResult = await sendClientEmail({
      name,
      email,
      firmName,
    });

    console.log("Emails sent successfully:", {
      firmEmail: firmEmailResult.messageId,
      clientEmail: clientEmailResult.messageId,
    });

    res.json({
      success: true,
      message: "Consultation booked successfully",
      caseReferences: caseReferences, // Sending back the reference
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
        "Failed to process booking or send emails. Check Render logs for Nodemailer error (likely AUTH failure).",
      error: error.message,
    });
  }
});

// Helper Functions

// Send email to firm with client details
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
    from: process.env.EMAIL_USER,
    to: firmEmail,
    subject: `New Consultation Request - ${name}`,
    html: htmlContent,
  });
}

// Send confirmation email to client
async function sendClientEmail({ name, email, firmName }) {
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
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Consultation Request Confirmed - ${firmName}`,
    html: htmlContent,
  });
}

// Email validation helper
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chatbot API server running on port ${PORT}`);
  console.log(`📧 Email Transporter configured: ${transporter ? "Yes" : "No"}`);
});
