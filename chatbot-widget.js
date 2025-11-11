// /**
//  * Universal Chatbot Widget
//  * Add to any website with: <script src="YOUR_CDN_URL/chatbot-widget.js" data-firm-name="Your Firm" data-firm-email="firm@examle.com"></script>
//  */

// (function () {
//   "use strict";

//   // Get configuration from script tag
//   const script =
//     document.currentScript || document.querySelector("script[data-firm-name]");
//   const config = {
//     firmName: script?.getAttribute("data-firm-name") || "Our Firm",
//     firmEmail: script?.getAttribute("data-firm-email") || "contact@example.com",
//     apiUrl:
//       script?.getAttribute("data-api-url") ||
//       "https://chatbot-api-0mod.onrender.com",
//   };

//   const CASE_TYPES = [
//     "Civil Law",
//     "Criminal Law",
//     "Corporate Law",
//     "Family Law",
//     "Property Law",
//     "Tax Law",
//     "Other",
//   ];

//   // Chatbot state
//   const state = {
//     isOpen: false,
//     step: "welcome",
//     userData: {
//       name: "",
//       email: "",
//       phone: "",
//       occupation: "",
//       caseType: "",
//       description: "",
//     },
//   };

//   // Inject CSS
//   const styles = `
//     .chatbot-container {
//       position: fixed;
//       bottom: 20px;
//       right: 20px;
//       z-index: 9999;
//       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//     }

//     .chatbot-button {
//       background: transparent;
//       border: none;
//       cursor: pointer;
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       gap: 8px;
//       transition: all 0.3s ease;
//       padding: 0;
//     }

//     .chatbot-button:hover .chatbot-icon-circle {
//       transform: scale(1.1);
//       box-shadow: 0 8px 24px rgba(237, 28, 36, 0.5);
//     }

//     .chatbot-icon-circle {
//       width: 56px;
//       height: 56px;
//       background: #ED1C24;
//       border-radius: 50%;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       box-shadow: 0 4px 16px rgba(237, 28, 36, 0.3);
//       transition: all 0.3s ease;
//       position: relative;
//     }

//     .chatbot-icon {
//       width: 28px;
//       height: 28px;
//       fill: white;
//     }

//     .chatbot-button-text {
//       font-size: 12px;
//       color: #666;
//       font-weight: 500;
//       text-align: center;
//       white-space: nowrap;
//       background: transparent;
//       padding: 0;
//       margin: 0;
//     }

//     .chatbot-window {
//       position: fixed;
//       bottom: 90px;
//       right: 20px;
//       width: 380px;
//       height: 550px;
//       background: white;
//       border-radius: 16px;
//       box-shadow: 0 8px 32px rgba(0,0,0,0.12);
//       display: none;
//       flex-direction: column;
//       overflow: hidden;
//       animation: slideUp 0.3s ease;
//     }

//     .chatbot-window.open {
//       display: flex;
//     }

//     @keyframes slideUp {
//       from {
//         opacity: 0;
//         transform: translateY(20px);
//       }
//       to {
//         opacity: 1;
//         transform: translateY(0);
//       }
//     }

//     .chatbot-header {
//       background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
//       color: white;
//       padding: 20px;
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//     }

//     .chatbot-header h3 {
//       margin: 0;
//       font-size: 18px;
//       font-weight: 600;
//     }

//     .chatbot-close {
//       background: none;
//       border: none;
//       color: white;
//       font-size: 24px;
//       cursor: pointer;
//       padding: 0;
//       width: 30px;
//       height: 30px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       border-radius: 50%;
//       transition: background 0.2s;
//     }

//     .chatbot-close:hover {
//       background: rgba(255,255,255,0.2);
//     }

//     .chatbot-messages {
//       flex: 1;
//       overflow-y: auto;
//       padding: 20px;
//       background: #f8f9fa;
//     }

//     .message {
//       margin-bottom: 16px;
//       animation: fadeIn 0.3s ease;
//     }

//     @keyframes fadeIn {
//       from { opacity: 0; transform: translateY(10px); }
//       to { opacity: 1; transform: translateY(0); }
//     }

//     .message.bot {
//       display: flex;
//       gap: 10px;
//     }

