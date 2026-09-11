import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';

import Landing from './components/landing/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminGigs from './components/admin/AdminGigs';
import AdminProjects from './components/admin/AdminProjects';
import AdminOrders from './components/admin/AdminOrders';

import GigList from './components/gigs/GigList';
import CreateGig from './components/gigs/CreateGig';
import ProjectList from './components/projects/ProjectList';
import PostProject from './components/projects/PostProject';
import ChatRoom from './components/chat/ChatRoom';
import Wallet from './components/wallet/Wallet';
import Deposit from './components/wallet/Deposit';
import Withdraw from './components/wallet/Withdraw';
import Transfer from './components/wallet/Transfer';
import WalletSecurity from './components/wallet/WalletSecurity';
import Profile from './components/profile/Profile';
import Settings from './components/settings/Settings';
import Messages from './components/messages/Messages';

import FindWork from './components/pages/FindWork';
import HireTalent from './components/pages/HireTalent';
import WhySkillBridge from './components/pages/WhySkillBridge';
import Pricing from './components/pages/Pricing';
import Resources from './components/pages/Resources';
import About from './components/pages/About';
import HowItWorks from './components/pages/HowItWorks';
import Blog from './components/pages/Blog';
import Contact from './components/pages/Contact';
import Privacy from './components/pages/Privacy';
import Notifications from './components/pages/Notifications';

function App() {
  const theme = useSelector((s) => s.theme.mode);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  return (
    <div className={theme}>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <div className="flex min-h-screen">
          {isAuthenticated && <Sidebar />}
          <div
            className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${
              isAuthenticated ? 'md:ml-64' : ''
            }`}
          >
            <main className="flex-1 pb-6">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/find-work" element={<FindWork />} />
                <Route path="/hire-talent" element={<HireTalent />} />
                <Route path="/why-skillbridge" element={<WhySkillBridge />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />

                <Route path="/chat" element={<Navigate to="/messages" replace />} />

                {/* Protected */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/gigs" element={<ProtectedRoute><AdminGigs /></ProtectedRoute>} />
                <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />

                {/* Wallet */}
                <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/wallet/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
                <Route path="/wallet/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
                <Route path="/wallet/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
                <Route path="/wallet/security" element={<ProtectedRoute><WalletSecurity /></ProtectedRoute>} />

                {/* Gigs / Projects */}
                <Route path="/gigs" element={<ProtectedRoute><GigList /></ProtectedRoute>} />
                <Route path="/gigs/create" element={<ProtectedRoute><CreateGig /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
                <Route path="/projects/post" element={<ProtectedRoute><PostProject /></ProtectedRoute>} />

                {/* Misc */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/chat/:roomId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
        <BackToTop />
      </BrowserRouter>
    </div>
  );
}

export default App;