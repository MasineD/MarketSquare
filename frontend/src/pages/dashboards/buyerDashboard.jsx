// ============ Buyer Dashboard Page================
import React from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:5000'; // Set the base URL for axios requests
axios.defaults.withCredentials = true; // Ensure cookies are sent with requests

const BuyerDashboard = () => {
  const navigate = useNavigate();

  // Function to handle sign-out action
  const handleSignOut = async () => {
    try {
      await axios.post('/auth/sign-out');
      navigate('/auth');
    } catch (error) {
      console.error('Error occurred while signing out:', error);
    }
  };

  return (
    <div>
      This is the buyer dashboard page. It is currently under construction. Please check back later for updates!
      <button type='button' onClick={handleSignOut} className="py-2.5 px-4 bg-[#00d8ff] hover:bg-[#00c5eb] text-white font-bold rounded-lg transition-colors cursor-pointer text-center text-sm tracking-wider">
        Sign Out
      </button>
    </div>
  )
}

export default BuyerDashboard
