/* =========================================================
   SecureID - Registration Journey
   Phase 2
   UI only - backend integration comes later
   ========================================================= */

const app = document.getElementById("app");

const state = {
  screen: "register",

  passwordVisible: false,

  password: "",

  passwordRules: {
    length: false,
    uppercase: false,
    number: false,
    special: false
  },

  otp: "",

  email: "priya.sharma@email.com",

  mobile: "+91 98765 43210"
};

/* =========================================================
   Screen Configuration
   ========================================================= */

const screens = {
  register: 1,
  emailOtp: 2,
  emailWrong: 2,
  emailExpired: 2,
  mobileOtp: 3,
  mobileWrong: 3,
  mobileMaxAttempts: 3,
  mfaSetup: 4,
  authenticatorSetup: 5,
  mfaVerification: 6,
  mfaWrong: 6,
  success: 7
};

/* =========================================================
   Helpers
   ========================================================= */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setScreen(screen) {
  state.screen = screen;

  render();
}

function icon(symbol, className = "") {
  return `
    <div class="page-icon ${className}">
      ${symbol}
    </div>
  `;
}

/* =========================================================
   Progress
   ========================================================= */

function renderProgress(currentStep) {
  const totalSteps = 7;

  let html = `<div class="progress">`;

  for (let step = 1; step <= totalSteps; step++) {
    const completed = step < currentStep;
    const active = step === currentStep;

    html += `
      <div
        class="progress-step
        ${active ? "active" : ""}
        ${completed ? "completed" : ""}"
      >
        ${completed ? "✓" : step}
      </div>
    `;

    if (step !== totalSteps) {
      html += `
        <div
          class="progress-line
          ${step < currentStep ? "completed" : ""}"
        ></div>
      `;
    }
  }

  html += `</div>`;

  return html;
}

/* =========================================================
   Layout
   ========================================================= */

function renderLayout(content, currentStep) {
  app.innerHTML = `
    <div class="auth-layout">

      <aside class="auth-brand">
        <div class="brand-content">

          <div class="brand-logo">
            <div class="brand-shield">🛡</div>
            SecureID
          </div>

          <h2>Secure access starts here.</h2>

          <p>
            Protect your account with secure authentication
            and multi-factor verification.
          </p>

        </div>
      </aside>

      <main class="auth-main">
        <div class="auth-container">

          ${renderProgress(currentStep)}

          ${content}

        </div>
      </main>

    </div>
  `;
}

/* =========================================================
   Registration Screen
   ========================================================= */

function renderRegister() {
  renderLayout(
    `
      <section>

        <header class="page-header">
          ${icon("🛡")}

          <h1>Create your account</h1>

          <p>Let's get you started</p>
        </header>

        <form id="registrationForm">

          <div class="form-group">
            <label class="form-label" for="fullName">
              Full Name
            </label>

            <input
              class="form-input"
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              autocomplete="name"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">
              Email
            </label>

            <input
              class="form-input"
              id="email"
              type="email"
              placeholder="Enter your email"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-group">

            <label class="form-label" for="mobile">
              Mobile Number
            </label>

            <div class="phone-row">

              <select
                class="country-code"
                id="countryCode"
              >
                <option value="+91">+91</option>
              </select>

              <input
                class="form-input"
                id="mobile"
                type="tel"
                placeholder="98765 43210"
                autocomplete="tel"
                required
              />

            </div>

          </div>

          <div class="form-group">

            <label class="form-label" for="password">
              Password
            </label>

            <div class="input-wrapper">

              <input
                class="form-input"
                id="password"
                type="password"
                placeholder="Create a password"
                autocomplete="new-password"
                required
              />

              <button
                type="button"
                class="password-toggle"
                id="passwordToggle"
                aria-label="Show password"
              >
                👁
              </button>

            </div>

            <div id="passwordStrength"></div>

          </div>

          <div class="checkbox-row">

            <input
              id="terms"
              type="checkbox"
              required
            />

            <label for="terms">
              I agree to the Terms & Conditions
              and Privacy Policy.
            </label>

          </div>

          <button
            type="submit"
            class="primary-button"
          >
            Create Account
          </button>

        </form>

        <p class="bottom-text">
          Already have an account?
          <button
            type="button"
            class="text-button"
          >
            Login
          </button>
        </p>

      </section>
    `,
    screens.register
  );

  setupRegistrationEvents();
}

