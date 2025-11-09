const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors({ origin: "*" }));
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
    } = req.body;

    // Validation
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
    const caseReferences = getReferences(caseType);

    // Send emails concurrently
    const [firmEmailResult, clientEmailResult] = await Promise.all([
      sendFirmEmail({
        name,
        email,
        phone,
        occupation,
        caseType,
        description,
        firmEmail,
        firmName,
      }),
      sendClientEmail({
        name,
        email,
        firmName,
      }),
    ]);

    console.log("Emails sent successfully:", {
      firmEmail: firmEmailResult.id,
      clientEmail: clientEmailResult.id,
    });

    res.json({
      success: true,
      message: "Consultation booked successfully",
      caseReferences: caseReferences,
      emailIds: {
        firm: firmEmailResult.id,
        client: clientEmailResult.id,
      },
    });
  } catch (error) {
    console.error("Error processing booking or sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process booking or send emails.",
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
<!DOCTYPE html>
<html>
<body>
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #ED1C24;">🔔 New Consultation Request for ${firmName}</h1>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
      <p><strong>Occupation:</strong> ${occupation}</p>
      <p><strong>Case Type:</strong> ${caseType}</p>
      <p><strong>Description:</strong></p>
      <p style="background: white; padding: 15px; border-left: 4px solid #ED1C24;">${description}</p>
    </div>
    <p style="margin-top: 20px; color: #666;">Please contact this client as soon as possible.</p>
  </div>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: `${firmName} <onboarding@resend.dev>`, // Default Resend domain - works without verification
    to: [firmEmail],
    subject: `New Consultation Request - ${name}`,
    html: htmlContent,
    reply_to: firmEmail, // Important: Client can reply to firm directly
  });

  if (error) {
    throw new Error(`Failed to send firm email: ${error.message}`);
  }

  return data;
}

// Send confirmation email to client
async function sendClientEmail({ name, email, firmName }) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<body>
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #28a745;">✓ Request Confirmed, ${name}!</h1>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p>Thank you for reaching out to <strong>${firmName}</strong>. We have received your consultation request and shared your details with our team.</p>
      <p>Our team will review your case and contact you within 24-48 hours.</p>
    </div>
    <p style="color: #666;">Best regards,<br>The ${firmName} Team</p>
    <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
    <p style="font-size: 12px; color: #999; text-align: center;">
      This is an automated confirmation email. Please do not reply to this message.
    </p>
  </div>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: `${firmName} <onboarding@resend.dev>`, // Use your verified domain
    to: [email],
    subject: `Consultation Request Confirmed - ${firmName}`,
    html: htmlContent,
  });

  if (error) {
    throw new Error(`Failed to send client email: ${error.message}`);
  }

  return data;
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

app.get("/", (req, res) => {
  res.send("✅ Chatbot API live — POST to /api/book-consultation");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chatbot API server running on port ${PORT}`);
  console.log(`📧 Email service: Resend API`);
  console.log(`🔑 API Key configured: ${process.env.RESEND_API_KEY ? "Yes" : "No - WARNING!"}`);
});
