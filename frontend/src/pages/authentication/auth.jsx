// ============= Reusable authentication component =============
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home } from 'lucide-react'
import '../../index.css'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google'   // Importing the GoogleLogin component for Google OAuth authentication
import { jwtDecode } from 'jwt-decode' // Importing the jwt_decode library to decode JWT tokens
import emailjs from '@emailjs/browser'


axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'; // Set the base URL for axios requests, using an environment variable or defaulting to localhost
axios.defaults.withCredentials = true; // Enable sending cookies with requests

const Auth = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate between routes
  let [isLogin, setIsLogin] = useState(true)      // State to toggle between login and signup forms
  const [isBuyer, setIsBuyer] = useState(true)    // State to toggle between buyer and seller forms
  const [isForgotPassword, setIsForgotPassword] = useState(false) // State to toggle forgot password form
  const [isSendEmail, setIsSendEmail] = useState(true) // State to toggle between sending email or SMS
  const [isOTPSent, setIsOTPSent] = useState(false) // State to track if OTP has been sent
  const [isOTPVerified, setIsOTPVerified] = useState(false) // State to track if OTP has been verified
  // State for the sign-up form
  const [signUpForm, setSignUpForm] = useState({
    fullname: '',
    email: '',
    phone: '',
    password: '',
    company_name: '',
    primary_service: '',
    company_registration: '',
    user_role: isBuyer ? 'buyer' : 'seller',
  });
  // State for the sign-in form
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
  });
  // State for the forgot password form
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: '',
    phone: '',
  });
  // State to hold messages for user feedback
  const [message, setMessage] = useState('');
  // State for loading and status
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: null,
    message: "",
  });
  // State for OTP data
  const [otpData, setOtpData] = useState({
    otp: '',
    userEmail: '',
    userName: '',
  });
  
  // Function to navigate to the appropriate dashboard based on user role
  const navigateToDashboard = (authenticatedUser) => {
    if (authenticatedUser.user_role === 'buyer') {
      navigate('/buyer-dashboard');
    } else if (authenticatedUser.user_role === 'seller') {
      navigate('/seller-dashboard');
    }
  };

  // TODO: Add form submission handlers and validation logic for login, signup, and forgot password forms
  // Function to handle user registration (signup) form submission
  const handleSignUp = async (event) => {
    event.preventDefault();   //Preventing default form submission behavior to handle it via JavaScript.
    try {
      
      // Send a POST request to the signup endpoint
      const response = await axios.post('/auth/sign-up', signUpForm);
      const authenticatedUser = response.data.user;
      setSignUpForm({
        fullname: '',
        email: '',
        phone: '',
        password: '',
        company_name: '',
        primary_service: '',
        company_registration: '',
        user_role: isBuyer ? 'buyer' : 'seller',
      });
      navigateToDashboard(authenticatedUser);
    } catch (error) {
      console.error('Error occurred while signing up:', error);
    }
  };
  // Function to sign up with google
  const handleGoogleSignUp = async (credentialResponse) => {
  try {
    // Decode the JWT token to extract user information
    const decoded = jwtDecode(credentialResponse.credential);
    
      // Prepare the data for the backend
      const googleSignUpForm = {
        fullname: decoded.name || '', // Provide fallback in case name is missing
        email: decoded.email,
        user_role: isBuyer ? 'buyer' : 'seller', // Fixed: properly set the user role
      };

      // Send a POST request to the google-signup endpoint
      const response = await axios.post('/auth/google-signup', googleSignUpForm);
      const authenticatedUser = response.data.user;
      navigateToDashboard(authenticatedUser);
    } catch (error) {
      console.error('Error occurred while signing up with Google:', error);
      // Optionally show user-friendly error message
    }
  };
  // Function to handle user login (signin) form submission
  const handleSignIn = async (event) => {
    event.preventDefault();   //Preventing default form submission behavior to handle it via JavaScript.
    try {
      // Send a POST request to the signin endpoint
      const response = await axios.post('/auth/sign-in', signInForm);
      const authenticatedUser = response.data.user;
      setSignInForm({
        email: '',
        password: '',
      });
      navigateToDashboard(authenticatedUser);
    } catch (error) {
      console.error('Error occurred while signing in:', error);
    }
  };
  // A function to sign in with Google
  const handleGoogleSignIn = async (credentialResponse) => {
    try {
      // Decode the JWT token to extract user information
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Prepare the data for the backend
      const googleSignInForm = {
        email: decoded.email,
      };

      // Send a POST request to the google-signin endpoint
      const response = await axios.post('/auth/google-signin', googleSignInForm);
      const authenticatedUser = response.data.user;
      navigateToDashboard(authenticatedUser);
    } catch (error) {
      console.error('Error occurred while signing in with Google:', error);
    }
  };
  
  // Function to send the OTP via email or SMS
  const handleSendOTP = async (otp, userEmail, userName) => {
    try {
      setIsLoading(true);
      setSubmitStatus({ type: null, message: "" });
      
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // Checking if we're using the correct environment variables
      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS configuration variables are missing");
      }
      
      // Send the OTP via EmailJS
      await emailjs.send(serviceId, templateId, {
        name: userName || 'User',
        email: userEmail,
        subject: 'Password Reset OTP',
        message: `Your password reset OTP is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this password reset, please ignore this email.`,
      }, publicKey);
      
      // If successful
      setSubmitStatus({
        type: "success",
        message: "OTP sent successfully to your email."
      });
      
    } catch (error) {
      console.error("Error occurred trying to send OTP:", error.message);
      setSubmitStatus({
        type: "error",
        message: error.message || "Error occurred trying to send OTP"
      });
      throw error; // Re-throw to handle in the calling function
    } finally {
      setIsLoading(false);
    }
  };

  // A function to handle forgot password form submission
  const handleForgotPassword = async (event) => {
    event.preventDefault();   //Preventing default form submission behavior to handle it via JavaScript.
    
    try {
      setIsLoading(true);
      setMessage('');
      
      let response;
      let userEmail = '';
      let userName = '';
      
      // Send a POST request to the forgot-password endpoint
      if (isSendEmail) {
        // Check if email is provided
        if (!forgotPasswordForm.email) {
          setMessage('Please enter your email address');
          setIsLoading(false);
          return;
        }
        
        response = await axios.post('/auth/forgot-password', { 
          email: forgotPasswordForm.email 
        });
        
        // Store email for sending OTP
        userEmail = forgotPasswordForm.email;
        // You might want to get the user's name from the response
        userName = response.data.user?.fullname || 'User';
        
        // Clear the form field
        forgotPasswordForm.email = '';
      } else {
        // Check if phone is provided
        if (!forgotPasswordForm.phone) {
          setMessage('Please enter your phone number');
          setIsLoading(false);
          return;
        }
        
        response = await axios.post('/auth/forgot-password', { 
          phone: forgotPasswordForm.phone 
        });
        
        // For SMS, you might want to get the user's email for the response
        userEmail = response.data.user?.email || '';
        userName = response.data.user?.fullname || 'User';
        
        // Clear the form field
        forgotPasswordForm.phone = '';
      }
      
      // Store the OTP received from the backend
      const otp = response.data.otp;
      
      // Store OTP data for potential use in verification
      setOtpData({
        otp: otp,
        userEmail: userEmail,
        userName: userName,
      });
      
      // If we have an email and we're sending via email, send the OTP
      if (isSendEmail && userEmail) {
        try {
          await handleSendOTP(otp, userEmail, userName);
          setSubmitStatus({
            type: "success",
            message: "OTP sent successfully to your email."
          });
          // setMessage('OTP sent successfully to your email. Please check your inbox.');
        } catch (emailError) {
          // If email sending fails, still show the backend message
          // setMessage(response.data.message || 'OTP generated but could not be sent via email. Please try again.');
          setSubmitStatus({
            type: "success",
            message: response.data.message || 'OTP generated but could not be sent via email. Please try again.'
          });
          console.error('Email sending failed:', emailError);
        }
      } else if (!isSendEmail) {
        // For SMS, we would send via Twilio or another SMS service
        // Since EmailJS doesn't support SMS, we'll show a message
        // setMessage(response.data.message || 'OTP sent successfully to your phone via SMS.');
        setSubmitStatus({
            type: "success",
            message: response.data.message || 'OTP sent successfully to your phone via SMS.'
        });
      }
      
      // Set OTP sent state to true
      setIsOTPSent(true);
      
    } catch (error) {
      console.error('Error occurred while requesting password reset:', error.message);
      setMessage(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Home Icon Link */}
      <Link to="/" className="absolute top-6 left-6 text-cyan-500 hover:text-cyan-600 transition-colors p-2 rounded-full hover:bg-slate-200">
        <Home className="w-8 h-8" />
      </Link>

      {isLogin ? (
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Sign In Header */}
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-3xl font-extrabold text-slate-800 border-b-4 border-slate-800 pb-2 px-4 tracking-wide">
              Sign In
            </h2>
          </div>

          {/* ---------A card container for the Login form------------ */}
          <div className="bg-white border border-slate-800 rounded-[32px] p-8 md:p-10 w-full shadow-sm">
            <p className="text-center text-slate-800 font-bold mb-6 text-sm">
              Welcome back to <span className="font-extrabold">MarketSquare</span>!
            </p>
            <form onSubmit={handleSignIn} className="grid grid-cols-[90px_1fr] gap-y-4 gap-x-3 items-center">
              <label htmlFor="username" className="text-slate-800 font-bold text-left text-sm md:text-base">Username:</label>
              <input type="text" id="username" placeholder="youremail@example.com" value={signInForm.email} onChange={(e) => setSignInForm({...signInForm, email: e.target.value})} required
                className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
              />

              <label htmlFor="password" className="text-slate-800 font-bold text-left text-sm md:text-base">Password:</label>
              <input type="password" id="password" placeholder="password" value={signInForm.password} onChange={(e) => setSignInForm({...signInForm, password: e.target.value})} required
                className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
              />

              {/* Forgot password link */}
              <div className="col-span-2 text-left">
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs md:text-sm text-slate-500 hover:text-black transition-colors font-semibold cursor-pointer">
                  Forgot password?
                </button>
              </div>
              {/* Social buttons spanning full width of card */}
                <div className="col-span-2 flex gap-2 w-full mt-2">
                  <GoogleLogin onSuccess={(credentialResponse) => handleGoogleSignIn(credentialResponse)} 
                    onError={() => console.log('Login with Google Failed')}
                  />
                  <button
                    type="button"
                    className="flex-1 py-1.5 px-1 border border-slate-800 rounded-md text-[10px] md:text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors text-center cursor-pointer whitespace-nowrap"
                  >
                    Continue with Facebook
                  </button>
                </div>

              {/* Sign In button spanning full width of form */}
              <div className="col-span-2 w-full mt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#00d8ff] hover:bg-[#00c5eb] text-white font-bold rounded-lg transition-colors cursor-pointer text-center text-sm tracking-wider"
                >
                  Sign In
                </button>
              </div>

              {/* Footer to switch to Sign Up */}
              <p className="col-span-2 text-center text-sm text-slate-800 mt-4 font-semibold">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-cyan-500 hover:text-cyan-600 font-bold underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Sign Up Header */}
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-3xl font-extrabold text-slate-800 border-b-4 border-slate-800 pb-2 px-4 tracking-wide">
              Sign Up
            </h2>
          </div>

          {/* -------radio buttons for selecting buyer or seller */}
          <div className="flex justify-center items-center gap-8 mb-6">
            <label className="flex items-center gap-2 text-slate-800 font-bold cursor-pointer select-none">
              <input type="radio" name="userType" checked={isBuyer} onChange={() => setIsBuyer(true)}
                className="appearance-none w-4 h-4 rounded-full border-2 border-slate-400 checked:border-slate-800 checked:bg-slate-800 transition-all cursor-pointer relative checked:after:content-[''] checked:after:absolute checked:after:w-1.5 checked:after:h-1.5 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
              />
              Buyer
            </label>
            <label className="flex items-center gap-2 text-slate-800 font-bold cursor-pointer select-none">
              <input type="radio" name="userType" checked={!isBuyer} onChange={() => setIsBuyer(false)}
                className="appearance-none w-4 h-4 rounded-full border-2 border-slate-400 checked:border-slate-800 checked:bg-slate-800 transition-all cursor-pointer relative checked:after:content-[''] checked:after:absolute checked:after:w-1.5 checked:after:h-1.5 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
              />
              Seller
            </label>
          </div>

          {/* ---------A card container for the Signup form------------ */}
          <div className="bg-white border border-slate-800 rounded-[32px] p-8 md:p-10 w-full shadow-sm">
            <p className="text-center text-slate-800 font-bold mb-6 text-sm">
              {isBuyer ? (
                <>Buy from over <span className="text-[#00d8ff] font-extrabold">200K</span> sellers</>
              ) : (
                <>Sell to over <span className="text-[#00d8ff] font-extrabold">200K</span> buyers</>
              )}
            </p>

            {isBuyer ? (
              <form onSubmit={handleSignUp} className="grid grid-cols-[90px_1fr] gap-y-4 gap-x-2 items-center">
                <label htmlFor="fullname" className="text-slate-800 font-bold text-left text-sm md:text-base">Fullname:</label>
                <input type="text" id="fullname" placeholder="fullname" value={signUpForm.fullname} onChange={(e) => setSignUpForm({...signUpForm, fullname: e.target.value})} required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />

                <label htmlFor="signup-email" className="text-slate-800 font-bold text-left text-sm md:text-base">Email:</label>
                <input type="email" id="signup-email" placeholder="email" value={signUpForm.email} onChange={(e) => setSignUpForm({...signUpForm, email: e.target.value})} required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />

                <label htmlFor="phone" className="text-slate-800 font-bold text-left text-sm md:text-base">Phone:</label>
                <input type="text" id="phone" placeholder="phone" value={signUpForm.phone} onChange={(e) => setSignUpForm({...signUpForm, phone: e.target.value})} required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />

                <label htmlFor="signup-password" className="text-slate-800 font-bold text-left text-sm md:text-base">Password:</label>
                <input type="password" id="signup-password" placeholder="password" value={signUpForm.password} onChange={(e) => setSignUpForm({...signUpForm, password: e.target.value})} required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />

                {/* Social buttons spanning full width of card */}
                <div className="col-span-2 flex gap-2 w-full mt-2">
                  <GoogleLogin text="signup_with" onSuccess={(credentialResponse) => handleGoogleSignUp(credentialResponse)}
                    onError={() => console.log('Login with Google Failed')}
                  />
                  <button
                    type="button"
                    className="flex-1 py-1.5 px-1 border border-slate-800 rounded-md text-[10px] md:text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors text-center cursor-pointer whitespace-nowrap"
                  >
                    Continue with Facebook
                  </button>
                </div>

                {/* Submit button spanning full width of card */}
                <div className="col-span-2 w-full mt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#00d8ff] hover:bg-[#00c5eb] text-white font-bold rounded-lg transition-colors cursor-pointer text-center text-sm tracking-wider"
                  >
                    Sign Up
                  </button>
                </div>

                {/* Footer link to switch to Sign In */}
                <p className="col-span-2 text-center text-sm text-slate-800 mt-4 font-semibold">
                  Already have account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-cyan-500 hover:text-cyan-600 font-bold underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="grid grid-cols-[145px_1fr] gap-y-4 gap-x-2 items-center">
                <label htmlFor="fullname" className="text-slate-800 font-bold text-left text-sm md:text-base">Fullname:</label>
                <input type="text" id="fullname" placeholder="fullname" value={signUpForm.fullname} onChange={(e) => setSignUpForm({...signUpForm, fullname: e.target.value})} required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />

                <label htmlFor="company-name" className="text-slate-800 font-bold text-left text-sm md:text-base">Company Name:</label>
                <input type="text" id="company-name" placeholder="company name" value={signUpForm.company_name} onChange={(e) => setSignUpForm({...signUpForm, company_name: e.target.value})} required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />

                <label htmlFor="primary-service" className="text-slate-800 font-bold text-left text-sm md:text-base">Primary Service:</label>
                <input type="text" id="primary-service" placeholder="primary service" value={signUpForm.primary_service} onChange={(e) => setSignUpForm({...signUpForm, primary_service: e.target.value})} required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />

                <label htmlFor="registration-number" className="text-slate-800 font-bold text-left text-sm md:text-base">Reg. Number:</label>
                <input type="text" id="registration-number" placeholder="registration number" value={signUpForm.company_registration} onChange={(e) => setSignUpForm({...signUpForm, company_registration: e.target.value})} required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />

                <label htmlFor="signup-email" className="text-slate-800 font-bold text-left text-sm md:text-base">Email:</label>
                <input type="email" id="signup-email" placeholder="email" value={signUpForm.email} onChange={(e) => setSignUpForm({...signUpForm, email: e.target.value})} required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />

                <label htmlFor="phone" className="text-slate-800 font-bold text-left text-sm md:text-base">Phone:</label>
                <input type="text" id="phone" placeholder="phone" value={signUpForm.phone} onChange={(e) => setSignUpForm({...signUpForm, phone: e.target.value})} required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />

                <label htmlFor="signup-password" className="text-slate-800 font-bold text-left text-sm md:text-base">Password:</label>
                <input type="password" id="signup-password" placeholder="password" value={signUpForm.password} onChange={(e) => setSignUpForm({...signUpForm, password: e.target.value})} required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />

                {/* Submit button spanning full width of card */}
                <div className="col-span-2 w-full mt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#00d8ff] hover:bg-[#00c5eb] text-white font-bold rounded-lg transition-colors cursor-pointer text-center text-sm tracking-wider"
                  >
                    Sign Up
                  </button>
                </div>

                {/* Footer link to switch to Sign In */}
                <p className="col-span-2 text-center text-sm text-slate-800 mt-4 font-semibold">
                  Already have account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-cyan-500 hover:text-cyan-600 font-bold underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Forgot Password Form */}
      {isForgotPassword && (
        <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          {/* Home Icon Link - now inside the forgot password overlay */}
          <Link to="/" className="absolute top-6 left-6 text-cyan-500 hover:text-cyan-600 transition-colors p-2 rounded-full hover:bg-slate-200">
            <Home className="w-8 h-8" />
          </Link>
          <div className="flex flex-col items-center w-full max-w-md">
            {/* Forgot Password Header */}
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-3xl font-extrabold text-slate-800 border-b-4 border-slate-800 pb-2 px-4 tracking-wide">
                Forgot Password
              </h2>
            </div>
          </div>
          <div className="bg-white border border-slate-800 rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-sm">
            <p className="text-slate-600 text-center mb-6">
              Enter your {isSendEmail ? 'email address' : 'phone number'} and we'll send you a One-Time Pin to reset your password.
            </p>
            <form className="space-y-4" onSubmit={handleForgotPassword}>
              {/* Radio Buttons to choose between whether to send OTP via email or phone */}
              <div className="flex justify-center items-center gap-8 mb-6">
                <label className="flex items-center gap-2 text-slate-800 font-bold cursor-pointer select-none">
                  <input type="radio" name="OTPMethod" checked={isSendEmail} onChange={() => setIsSendEmail(true)}
                    className="appearance-none w-4 h-4 rounded-full border-2 border-slate-400 checked:border-slate-800 checked:bg-slate-800 transition-all cursor-pointer relative checked:after:content-[''] checked:after:absolute checked:after:w-1.5 checked:after:h-1.5 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                  />
                  Email
                </label>
                <label className="flex items-center gap-2 text-slate-800 font-bold cursor-pointer select-none">
                  <input type="radio" name="OTPMethod" checked={!isSendEmail} onChange={() => setIsSendEmail(false)}
                    className="appearance-none w-4 h-4 rounded-full border-2 border-slate-400 checked:border-slate-800 checked:bg-slate-800 transition-all cursor-pointer relative checked:after:content-[''] checked:after:absolute checked:after:w-1.5 checked:after:h-1.5 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                  />
                  SMS
                </label>
              </div>

              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700">
                  {isSendEmail ? 'Email Address' : 'Phone Number'}
                </label>
                <input type={isSendEmail ? "email" : "tel"} id="forgot-email" placeholder={isSendEmail ? "email@example.com" : "phone number"} required disabled={isOTPSent}
                  onChange={isSendEmail ? (e) => setForgotPasswordForm({...forgotPasswordForm, email: e.target.value}) : (e) => setForgotPasswordForm({...forgotPasswordForm, phone: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              {/* A verify OTP field, which is visible only after the OTP is sent */}
              {isOTPSent && (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
                    One-Time Pin
                  </label>
                  <input type="text" id="otp" placeholder="123456" required
                    className="mt-1 block w-full px-3 py-2 border border-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              )}
              <p className="text-xs text-slate-500 text-center">{message}</p>
              {submitStatus.message && (
                <p className={`text-xs text-center ${submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {submitStatus.message}
                </p>
              )}
              {!isOTPSent ? (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 bg-[#00d8ff] hover:bg-[#00c5eb] text-white font-bold rounded-lg transition-colors cursor-pointer text-center text-sm tracking-wider ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Sending OTP...' : 'Send One-Time Pin'}
                </button>
              ) : (
                <button
                type="submit" 
                className="w-full py-2.5 px-4 bg-[#00d8ff] hover:bg-[#00c5eb] text-white font-bold rounded-lg transition-colors cursor-pointer text-center text-sm tracking-wider"
              >
                Verify OTP
              </button>
              )}
            </form>
          </div>
        </div>
      )}
      {/* OTP Sent Confirmation and password reset form */}
      {isOTPVerified && (
        <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          {/* Home Icon Link - now inside the forgot password overlay */}
          <Link to="/" className="absolute top-6 left-6 text-cyan-500 hover:text-cyan-600 transition-colors p-2 rounded-full hover:bg-slate-200">
            <Home className="w-8 h-8" />
          </Link>
          <div className="flex flex-col items-center w-full max-w-md">
            {/* Forgot Password Header */}
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-3xl font-extrabold text-slate-800 border-b-4 border-slate-800 pb-2 px-4 tracking-wide">
                Reset Password
              </h2>
            </div>
          </div>
          <div className="bg-white border border-slate-800 rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-sm">
            <p className="text-slate-600 text-center mb-6">
              Create a new password.
            </p>
            <form className="space-y-4">
              <div>
                <label htmlFor="new-password" className="text-slate-800 font-medium text-left text-sm md:text-base">New Password:</label>
                <input type="password" id="new-password" placeholder="new password" required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="text-slate-800 font-medium text-left text-sm md:text-base">Confirm Password:</label>
                <input type="password" id="confirm-password" placeholder="confirm password" required
                  className="w-full px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-900 bg-white"
                />
              </div>
              <button
                type="submit" onClick="#"
                className="w-full py-2.5 px-4 bg-[#00d8ff] hover:bg-[#00c5eb] text-white font-bold rounded-lg transition-colors cursor-pointer text-center text-sm tracking-wider"
              >
                Save New Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Auth