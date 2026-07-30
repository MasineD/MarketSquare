import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Profile from './pages/features/profile'
import Auth from './pages/authentication/auth'

const App = () => {
  return (
    <div>
      MarketSquare
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
