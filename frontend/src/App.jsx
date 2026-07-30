import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Profile from './pages/features/profile'
import Auth from './pages/authentication/auth'

const App = () => {
  return (
    <div>
      <h1 className="text-3xl font-[var(--secondary-font-family)] font-bold italic">MarketSquare</h1>
      <Router>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
