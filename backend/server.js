/**
 * Backend API for Chatbot
 * Handles consultation bookings and email notifications
 */

const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

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
    } = req.body;

    // Validation
    if (!name || !email || !phone || !occupation || !caseType || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

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
      firmEmail: firmEmailResult.id,
      clientEmail: clientEmailResult.id,
    });

    res.json({
      success: true,
      message: "Consultation booked successfully",
      emailIds: {
        firm: firmEmailResult.id,
        client: clientEmailResult.id,
      },
    });
  } catch (error) {
    console.error("Error processing booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process booking",
      error: error.message,
    });
  }
});

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
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .info-row {
          background: white;
          padding: 15px;
          margin: 10px 0;
          border-radius: 6px;
          border-left: 4px solid #667eea;
        }
        .label {
          font-weight: 600;
          color: #667eea;
          margin-bottom: 5px;
        }
        .value {
          color: #333;
        }
        .description {
          background: white;
          padding: 20px;
          margin: 20px 0;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          color: #6c757d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0;">🔔 New Consultation Request</h1>
      </div>
      <div class="content">
        <p style="font-size: 16px; margin-bottom: 20px;">
          You have received a new consultation request from your chatbot.
        </p>

        <div class="info-row">
          <div class="label">Name</div>
          <div class="value">${name}</div>
        </div>

        <div class="info-row">
          <div class="label">Email</div>
          <div class="value">${email}</div>
        </div>

        <div class="info-row">
          <div class="label">Phone</div>
          <div class="value">${phone}</div>
        </div>

        <div class="info-row">
          <div class="label">Occupation</div>
          <div class="value">${occupation}</div>
        </div>

        <div class="info-row">
          <div class="label">Case Type</div>
          <div class="value">${caseType}</div>
        </div>

        <div class="description">
          <div class="label">Case Description</div>
          <div class="value">${description}</div>
        </div>

        <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
          ⚡ <strong>Action Required:</strong> Please contact this client as soon as possible to discuss their consultation needs.
        </p>

        <div class="footer">
          This email was generated automatically by your ${firmName} chatbot<br>
          Received on ${new Date().toLocaleString()}
        </div>
      </div>
    </body>
    </html>
  `;

  return await resend.emails.send({
    from: "Chatbot <onboarding@resend.dev>", // Change this to your verified domain
    to: firmEmail,
    subject: `New Consultation Request - ${name}`,
    html: htmlContent,
  });
}

// Send confirmation email to client
async function sendClientEmail({ name, email, firmName }) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .success-box {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .checkmark {
          font-size: 48px;
          color: #28a745;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          color: #6c757d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0;">Thank You, ${name}!</h1>
      </div>
      <div class="content">
        <div class="success-box">
          <div class="checkmark">✓</div>
          <h2 style="margin: 10px 0; color: #28a745;">Request Received Successfully</h2>
        </div>

        <p style="font-size: 16px;">
          Thank you for reaching out to <strong>${firmName}</strong>. We have received your consultation request and our team will review your information shortly.
        </p>

        <p style="font-size: 16px;">
          <strong>What happens next?</strong>
        </p>
        <ul style="font-size: 15px; line-height: 1.8;">
          <li>Our team will review your case details</li>
          <li>We'll reach out to you within 24-48 hours</li>
          <li>We'll schedule a convenient time for your consultation</li>
        </ul>

        <p style="margin-top: 30px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #667eea;">
          💡 <strong>Tip:</strong> Please keep your phone nearby. We may call you to confirm details or schedule your consultation.
        </p>

        <p style="font-size: 15px; margin-top: 30px;">
          If you have any urgent questions, please feel free to reply to this email.
        </p>

        <p style="font-size: 15px;">
          Best regards,<br>
          <strong>${firmName} Team</strong>
        </p>

        <div class="footer">
          This is an automated confirmation email<br>
          Please do not reply to this email
        </div>
      </div>
    </body>
    </html>
  `;

  return await resend.emails.send({
    from: "Chatbot <onboarding@resend.dev>", // Change this to your verified domain
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
  console.log(`📧 Resend API configured: ${resend ? "Yes" : "No"}`);
});
