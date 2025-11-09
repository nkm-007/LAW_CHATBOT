/**
 * Universal Chatbot Widget
 * Add to any website with: <script src="YOUR_CDN_URL/chatbot-widget.js" data-firm-name="Your Firm" data-firm-email="firm@examle.com"></script>
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
      "https://chatbot-api-0mod.onrender.com",
  };

  const CASE_TYPES = [
    "Civil Law",
    "Criminal Law",
    "Corporate Law",
    "Family Law",
    "Property Law",
    "Tax Law",
    "Other",
  ];

  // Chatbot state
  const state = {
    isOpen: false,
    step: "welcome",
    userData: {
      name: "",
      email: "",
      phone: "",
      occupation: "",
      caseType: "",
      description: "",
    },
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
    }

    .action-button:hover {
      opacity: 0.9;
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .select-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      margin-bottom: 8px;
      background: white;
    }

    .select-input:focus {
      border-color: #ED1C24;
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
          <h3>Chat with Us</h3>
          <button class="chatbot-close" id="chatbot-close">×</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-input-area" id="chatbot-input-area">
          <div class="quick-actions" id="quick-actions"></div>
          <div class="input-group" id="input-group" style="display: none;">
            <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Type your message...">
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
  }

  function addMessage(text, isBot = true) {
    const messagesDiv = document.getElementById("chatbot-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isBot ? "bot" : "user"}`;

    if (isBot) {
      messageDiv.innerHTML = `
        <div class="bot-avatar">B</div>
        <div class="message-content">${text}</div>
      `;
    } else {
      messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function showActionButton(text, action) {
    const actionsDiv = document.getElementById("quick-actions");
    actionsDiv.innerHTML = `<button class="action-button">${text}</button>`;
    actionsDiv.querySelector("button").addEventListener("click", action);
  }

  function showInput(placeholder) {
    document.getElementById("quick-actions").innerHTML = "";
    const inputGroup = document.getElementById("input-group");
    inputGroup.style.display = "flex";
    const input = document.getElementById("chatbot-input");
    input.placeholder = placeholder;
    input.focus();
  }

  function showSelect(options) {
    document.getElementById("quick-actions").innerHTML = "";
    document.getElementById("input-group").style.display = "none";

    const actionsDiv = document.getElementById("quick-actions");
    const select = document.createElement("select");
    select.className = "select-input";
    select.innerHTML =
      '<option value="">Select an option...</option>' +
      options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");

    actionsDiv.appendChild(select);

    select.addEventListener("change", (e) => {
      if (e.target.value) {
        handleUserInput(e.target.value);
      }
    });
  }

  function initializeChat() {
    state.step = "welcome";
    addMessage(`Hi, welcome to ${config.firmName} Chat Bot! 👋`);
    setTimeout(() => {
      addMessage("I'm here to help you book a consultation with our experts.");
      showActionButton("📅 Book a Consultant", startBooking);
    }, 800);
  }

  function startBooking() {
    state.step = "name";
    document.getElementById("quick-actions").innerHTML = "";
    addMessage("Great! Let's get started. What's your name?");
    showInput("Enter your name");
  }

  function handleSend() {
    const input = document.getElementById("chatbot-input");
    const value = input.value.trim();

    if (!value) return;

    handleUserInput(value);
    input.value = "";
  }

  async function handleUserInput(value) {
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
        state.step = "caseType";
        setTimeout(() => {
          addMessage("What type of case do you need help with?");
          showSelect(CASE_TYPES);
        }, 500);
        break;

      case "caseType":
        state.userData.caseType = value;
        state.step = "description";
        setTimeout(() => {
          addMessage("Please provide a short description of your case:");
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
    addMessage("Processing your request...");

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

      if (response.ok) {
        addMessage(
          "✅ Thank you! Your consultation request has been submitted successfully."
        );
        addMessage(
          `We've sent confirmation emails to both you and our team. We'll contact you shortly at ${state.userData.phone}.`
        );

        // Show restart button after 2 seconds
        setTimeout(() => {
          showActionButton("Start New Booking", resetChat);
        }, 2000);
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      addMessage(
        "❌ Sorry, there was an error submitting your request. Please try again or contact us directly."
      );
      setTimeout(() => {
        showActionButton("Try Again", resetChat);
      }, 1000);
    }
  }

  function resetChat() {
    document.getElementById("chatbot-messages").innerHTML = "";
    state.userData = {
      name: "",
      email: "",
      phone: "",
      occupation: "",
      caseType: "",
      description: "",
    };
    initializeChat();
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