//     .bot-avatar {
//       width: 32px;
//       height: 32px;
//       background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
//       border-radius: 50%;
//       flex-shrink: 0;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       color: white;
//       font-weight: bold;
//     }

//     .message-content {
//       background: white;
//       padding: 12px 16px;
//       border-radius: 12px;
//       max-width: 80%;
//       box-shadow: 0 2px 4px rgba(0,0,0,0.05);
//     }

//     .message.user .message-content {
//       background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
//       color: white;
//       margin-left: auto;
//       text-align: right;
//     }

//     .chatbot-input-area {
//       padding: 16px;
//       background: white;
//       border-top: 1px solid #e9ecef;
//     }

//     .quick-actions {
//       margin-bottom: 12px;
//     }

//     .action-button {
//       width: 100%;
//       background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
//       color: white;
//       border: none;
//       padding: 12px;
//       border-radius: 8px;
//       cursor: pointer;
//       font-size: 14px;
//       font-weight: 600;
//       transition: opacity 0.2s;
//     }

//     .action-button:hover {
//       opacity: 0.9;
//     }

//     .action-button:disabled {
//       opacity: 0.5;
//       cursor: not-allowed;
//     }

//     .input-group {
//       display: flex;
//       gap: 8px;
//     }

//     .chatbot-input {
//       flex: 1;
//       padding: 12px;
//       border: 1px solid #dee2e6;
//       border-radius: 8px;
//       font-size: 14px;
//       outline: none;
//       transition: border-color 0.2s;
//     }

//     .chatbot-input:focus {
//       border-color: #ED1C24;
//     }

//     .send-button {
//       background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
//       color: white;
//       border: none;
//       padding: 12px 20px;
//       border-radius: 8px;
//       cursor: pointer;
//       font-weight: 600;
//       transition: opacity 0.2s;
//     }

//     .send-button:hover {
//       opacity: 0.9;
//     }

//     .select-input {
//       width: 100%;
//       padding: 12px;
//       border: 1px solid #dee2e6;
//       border-radius: 8px;
//       font-size: 14px;
//       outline: none;
//       margin-bottom: 8px;
//       background: white;
//     }

//     .select-input:focus {
//       border-color: #ED1C24;
//     }

//     @media (max-width: 480px) {
//       .chatbot-window {
//         width: calc(100vw - 40px);
//         height: calc(100vh - 120px);
//         right: 20px;
//       }
//     }
//   `;

//   // Inject styles into page
//   const styleSheet = document.createElement("style");
//   styleSheet.textContent = styles;
//   document.head.appendChild(styleSheet);

//   // Create chatbot HTML
//   function createChatbot() {
//     const container = document.createElement("div");
//     container.className = "chatbot-container";
//     container.innerHTML = `
//       <button class="chatbot-button" id="chatbot-toggle">
//         <div class="chatbot-icon-circle">
//           <svg class="chatbot-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
//           </svg>
//         </div>
//         <span class="chatbot-button-text">Book a consultant</span>
//       </button>

//       <div class="chatbot-window" id="chatbot-window">
//         <div class="chatbot-header">
//           <h3>Chat with Us</h3>
//           <button class="chatbot-close" id="chatbot-close">×</button>
//         </div>
//         <div class="chatbot-messages" id="chatbot-messages"></div>
//         <div class="chatbot-input-area" id="chatbot-input-area">
//           <div class="quick-actions" id="quick-actions"></div>
//           <div class="input-group" id="input-group" style="display: none;">
//             <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Type your message...">
//             <button class="send-button" id="send-button">Send</button>
//           </div>
//         </div>
//       </div>
//     `;

//     document.body.appendChild(container);

//     // Event listeners
//     document
//       .getElementById("chatbot-toggle")
//       .addEventListener("click", toggleChatbot);
//     document
//       .getElementById("chatbot-close")
//       .addEventListener("click", toggleChatbot);
//     document
//       .getElementById("send-button")
//       .addEventListener("click", handleSend);
//     document
//       .getElementById("chatbot-input")
//       .addEventListener("keypress", (e) => {
//         if (e.key === "Enter") handleSend();
//       });

//     // Initialize with welcome message
//     initializeChat();
//   }

