import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import Profile from './pages/features/profile'
import Auth from './pages/authentication/auth'
import Home from './pages/landingPage/home'
import BuyerDashboard from './pages/dashboards/buyerDashboard'
import SellerDashboard from './pages/dashboards/sellerDashboard'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-xs">
        <Link to="/" className="text-3xl font-[var(--secondary-font-family)] font-bold italic text-slate-800 hover:text-cyan-600 transition-colors">
          MarketSquare
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-slate-600 hover:text-cyan-600 font-semibold transition-colors">Home</Link>
          <Link to="/profile" className="text-slate-600 hover:text-cyan-600 font-semibold transition-colors">Profile</Link>
          <Link to="/auth" className="px-4 py-2 bg-slate-850 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-colors">Sign In</Link>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

