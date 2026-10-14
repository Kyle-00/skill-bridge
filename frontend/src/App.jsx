import { useEffect } from 'react';
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
import ChooseRole from './components/auth/ChooseRole';

import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';

import AdminUsers from './components/admin/AdminUsers';
import AdminGigs from './components/admin/AdminGigs';
import AdminProjects from './components/admin/AdminProjects';
import AdminOrders from './components/admin/AdminOrders';
import AdminDisputes from './components/admin/AdminDisputes';

import GigList from './components/gigs/GigList';
import GigDetail from './components/gigs/GigDetail';
import CreateGig from './components/gigs/CreateGig';
import EditGig from './components/gigs/EditGig';

import ProjectList from './components/projects/ProjectList';
import ProjectDetail from './components/projects/ProjectDetail';
import MyProjectDetail from './components/projects/MyProjectDetail';
import PostProject from './components/projects/PostProject';
import EditProject from './components/projects/EditProject';

import Orders from './components/orders/Orders';
import OrderDetail from './components/orders/OrderDetail';

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
import PlanCheckout from './components/pages/PlanCheckout';
import Resources from './components/pages/Resources';
import ResourceDetail from './components/pages/ResourceDetail';
import About from './components/pages/About';
import HowItWorks from './components/pages/HowItWorks';
import Blog from './components/pages/Blog';
import Contact from './components/pages/Contact';
import Privacy from './components/pages/Privacy';
import Notifications from './components/pages/Notifications';

function App() {
  const theme = useSelector((s) => s.theme.mode);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <BackToTop />
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col">
        <Navbar />
        <Sidebar />
        <main className="flex-1 pt-16">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/choose-role" element={<ChooseRole />} />

            {/* Gigs */}
            <Route path="/gigs" element={<GigList />} />
            <Route path="/gigs/:id" element={<GigDetail />} />

            {/* Projects */}
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />

            {/* Hire Talent (both paths point to the same component) */}
            <Route path="/hire-talent" element={<HireTalent />} />
            <Route path="/freelancers" element={<HireTalent />} />

            {/* Static / informational pages */}
            <Route path="/why-skillbridge" element={<WhySkillBridge />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/pricing/:plan/checkout" element={<PlanCheckout />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<ResourceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/find-work" element={<ProtectedRoute><FindWork /></ProtectedRoute>} />
            <Route path="/create-gig" element={<ProtectedRoute><CreateGig /></ProtectedRoute>} />
            <Route path="/gigs/mine" element={<ProtectedRoute><GigList mine={true} /></ProtectedRoute>} />
            <Route path="/gigs/:id/edit" element={<ProtectedRoute><EditGig /></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute><PostProject /></ProtectedRoute>} />
            <Route path="/projects/:id/edit" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
            <Route path="/my-projects" element={<ProtectedRoute><ProjectList mine={true} /></ProtectedRoute>} />
            <Route path="/my-projects/:id" element={<ProtectedRoute><MyProjectDetail /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/chat/:roomId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/wallet/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/wallet/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="/wallet/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
            <Route path="/wallet/security" element={<ProtectedRoute><WalletSecurity /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/gigs" element={<ProtectedRoute><AdminGigs /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/disputes" element={<ProtectedRoute><AdminDisputes /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;