//   function toggleChatbot() {
//     state.isOpen = !state.isOpen;
//     const window = document.getElementById("chatbot-window");
//     window.classList.toggle("open", state.isOpen);
//   }

//   function addMessage(text, isBot = true) {
//     const messagesDiv = document.getElementById("chatbot-messages");
//     const messageDiv = document.createElement("div");
//     messageDiv.className = `message ${isBot ? "bot" : "user"}`;

//     if (isBot) {
//       messageDiv.innerHTML = `
//         <div class="bot-avatar">B</div>
//         <div class="message-content">${text}</div>
//       `;
//     } else {
//       messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
//     }

//     messagesDiv.appendChild(messageDiv);
//     messagesDiv.scrollTop = messagesDiv.scrollHeight;
//   }

//   function showActionButton(text, action) {
//     const actionsDiv = document.getElementById("quick-actions");
//     actionsDiv.innerHTML = `<button class="action-button">${text}</button>`;
//     actionsDiv.querySelector("button").addEventListener("click", action);
//   }

//   function showInput(placeholder) {
//     document.getElementById("quick-actions").innerHTML = "";
//     const inputGroup = document.getElementById("input-group");
//     inputGroup.style.display = "flex";
//     const input = document.getElementById("chatbot-input");
//     input.placeholder = placeholder;
//     input.focus();
//   }

//   function showSelect(options) {
//     document.getElementById("quick-actions").innerHTML = "";
//     document.getElementById("input-group").style.display = "none";

//     const actionsDiv = document.getElementById("quick-actions");
//     const select = document.createElement("select");
//     select.className = "select-input";
//     select.innerHTML =
//       '<option value="">Select an option...</option>' +
//       options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");

//     actionsDiv.appendChild(select);

//     select.addEventListener("change", (e) => {
//       if (e.target.value) {
//         handleUserInput(e.target.value);
//       }
//     });
//   }

//   function initializeChat() {
//     state.step = "welcome";
//     addMessage(`Hi, welcome to ${config.firmName} Chat Bot! 👋`);
//     setTimeout(() => {
//       addMessage("I'm here to help you book a consultation with our experts.");
//       showActionButton("📅 Book a Consultant", startBooking);
//     }, 800);
//   }

//   function startBooking() {
//     state.step = "name";
//     document.getElementById("quick-actions").innerHTML = "";
//     addMessage("Great! Let's get started. What's your name?");
//     showInput("Enter your name");
//   }

//   function handleSend() {
//     const input = document.getElementById("chatbot-input");
//     const value = input.value.trim();

//     if (!value) return;

//     handleUserInput(value);
//     input.value = "";
//   }

//   async function handleUserInput(value) {
//     addMessage(value, false);
//     document.getElementById("input-group").style.display = "none";

//     switch (state.step) {
//       case "name":
//         state.userData.name = value;
//         state.step = "email";
//         setTimeout(() => {
//           addMessage(`Nice to meet you, ${value}! What's your email address?`);
//           showInput("Enter your email");
//         }, 500);
//         break;

//       case "email":
//         if (!isValidEmail(value)) {
//           addMessage("Please enter a valid email address.");
//           showInput("Enter your email");
//           return;
//         }
//         state.userData.email = value;
//         state.step = "phone";
//         setTimeout(() => {
//           addMessage("What's your phone number?");
//           showInput("Enter your phone number");
//         }, 500);
//         break;

//       case "phone":
//         state.userData.phone = value;
//         state.step = "occupation";
//         setTimeout(() => {
//           addMessage("What's your occupation?");
//           showInput("Enter your occupation");
//         }, 500);
//         break;

//       case "occupation":
//         state.userData.occupation = value;
//         state.step = "caseType";
//         setTimeout(() => {
//           addMessage("What type of case do you need help with?");
//           showSelect(CASE_TYPES);
//         }, 500);
//         break;

//       case "caseType":
//         state.userData.caseType = value;
//         state.step = "description";
//         setTimeout(() => {
//           addMessage("Please provide a short description of your case:");
//           showInput("Describe your case briefly...");
//         }, 500);
//         break;

//       case "description":
//         state.userData.description = value;
//         await submitBooking();
//         break;
//     }
//   }

//   async function submitBooking() {
//     addMessage("Processing your request...");