/* =========================================================
   Password Strength
   ========================================================= */

function calculatePasswordStrength(password) {
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  state.passwordRules = rules;

  const score = Object.values(rules).filter(Boolean).length;

  if (score <= 1) {
    return "weak";
  }

  if (score <= 3) {
    return "medium";
  }

  return "strong";
}

function renderPasswordStrength(password) {
  if (!password) {
    return "";
  }

  const strength = calculatePasswordStrength(password);

  const score = Object.values(state.passwordRules)
    .filter(Boolean)
    .length;

  const label =
    strength.charAt(0).toUpperCase() + strength.slice(1);

  return `
    <div class="strength-container">

      <div class="strength-label">
        <span>Password strength</span>
        <strong>${label}</strong>
      </div>

      <div class="strength-bars">

        <div
          class="strength-bar
          ${score >= 1 ? `active ${strength}` : ""}"
        ></div>

        <div
          class="strength-bar
          ${score >= 2 ? `active ${strength}` : ""}"
        ></div>

        <div
          class="strength-bar
          ${score >= 4 ? `active ${strength}` : ""}"
        ></div>

      </div>

      <div class="password-requirements">

        <div class="password-requirements-title">
          Password must contain:
        </div>

        ${renderRequirement(
          "At least 8 characters",
          state.passwordRules.length
        )}

        ${renderRequirement(
          "1 uppercase letter",
          state.passwordRules.uppercase
        )}

        ${renderRequirement(
          "1 number",
          state.passwordRules.number
        )}

        ${renderRequirement(
          "1 special character",
          state.passwordRules.special
        )}

      </div>

    </div>
  `;
}

function renderRequirement(text, valid) {
  return `
    <div class="requirement ${valid ? "valid" : ""}">

      <span class="requirement-icon">
        ${valid ? "✓" : ""}
      </span>

      <span>${text}</span>

    </div>
  `;
}

/* =========================================================
   Registration Events
   ========================================================= */

function setupRegistrationEvents() {
  const form = document.getElementById("registrationForm");

  const password = document.getElementById("password");

  const passwordToggle =
    document.getElementById("passwordToggle");

  const passwordStrength =
    document.getElementById("passwordStrength");

  password.addEventListener("input", () => {
    state.password = password.value;

    passwordStrength.innerHTML =
      renderPasswordStrength(password.value);
  });

  passwordToggle.addEventListener("click", () => {
    state.passwordVisible = !state.passwordVisible;

    password.type =
      state.passwordVisible ? "text" : "password";

    passwordToggle.textContent =
      state.passwordVisible ? "🙈" : "👁";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const strength =
      calculatePasswordStrength(password.value);

    if (strength !== "strong") {
      alert("Please create a strong password.");
      return;
    }

    setScreen("emailOtp");
  });
}

/* =========================================================
   OTP Input
   ========================================================= */

function otpInputs() {
  return `
    <div class="otp-container">

      ${Array.from({ length: 6 })
        .map(
          (_, index) => `
            <input
              class="otp-input"
              maxlength="1"
              inputmode="numeric"
              autocomplete="one-time-code"
              data-index="${index}"
            />
          `
        )
        .join("")}

    </div>
  `;
}

function setupOtpInputs() {
  const inputs =
    document.querySelectorAll(".otp-input");

  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "");

      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (event) => {
      if (
        event.key === "Backspace" &&
        !input.value &&
        index > 0
      ) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (event) => {
      event.preventDefault();

      const pasted =
        event.clipboardData
          .getData("text")
          .replace(/\D/g, "")
          .slice(0, 6);

      pasted.split("").forEach((digit, i) => {
        if (inputs[i]) {
          inputs[i].value = digit;
        }
      });

      if (inputs[pasted.length - 1]) {
        inputs[pasted.length - 1].focus();
      }
    });
  });
}

/* =========================================================
   Email OTP
   ========================================================= */

