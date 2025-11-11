// const express = require("express");
// const cors = require("cors");
// const nodemailer = require("nodemailer");

// const app = express();
// const PORT = process.env.PORT || 3000;

// // 1. Configure Nodemailer Transporter (Requires EMAIL_USER & EMAIL_PASS ENV VARS)
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Middleware
// app.use(cors({ origin: "*" }));
// app.use(express.json());

// // Reference Data and Helper Function
// const LAW_REFERENCES = {
//   "Civil Law":
//     "Focus on gathering contracts, correspondences, and financial records.",
//   "Criminal Law":
//     "Secure the date, time, and location of the incident. Review the Criminal Procedure Code.",
//   "Corporate Law":
//     "Prepare documents like the MOA, AOA, and relevant board meeting minutes.",
//   "Family Law":
//     "Consolidate marriage, birth certificates, and detailed financial statements.",
//   "Property Law":
//     "Ensure you have copies of the Sale Deed, Title Deeds, and property tax receipts.",
//   "Tax Law":
//     "Gather your latest ITR, financial statements, and all tax authority correspondence.",
//   Other:
//     "Please consolidate all relevant documentation, including timelines and names of involved parties.",
// };

// function getReferences(caseType) {
//   return LAW_REFERENCES[caseType] || LAW_REFERENCES["Other"];
// }

// // Health check endpoint
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", timestamp: new Date().toISOString() });
// });

// // Main booking endpoint
// app.post("/api/book-consultation", async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       occupation,
//       caseType,
//       description,
//       firmEmail,
//       firmName,
//     } = req.body; // Validation

//     if (!name || !email || !phone || !occupation || !caseType || !description) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }
//     if (!isValidEmail(email) || !isValidEmail(firmEmail)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email address detected for client or firm.",
//       });
//     }

//     // Get the case reference message
//     const caseReferences = getReferences(caseType); // Send email to firm

//     const firmEmailResult = await sendFirmEmail({
//       name,
//       email,
//       phone,
//       occupation,
//       caseType,
//       description,
//       firmEmail,
//       firmName,
//     }); // Send confirmation email to client

//     const clientEmailResult = await sendClientEmail({
//       name,
//       email,
//       firmName,
//     });

//     console.log("Emails sent successfully:", {
//       firmEmail: firmEmailResult.messageId,
//       clientEmail: clientEmailResult.messageId,
//     });

//     res.json({
//       success: true,
//       message: "Consultation booked successfully",
//       caseReferences: caseReferences, // Sending back the reference
//       emailIds: {
//         firm: firmEmailResult.messageId,
//         client: clientEmailResult.messageId,
//       },
//     });
//   } catch (error) {
//     console.error("Error processing booking or sending email:", error);
//     res.status(500).json({
//       success: false,
//       message:
//         "Failed to process booking or send emails. Check Render logs for Nodemailer error (likely AUTH failure).",
//       error: error.message,
//     });
//   }
// });

// // Helper Functions

// // Send email to firm with client details
// async function sendFirmEmail({
//   name,
//   email,
//   phone,
//   occupation,
//   caseType,
//   description,
//   firmEmail,
//   firmName,
// }) {
//   const htmlContent = `
//         <!DOCTYPE html><html><body>
//         <div style="font-family: sans-serif;">
//             <h1 style="color: #ED1C24;">🔔 New Consultation Request for ${firmName}</h1>
//             <p><strong>Name:</strong> ${name}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Phone:</strong> ${phone}</p>
//             <p><strong>Case Type:</strong> ${caseType}</p>
//             <p><strong>Description:</strong> ${description}</p>
//             <p style="margin-top: 20px;">Please contact this client ASAP.</p>
//         </div>
//         </body></html>
//    `;

//   return await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: firmEmail,
//     subject: `New Consultation Request - ${name}`,
//     html: htmlContent,
//   });
// }

// // Send confirmation email to client
// async function sendClientEmail({ name, email, firmName }) {
//   const htmlContent = `
//         <!DOCTYPE html><html><body>
//         <div style="font-family: sans-serif;">
//             <h1 style="color: #28a745;">✓ Request Confirmed, ${name}!</h1>
//             <p>Thank you for reaching out to <strong>${firmName}</strong>. We have shared your details with our team.</p>
//             <p>We'll contact you within 24-48 hours.</p>
//             <p>Best regards,<br>The ${firmName} Team</p>
//         </div>
//         </body></html>
//     `;

//   return await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: `Consultation Request Confirmed - ${firmName}`,
//     html: htmlContent,
//   });
// }

// // Email validation helper
// function isValidEmail(email) {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err);
//   res.status(500).json({
//     success: false,
//     message: "Internal server error",
//     error: process.env.NODE_ENV === "development" ? err.message : undefined,
//   });
// });
// app.get("/", (req, res) => {
//   res.send("✅ Chatbot API live — POST to /api/book-consultation");
// });
// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Chatbot API server running on port ${PORT}`);
//   console.log(`📧 Email Transporter configured: ${transporter ? "Yes" : "No"}`);
// });

/**
 * Backend API for Chatbot with Gemini AI
 * Handles consultation bookings, AI chat, and email notifications
 */