//     try {
//       const response = await fetch(`${config.apiUrl}/book-consultation`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           ...state.userData,
//           firmEmail: config.firmEmail,
//           firmName: config.firmName,
//         }),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         addMessage(
//           "✅ Thank you! Your consultation request has been submitted successfully."
//         );
//         addMessage(
//           `We've sent confirmation emails to both you and our team. We'll contact you shortly at ${state.userData.phone}.`
//         );

//         // Show restart button after 2 seconds
//         setTimeout(() => {
//           showActionButton("Start New Booking", resetChat);
//         }, 2000);
//       } else {
//         throw new Error(result.message || "Submission failed");
//       }
//     } catch (error) {
//       addMessage(
//         "❌ Sorry, there was an error submitting your request. Please try again or contact us directly."
//       );
//       setTimeout(() => {
//         showActionButton("Try Again", resetChat);
//       }, 1000);
//     }
//   }

//   function resetChat() {
//     document.getElementById("chatbot-messages").innerHTML = "";
//     state.userData = {
//       name: "",
//       email: "",
//       phone: "",
//       occupation: "",
//       caseType: "",
//       description: "",
//     };
//     initializeChat();
//   }

//   function isValidEmail(email) {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   }

//   // Initialize when DOM is ready
//   if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", createChatbot);
//   } else {
//     createChatbot();
//   }
// })();

/**
 * Universal Chatbot Widget with Gemini AI
 * Add to any website with: <script src="YOUR_CDN_URL/chatbot-widget.js" data-firm-name="Your Firm" data-firm-email="firm@example.com"></script>
 */