function renderEmailOtp() {
  renderLayout(
    `
      <section>

        <header class="page-header">

          ${icon("✉️")}

          <h1>Verify your email</h1>

          <p>
            We have sent a 6-digit code to
            <strong>${escapeHTML(state.email)}</strong>
          </p>

        </header>

        ${otpInputs()}

        <div class="otp-timer">
          Code expires in <strong>02:45</strong>
        </div>

        <button
          class="resend"
          type="button"
        >
          Resend code (00:25)
        </button>

        <button
          id="verifyEmailButton"
          class="primary-button"
          type="button"
        >
          Verify Email
        </button>

        <p class="bottom-text">
          Didn't receive the code?
        </p>

      </section>
    `,
    screens.emailOtp
  );

  setupOtpInputs();

  document
    .getElementById("verifyEmailButton")
    .addEventListener("click", () => {
      setScreen("mobileOtp");
    });
}

/* =========================================================
   Email Wrong OTP
   ========================================================= */

function renderEmailWrong() {
  renderLayout(
    `
      <section>

        <header class="page-header">

          ${icon("✉️", "error")}

          <h1>Verify your email</h1>

          <p>
            We have sent a 6-digit code to
            <strong>${escapeHTML(state.email)}</strong>
          </p>

        </header>

        ${otpInputs()}

        <div class="otp-message error">
          Incorrect code. Please try again.<br />
          You have 2 attempts left.
        </div>

        <div class="otp-timer">
          Code expires in <strong>01:15</strong>
        </div>

        <button
          class="resend"
          type="button"
        >
          Resend code (00:25)
        </button>

        <button
          id="tryEmailAgain"
          class="primary-button"
          type="button"
        >
          Try Again
        </button>

        <p class="bottom-text">
          Didn't receive the code?
        </p>

      </section>
    `,
    screens.emailWrong
  );

  setupOtpInputs();

  document
    .getElementById("tryEmailAgain")
    .addEventListener("click", () => {
      setScreen("emailOtp");
    });
}

/* =========================================================
   Email Expired
   ========================================================= */

function renderEmailExpired() {
  renderLayout(
    `
      <section>

        <header class="page-header">

          ${icon("✉️", "error")}

          <h1>Verify your email</h1>

          <p>
            We have sent a 6-digit code to
            <strong>${escapeHTML(state.email)}</strong>
          </p>

        </header>

        ${otpInputs()}

        <div class="otp-message error">
          This code has expired.
        </div>

        <button
          id="resendEmailButton"
          class="primary-button"
          type="button"
        >
          Resend New Code
        </button>

        <p class="bottom-text">
          Didn't receive the code?
        </p>

      </section>
    `,
    screens.emailExpired
  );

  setupOtpInputs();

  document
    .getElementById("resendEmailButton")
    .addEventListener("click", () => {
      setScreen("emailOtp");
    });
}

/* =========================================================
   Mobile OTP
   ========================================================= */

function renderMobileOtp() {
  renderLayout(
    `
      <section>

        <header class="page-header">

          ${icon("📞")}

          <h1>Verify your mobile</h1>

          <p>
            We have sent a 6-digit code to
            <strong>${escapeHTML(state.mobile)}</strong>
          </p>

        </header>

        ${otpInputs()}

        <div class="otp-timer">
          Code expires in <strong>02:45</strong>
        </div>

        <button
          class="resend"
          type="button"
        >
          Resend code (00:25)
        </button>

        <button
          id="verifyMobileButton"
          class="primary-button"
          type="button"
        >
          Verify Mobile
        </button>

        <p class="bottom-text">
          Wrong number?
          <button class="text-button" type="button">
            Change
          </button>
        </p>

      </section>
    `,
    screens.mobileOtp
  );

  setupOtpInputs();

  document
    .getElementById("verifyMobileButton")
    .addEventListener("click", () => {
      setScreen("mfaSetup");
    });
}

/* =========================================================
   Mobile Wrong OTP
   ========================================================= */

