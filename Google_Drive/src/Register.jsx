import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";
import { useEffect, useState } from "react";

const OTP_EXPIRY_SECONDS = 10 * 60;

const Register = () => {
   const BASE_URL = `${window.location.protocol}//${window.location.hostname}:4000`;

   const [formData, setFormData] = useState({
      name: "",
      email: "",
      otp: "",
      password: "",
   });

   // serverError will hold the error message from the server
   const [serverError, setServerError] = useState("");

   const [isSuccess, setIsSuccess] = useState(false);

   // Frontend-only OTP UI state. Wire this action to an email endpoint when one
   // is available on the server.
   const [isOtpSent, setIsOtpSent] = useState(false);
   const [isOtpVerified, setIsOtpVerified] = useState(false);
   const [otpTimeLeft, setOtpTimeLeft] = useState(0);
   const [otpMessage, setOtpMessage] = useState("");

   const navigate = useNavigate();

   useEffect(() => {
      if (!isOtpSent) return;

      const timerId = window.setInterval(() => {
         setOtpTimeLeft((previousTime) => {
            if (previousTime <= 1) {
               setIsOtpSent(false);
               return 0;
            }

            return previousTime - 1;
         });
      }, 1000);

      return () => window.clearInterval(timerId);
   }, [isOtpSent]);

   // Handler for input changes
   const handleChange = (e) => {
      const { name, value } = e.target;

      // Clear the server error as soon as the user starts typing in Email
      if (name === "email" && serverError) {
         setServerError("");
      }

      if (name === "email" && isOtpSent) {
         setIsOtpSent(false);
         setOtpTimeLeft(0);
      }

      if (name === "email" || name === "otp") {
         setIsOtpVerified(false);
         setOtpMessage("");
      }

      setFormData((prevFormData) => ({
         ...prevFormData,
         [name]: value,
      }));
   };

   const handleSendOtp = async () => {
      if (!formData.email) return;

      try {
         const res = await fetch(`${BASE_URL}/auth/send-otp`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: formData.email }),
         });
         const data = await res.json();

         if (!res.ok) throw new Error(data.error || "Unable to send OTP.");

         setOtpMessage("");
         setOtpTimeLeft(OTP_EXPIRY_SECONDS);
         setIsOtpSent(true);
      } catch (error) {
         setOtpMessage(error.message);
      }
   };

   const handleVerifyOtp = async () => {
      if (!formData.otp) {
         setOtpMessage("Enter the OTP sent to your email.");
         return;
      }

      try {
         const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: formData.email, otp: formData.otp }),
         });
         const data = await res.json();

         if (!res.ok) throw new Error(data.error || "Unable to verify OTP.");

         setIsOtpVerified(true);
         setIsOtpSent(false);
         setOtpTimeLeft(0);
         setOtpMessage(data.message);
      } catch (error) {
         setOtpMessage(error.message);
      }
   };

   const formattedOtpTime = `${String(Math.floor(otpTimeLeft / 60)).padStart(2, "0")}:${String(
      otpTimeLeft % 60,
   ).padStart(2, "0")}`;

   // Handler for form submission
   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSuccess(false); // reset success if any

      // The disabled button is the main UI protection; this also prevents a
      // programmatic form submission before verification finishes.
      if (!isOtpVerified) {
         setOtpMessage("Verify your email OTP before registering.");
         return;
      }

      try {
         const response = await fetch(`${BASE_URL}/user/register`, {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
               "Content-Type": "application/json",
            },
            credentials: "include",
         });

         const data = await response.json();

         if (data.error) {
            // Show error below the email field (e.g., "Email already exists")
            setServerError(data.error);
         } else {
            // Registration success
            setIsSuccess(true);
            setTimeout(() => {
               navigate("/");
            }, 2000);
         }
      } catch (error) {
         // In case fetch fails
         console.error("Error:", error);
         setServerError("Something went wrong. Please try again.");
      }
   };

   return (
      <div className="container">
         <h2 className="heading">Register</h2>
         <form className="form" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="form-group">
               <label htmlFor="name" className="label">
                  Name
               </label>
               <input
                  className="input"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
               />
            </div>

            {/* Email */}
            <div className="form-group">
               <label htmlFor="email" className="label">
                  Email
               </label>
               <input
                  // If there's a serverError, add an extra class to highlight border
                  className={`input otp-email-input ${serverError ? "input-error" : ""}`}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
               />
               <button
                  type="button"
                  className={`otp-button ${isOtpSent ? "sent" : ""}`}
                  onClick={handleSendOtp}
                  disabled={!formData.email || isOtpSent}
               >
                  {isOtpSent ? "OTP Sent" : "Send OTP"}
               </button>
               {/* Absolutely-positioned error message below email field */}
               {serverError && <span className="error-msg">{serverError}</span>}
               {isOtpSent && (
                  <span className="otp-status">
                     OTP sent. It expires in {formattedOtpTime}.
                  </span>
               )}
            </div>

            {/* Verification code */}
            <div className="form-group">
               <label htmlFor="otp" className="label">
                  Email OTP
               </label>
               <input
                  className="input"
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter the 4-digit OTP"
                  inputMode="numeric"
                  maxLength="6"
               />
               {isOtpSent && (
                  <button
                     type="button"
                     className="verify-otp-button"
                     onClick={handleVerifyOtp}
                     disabled={!formData.otp}
                  >
                     Verify OTP
                  </button>
               )}
               {otpMessage && (
                  <span
                     className={`otp-feedback ${isOtpVerified ? "verified" : "error"}`}
                  >
                     {otpMessage}
                  </span>
               )}
            </div>

            {/* Password */}
            <div className="form-group">
               <label htmlFor="password" className="label">
                  Password
               </label>
               <input
                  className="input"
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
               />
            </div>

            <button
               disabled={!isOtpVerified}
               type="submit"
               className={`submit-button ${isSuccess ? "success" : ""}`}
            >
               {isSuccess ? "Registration Successful" : "Register"}
            </button>
         </form>

         {/* Link to the login page */}
         <p className="link-text">
            Already have an account? <Link to="/login">Login</Link>
         </p>
      </div>
   );
};

export default Register;