const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const resend = new Resend(process.env.RESEND_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatHistory, firmName } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    console.log(`💬 AI Chat: ${message.substring(0, 50)}...`);

    // Check if Gemini is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        response: `I'm here to help with questions about Indian law! However, my AI capabilities are currently limited. For detailed legal consultation, please book an appointment with our experts at ${firmName}.`,
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const systemPrompt = `You are a professional legal assistant for Indian law. You work for ${firmName}.

STRICT RULES:
- ONLY answer questions about Indian law, court cases, statutes, IPC, CrPC, legal procedures, and legal topics relevant to India
- Provide accurate, helpful legal information
- Be professional and concise
- If asked about non-legal topics (restaurants, travel, entertainment, etc.), politely decline and redirect to legal matters
- Ask clarifying questions when needed
- Maintain context from previous messages

Example responses:
- Legal question: Provide detailed, accurate legal information
- Non-legal question: "I can only help with questions about Indian law and legal matters. How can I assist you with legal questions today?"

Keep responses clear, professional, and under 150 words unless more detail is specifically requested.`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I will only answer questions about Indian law and legal matters. How can I help you today?",
            },
          ],
        },
        ...(chatHistory || [])
          .slice(-6)
          .flatMap((msg) => [
            {
              role: "user",
              parts: [{ text: msg.role === "user" ? msg.content : "" }],
            },
            {
              role: "model",
              parts: [{ text: msg.role === "assistant" ? msg.content : "" }],
            },
          ])
          .filter((msg) => msg.parts[0].text),
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      response:
        text ||
        "I apologize, but I couldn't generate a response. Please try rephrasing your question or book a consultation with our legal team.",
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process your question. Please try again.",
    });
  }
});

// Main booking endpoint with AI analysis
app.post("/api/book-consultation", async (req, res) => {
  try {
    const { name, email, phone, occupation, description, firmEmail, firmName } =
      req.body;

    // Validation
    if (!name || !email || !phone || !occupation || !description) {
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

    console.log(`📋 New consultation booking: ${name}`);

    // Analyze case type and get similar cases using Gemini
    let caseType = "Legal";
    let similarCases = [];

    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-exp",
        });

        // Analyze case type
        const analysisPrompt = `Analyze this legal case description and identify the case type. Respond with ONLY the case type (e.g., "Civil Law", "Criminal Law", "Family Law", "Property Law", "Corporate Law", "Tax Law", etc.).

Case Description: "${description}"

Case Type:`;

        const analysisResult = await model.generateContent(analysisPrompt);
        const analysisResponse = await analysisResult.response;
        caseType = analysisResponse.text().trim() || "Legal";

        // Get similar cases
        const similarCasesPrompt = `Provide 2 brief examples of similar Indian legal cases for this type of case: ${caseType}

Case Description: "${description}"

Format each example as:
Title: [Case name]
Summary: [One sentence summary]

Keep it very brief and relevant to Indian law.`;

        const casesResult = await model.generateContent(similarCasesPrompt);
        const casesResponse = await casesResult.response;
        const casesText = casesResponse.text();

        // Parse similar cases
        const caseMatches = casesText.split(/Title:/i).slice(1);
        similarCases = caseMatches
          .slice(0, 2)
          .map((match) => {
            const lines = match.trim().split("\n");
            const title = lines[0].trim();
            const snippet =
              lines
                .find((l) => l.toLowerCase().includes("summary"))
                ?.replace(/summary:/i, "")
                .trim() || "";
            return { title, snippet };
          })
          .filter((c) => c.title);
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
        // Continue without AI analysis
      }
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
      caseType,
      firmName,
    });

    console.log("✅ Emails sent successfully");

    res.json({
      success: true,
      message: "Consultation booked successfully",
      caseType,
      similarCases,
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
          background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
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
          border-left: 4px solid #ED1C24;
        }
        .label {
          font-weight: 600;
          color: #ED1C24;
          margin-bottom: 5px;
        }
        .value {
          color: #333;
        }
        .case-type-badge {
          display: inline-block;
          background: #ED1C24;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          margin-top: 10px;
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

        <div style="text-align: center;">
          <span class="case-type-badge">${caseType}</span>
        </div>

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
    from: "Chatbot <onboarding@resend.dev>",
    to: firmEmail,
    subject: `New ${caseType} Consultation - ${name}`,
    html: htmlContent,
  });
}

// Send confirmation email to client
async function sendClientEmail({ name, email, caseType, firmName }) {
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
          background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
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
        .case-type-badge {
          display: inline-block;
          background: #ED1C24;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
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
          <h2 style="margin: 10px 0; color: #28a745;">Consultation Confirmed</h2>
          <p style="margin: 10px 0;">
            Case Type: <span class="case-type-badge">${caseType}</span>
          </p>
        </div>

        <p style="font-size: 16px;">
          Thank you for reaching out to <strong>${firmName}</strong>. We have received your consultation request and our legal team will contact you shortly.
        </p>

        <p style="font-size: 16px;">
          <strong>What happens next?</strong>
        </p>
        <ul style="font-size: 15px; line-height: 1.8;">
          <li>Our team will review your ${caseType.toLowerCase()} case details</li>
          <li>We'll reach out to you within 24-48 hours</li>
          <li>We'll schedule a convenient time for your consultation</li>
        </ul>

        <p style="margin-top: 30px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #ED1C24;">
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
    from: "Chatbot <onboarding@resend.dev>",
    to: email,
    subject: `${caseType} Consultation Confirmed - ${firmName}`,
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
  console.log(
    `🤖 Gemini AI configured: ${process.env.GEMINI_API_KEY ? "Yes" : "No"}`
  );
});