function renderMobileWrong() {
  renderLayout(
    `
      <section>

        <header class="page-header">

          ${icon("📞", "error")}

          <h1>Verify your mobile</h1>

          <p>
            We have sent a 6-digit code to
            <strong>${escapeHTML(state.mobile)}</strong>
          </p>

        </header>

        ${otpInputs()}

        <div class="otp-message error">
          Incorrect code. Please try again.<br />
          You have 1 attempt left.
        </div>

        <div class="otp-timer">
          Code expires in <strong>01:02</strong>
        </div>

        <button
          class="resend"
          type="button"
        >
          Resend code (00:25)
        </button>

        <button
          id="mobileTryAgain"
          class="primary-button"
          type="button"
        >
          Try Again
        </button>

        <p class="bottom-text">
          Wrong number?
          <button class="text-button" type="button">
            Change
          </button>
        </p>

      </section>
    `,
    screens.mobileWrong
  );

  setupOtpInputs();

  document
    .getElementById("mobileTryAgain")
    .addEventListener("click", () => {
      setScreen("mobileOtp");
    });
}

/* =========================================================
   Mobile Maximum Attempts
   ========================================================= */

function renderMobileMaxAttempts() {
  renderLayout(
    `
      <section>

        <header class="page-header">

          ${icon("📞", "error")}

          <h1>Verify your mobile</h1>

          <p>
            We have sent a 6-digit code to
            <strong>${escapeHTML(state.mobile)}</strong>
          </p>

        </header>

        ${otpInputs()}

        <div class="otp-message error">
          Maximum attempts reached.<br />
          Please request a new code.
        </div>

        <button
          id="resendMobileButton"
          class="primary-button"
          type="button"
        >
          Resend New Code
        </button>

        <p class="bottom-text">
          Wrong number?
          <button class="text-button" type="button">
            Change
          </button>
        </p>

      </section>
    `,
    screens.mobileMaxAttempts
  );

  setupOtpInputs();

  document
    .getElementById("resendMobileButton")
    .addEventListener("click", () => {
      setScreen("mobileOtp");
    });
}

/* =========================================================
   MFA Setup
   ========================================================= */

function renderMfaSetup() {
  renderLayout(
    `
      <section>

        <header class="page-header">

          ${icon("🛡")}

          <h1>Set up Multi-Factor Auth</h1>

          <p>
            Add an extra layer of security
            to protect your account.
          </p>

        </header>

        <div class="method-list">

          <label class="method-card selected">

            <div class="method-icon">
              🔐
            </div>

            <div class="method-content">
              <strong>Authenticator App</strong>
              <span>
                Google Authenticator / Authy
              </span>
            </div>

            <input
              class="method-radio"
              type="radio"
              name="mfa"
              checked
            />

          </label>

          <label class="method-card">

            <div class="method-icon">
              📱
            </div>

            <div class="method-content">
              <strong>SMS Authentication</strong>
              <span>
                Receive codes on your mobile
              </span>
            </div>

            <input
              class="method-radio"
              type="radio"
              name="mfa"
            />

          </label>

          <label class="method-card">

            <div class="method-icon">
              ✉️
            </div>

            <div class="method-content">
              <strong>Email Authentication</strong>
              <span>
                Receive codes on your email
              </span>
            </div>

            <input
              class="method-radio"
              type="radio"
              name="mfa"
            />

          </label>

        </div>

        <button
          id="continueMfaButton"
          class="primary-button"
          type="button"
        >
          Continue
        </button>

      </section>
    `,
    screens.mfaSetup
  );

  document
    .getElementById("continueMfaButton")
    .addEventListener("click", () => {
      setScreen("authenticatorSetup");
    });
}

/* =========================================================
   Authenticator Setup
   ========================================================= */

function renderAuthenticatorSetup() {
  renderLayout(
    `
      <section>

        <header class="page-header">

          ${icon("🔐")}

          <h1>Scan QR Code</h1>

          <p>
            Open your authenticator app and
            scan this QR code.
          </p>

        </header>

        <div class="qr-container">
          <div class="qr-placeholder">
            QR
          </div>
        </div>

        <p class="bottom-text">
          Can't scan?
          <button
            class="text-button"
            type="button"
          >
            Enter setup key
          </button>
        </p>

        <button
          id="continueAuthenticatorButton"
          class="primary-button"
          type="button"
        >
          Continue
        </button>

      </section>
    `,
    screens.authenticatorSetup
  );

  document
    .getElementById("continueAuthenticatorButton")
    .addEventListener("click", () => {
      setScreen("mfaVerification");
    });
}