(function () {
  "use strict";

  // Get configuration from script tag
  const script =
    document.currentScript || document.querySelector("script[data-firm-name]");
  const config = {
    firmName: script?.getAttribute("data-firm-name") || "Our Firm",
    firmEmail: script?.getAttribute("data-firm-email") || "contact@example.com",
    apiUrl:
      script?.getAttribute("data-api-url") ||
      "https://chatbot-api-0mod.onrender.com/api",
  };

  // Chatbot state
  const state = {
    isOpen: false,
    mode: "chat", // 'chat' or 'booking'
    step: "welcome",
    userData: {
      name: "",
      email: "",
      phone: "",
      occupation: "",
      description: "",
    },
    chatHistory: [],
  };

  // Inject CSS
  const styles = `
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .chatbot-button {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      padding: 0;
    }

    .chatbot-button:hover .chatbot-icon-circle {
      transform: scale(1.1);
      box-shadow: 0 8px 24px rgba(237, 28, 36, 0.5);
    }

    .chatbot-icon-circle {
      width: 56px;
      height: 56px;
      background: #ED1C24;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(237, 28, 36, 0.3);
      transition: all 0.3s ease;
      position: relative;
    }

    .chatbot-icon {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .chatbot-button-text {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      text-align: center;
      white-space: nowrap;
      background: transparent;
      padding: 0;
      margin: 0;
    }

    .chatbot-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      height: 550px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    .chatbot-window.open {
      display: flex;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chatbot-header {
      background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chatbot-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .chatbot-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .chatbot-close:hover {
      background: rgba(255,255,255,0.2);
    }

    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f8f9fa;
    }

    .message {
      margin-bottom: 16px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message.bot {
      display: flex;
      gap: 10px;
    }

    .bot-avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
      border-radius: 50%;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }

    .message-content {
      background: white;
      padding: 12px 16px;
      border-radius: 12px;
      max-width: 80%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      line-height: 1.5;
    }

    .message.user .message-content {
      background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
      color: white;
      margin-left: auto;
      text-align: right;
    }

    .chatbot-input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e9ecef;
    }

    .quick-actions {
      margin-bottom: 12px;
    }

    .action-button {
      width: 100%;
      background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
      color: white;
      border: none;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: opacity 0.2s;
      margin-bottom: 8px;
    }

    .action-button:hover {
      opacity: 0.9;
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-button.secondary {
      background: white;
      color: #ED1C24;
      border: 2px solid #ED1C24;
    }

    .input-group {
      display: flex;
      gap: 8px;
    }

    .chatbot-input {
      flex: 1;
      padding: 12px;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .chatbot-input:focus {
      border-color: #ED1C24;
    }

    .send-button {
      background: linear-gradient(135deg, #ED1C24 0%, #C41E3A 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: opacity 0.2s;
    }

    .send-button:hover {
      opacity: 0.9;
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .similar-cases {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px;
      margin-top: 12px;
      border-radius: 4px;
      font-size: 13px;
    }

    .similar-cases h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #856404;
    }

    .similar-cases p {
      margin: 4px 0;
      color: #856404;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 12px;
    }

    .typing-dot {
      width: 8px;
      height: 8px;
      background: #ED1C24;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }

    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-10px);
      }
    }

    @media (max-width: 480px) {
      .chatbot-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 120px);
        right: 20px;
      }
    }
  `;

  // Inject styles into page
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create chatbot HTML
  function createChatbot() {
    const container = document.createElement("div");
    container.className = "chatbot-container";
    container.innerHTML = `
      <button class="chatbot-button" id="chatbot-toggle">
        <div class="chatbot-icon-circle">
          <svg class="chatbot-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </div>
        <span class="chatbot-button-text">Book a consultant</span>
      </button>
      
      <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-header">
          <h3>Legal Assistant</h3>
          <button class="chatbot-close" id="chatbot-close">×</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-input-area" id="chatbot-input-area">
          <div class="quick-actions" id="quick-actions"></div>
          <div class="input-group" id="input-group">
            <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Ask me anything about Indian law...">
            <button class="send-button" id="send-button">Send</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Event listeners
    document
      .getElementById("chatbot-toggle")
      .addEventListener("click", toggleChatbot);
    document
      .getElementById("chatbot-close")
      .addEventListener("click", toggleChatbot);
    document
      .getElementById("send-button")
      .addEventListener("click", handleSend);
    document
      .getElementById("chatbot-input")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSend();
      });

    // Initialize with welcome message
    initializeChat();
  }

  function toggleChatbot() {
    state.isOpen = !state.isOpen;
    const window = document.getElementById("chatbot-window");
    window.classList.toggle("open", state.isOpen);

    if (state.isOpen) {
      document.getElementById("chatbot-input").focus();
    }
  }

  function addMessage(text, isBot = true) {
    const messagesDiv = document.getElementById("chatbot-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isBot ? "bot" : "user"}`;

    if (isBot) {
      messageDiv.innerHTML = `
        <div class="bot-avatar">AI</div>
        <div class="message-content">${text}</div>
      `;
    } else {
      messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function showTyping() {
    const messagesDiv = document.getElementById("chatbot-messages");
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot";
    typingDiv.id = "typing-indicator";
    typingDiv.innerHTML = `
      <div class="bot-avatar">AI</div>
      <div class="message-content">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById("typing-indicator");
    if (typing) typing.remove();
  }

  function showBookingButton() {
    const actionsDiv = document.getElementById("quick-actions");
    actionsDiv.innerHTML = `
      <button class="action-button" id="book-consultant-btn">
        📅 Book a Consultant
      </button>
    `;
    document
      .getElementById("book-consultant-btn")
      .addEventListener("click", startBooking);
  }

  function showInput(placeholder) {
    document.getElementById("quick-actions").innerHTML = "";
    const inputGroup = document.getElementById("input-group");
    inputGroup.style.display = "flex";
    const input = document.getElementById("chatbot-input");
    input.placeholder = placeholder;
    input.focus();
  }

  function initializeChat() {
    state.mode = "chat";
    state.step = "welcome";
    addMessage(`Hi, welcome to ${config.firmName}! 👋`);
    setTimeout(() => {
      addMessage(
        "I'm your legal AI assistant. I can help you with questions about Indian law, court cases, statutes, IPC, CrPC, and legal procedures."
      );
      showBookingButton();
      showInput("Ask me anything about Indian law...");
    }, 800);
  }

  function startBooking() {
    state.mode = "booking";
    state.step = "name";
    document.getElementById("quick-actions").innerHTML = "";
    addMessage("Great! Let's book a consultation for you. What's your name?");
    showInput("Enter your name");
  }

  function handleSend() {
    const input = document.getElementById("chatbot-input");
    const value = input.value.trim();

    if (!value) return;

    if (state.mode === "booking") {
      handleBookingInput(value);
    } else {
      handleChatInput(value);
    }

    input.value = "";
  }

  async function handleChatInput(value) {
    addMessage(value, false);
    showTyping();

    // Add to chat history
    state.chatHistory.push({
      role: "user",
      content: value,
    });

    try {
      const response = await fetch(`${config.apiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: value,
          chatHistory: state.chatHistory.slice(-6),
          firmName: config.firmName,
        }),
      });

      const result = await response.json();
      hideTyping();

      if (response.ok) {
        addMessage(result.response);
        state.chatHistory.push({
          role: "assistant",
          content: result.response,
        });
        showBookingButton();
      } else {
        throw new Error(result.message || "Failed to get response");
      }
    } catch (error) {
      hideTyping();
      console.error("Chat error:", error);
      addMessage(
        "I apologize, but I'm having trouble processing your question. Please try again or click 'Book a Consultant' to speak with our team directly."
      );
      showBookingButton();
    }
  }

  async function handleBookingInput(value) {
    addMessage(value, false);
    document.getElementById("input-group").style.display = "none";

    switch (state.step) {
      case "name":
        state.userData.name = value;
        state.step = "email";
        setTimeout(() => {
          addMessage(`Nice to meet you, ${value}! What's your email address?`);
          showInput("Enter your email");
        }, 500);
        break;

      case "email":
        if (!isValidEmail(value)) {
          addMessage("Please enter a valid email address.");
          showInput("Enter your email");
          return;
        }
        state.userData.email = value;
        state.step = "phone";
        setTimeout(() => {
          addMessage("What's your phone number?");
          showInput("Enter your phone number");
        }, 500);
        break;

      case "phone":
        state.userData.phone = value;
        state.step = "occupation";
        setTimeout(() => {
          addMessage("What's your occupation?");
          showInput("Enter your occupation");
        }, 500);
        break;

      case "occupation":
        state.userData.occupation = value;
        state.step = "description";
        setTimeout(() => {
          addMessage(
            "Please provide a brief description of your legal matter:"
          );
          showInput("Describe your case briefly...");
        }, 500);
        break;

      case "description":
        state.userData.description = value;
        await submitBooking();
        break;
    }
  }

  async function submitBooking() {
    addMessage("Analyzing your case...");
    showTyping();

    try {
      const response = await fetch(`${config.apiUrl}/book-consultation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...state.userData,
          firmEmail: config.firmEmail,
          firmName: config.firmName,
        }),
      });

      const result = await response.json();
      hideTyping();

      if (response.ok) {
        // Show case type and confirmation
        addMessage(
          `✅ Based on your description, this appears to be a **${result.caseType}** case.`
        );
        addMessage(
          `Great! Your consultation has been confirmed. Our legal team will contact you shortly at ${state.userData.phone}.`
        );

        // Show similar cases if available
        if (result.similarCases && result.similarCases.length > 0) {
          let similarCasesHtml =
            '<div class="similar-cases"><h4>📚 Similar Cases:</h4>';
          result.similarCases.forEach((c) => {
            similarCasesHtml += `<p><strong>${c.title}</strong>: ${c.snippet}</p>`;
          });
          similarCasesHtml += "</div>";

          const messagesDiv = document.getElementById("chatbot-messages");
          const lastMessage = messagesDiv.lastElementChild;
          lastMessage.querySelector(".message-content").innerHTML +=
            similarCasesHtml;
        }

        // Reset and show chat interface
        setTimeout(() => {
          addMessage(
            "You can continue asking me questions about Indian law, or close this chat. How can I help you?"
          );
          resetBookingData();
          showBookingButton();
          showInput("Ask me anything about Indian law...");
        }, 2000);
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      hideTyping();
      console.error("Booking error:", error);
      addMessage(
        "❌ Sorry, there was an error processing your consultation request. Please try again or contact us directly."
      );
      setTimeout(() => {
        resetBookingData();
        showBookingButton();
        showInput("Ask me anything about Indian law...");
      }, 1000);
    }
  }

  function resetBookingData() {
    state.mode = "chat";
    state.step = "welcome";
    state.userData = {
      name: "",
      email: "",
      phone: "",
      occupation: "",
      description: "",
    };
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createChatbot);
  } else {
    createChatbot();
  }
})();