/* =========================================================
   MFA Verification
   ========================================================= */

function renderMfaVerification() {
  renderLayout(
    `
      <section>

        <header class="page-header">

          ${icon("🛡")}

          <h1>Enter the 6-digit code</h1>

          <p>
            Enter the code from your
            authenticator app.
          </p>

        </header>

        ${otpInputs()}

        <div class="otp-timer">
          Code expires in <strong>00:28</strong>
        </div>

        <button
          id="verifyMfaButton"
          class="primary-button"
          type="button"
        >
          Verify
        </button>

        <p class="bottom-text">
          Can't access your app?
        </p>

      </section>
    `,
    screens.mfaVerification
  );

  setupOtpInputs();

  document
    .getElementById("verifyMfaButton")
    .addEventListener("click", () => {
      setScreen("success");
    });
}

/* =========================================================
   MFA Wrong Code
   ========================================================= */

function renderMfaWrong() {
  renderLayout(
    `
      <section>

        <header class="page-header">

          ${icon("🛡", "error")}

          <h1>Enter the 6-digit code</h1>

          <p>
            Enter the code from your
            authenticator app.
          </p>

        </header>

        ${otpInputs()}

        <div class="otp-message error">
          Invalid code. Please try again.
        </div>

        <div class="otp-timer">
          Code expires in <strong>00:10</strong>
        </div>

        <button
          id="mfaTryAgain"
          class="primary-button"
          type="button"
        >
          Try Again
        </button>

        <p class="bottom-text">
          Can't access your app?
        </p>

      </section>
    `,
    screens.mfaWrong
  );

  setupOtpInputs();

  document
    .getElementById("mfaTryAgain")
    .addEventListener("click", () => {
      setScreen("mfaVerification");
    });
}

/* =========================================================
   Registration Success
   ========================================================= */

function renderSuccess() {
  renderLayout(
    `
      <section>

        <header class="page-header">

          ${icon("✓", "success")}

          <h1>Account created!</h1>

          <p>
            Your account has been created
            successfully and MFA is enabled.
          </p>

        </header>

        <div class="success-list">

          <div class="success-item">
            <span class="success-check">✓</span>
            Email verified
          </div>

          <div class="success-item">
            <span class="success-check">✓</span>
            Mobile verified
          </div>

          <div class="success-item">
            <span class="success-check">✓</span>
            MFA enabled
          </div>

        </div>

        <button
          id="continueLoginButton"
          class="primary-button"
          type="button"
        >
          Continue to Login
        </button>

      </section>
    `,
    screens.success
  );

  document
    .getElementById("continueLoginButton")
    .addEventListener("click", () => {
      alert("Login Journey will be implemented in a later phase.");
    });
}

/* =========================================================
   Router
   ========================================================= */

function render() {
  switch (state.screen) {
    case "register":
      renderRegister();
      break;

    case "emailOtp":
      renderEmailOtp();
      break;

    case "emailWrong":
      renderEmailWrong();
      break;

    case "emailExpired":
      renderEmailExpired();
      break;

    case "mobileOtp":
      renderMobileOtp();
      break;

    case "mobileWrong":
      renderMobileWrong();
      break;

    case "mobileMaxAttempts":
      renderMobileMaxAttempts();
      break;

    case "mfaSetup":
      renderMfaSetup();
      break;

    case "authenticatorSetup":
      renderAuthenticatorSetup();
      break;

    case "mfaVerification":
      renderMfaVerification();
      break;

    case "mfaWrong":
      renderMfaWrong();
      break;

    case "success":
      renderSuccess();
      break;

    default:
      renderRegister();
  }
}

/* =========================================================
   Development Navigation
   =========================================================

   These are temporary development helpers.

   They allow us to verify all required UI states
   before connecting real backend APIs.

   They are not authentication logic.
   ========================================================= */

window.secureIDDev = {
  emailWrong: () => setScreen("emailWrong"),
  emailExpired: () => setScreen("emailExpired"),
  mobileWrong: () => setScreen("mobileWrong"),
  mobileMaxAttempts: () => setScreen("mobileMaxAttempts"),
  mfaWrong: () => setScreen("mfaWrong")
};

/* =========================================================
   Initial Render
   ========================================================= */

render();