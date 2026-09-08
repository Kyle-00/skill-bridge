import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout & Common
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth & Landing
import Landing from './components/landing/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard
import Dashboard from './components/dashboard/Dashboard';

// Gigs
import GigList from './components/gigs/GigList';
import CreateGig from './components/gigs/CreateGig';

// Projects
import ProjectList from './components/projects/ProjectList';
import PostProject from './components/projects/PostProject';

// Chat
import ChatRoom from './components/chat/ChatRoom';

// Pages (Navbar links)
import FindWork from './components/pages/FindWork';
import HireTalent from './components/pages/HireTalent';
import WhySkillBridge from './components/pages/WhySkillBridge';
import Pricing from './components/pages/Pricing';
import Resources from './components/pages/Resources';
import About from './components/pages/About';

function App() {
  const theme = useSelector((state) => state.theme.mode);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div className={theme}>
      <BrowserRouter>
        <Navbar />
        {isAuthenticated && <Sidebar />}
        <main
          className={`min-h-screen pt-16 transition-all duration-300 ${
            isAuthenticated ? 'md:pl-64' : ''
          }`}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Navbar Pages */}
            <Route path="/find-work" element={<FindWork />} />
            <Route path="/hire-talent" element={<HireTalent />} />
            <Route path="/why-skillbridge" element={<WhySkillBridge />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gigs"
              element={
                <ProtectedRoute>
                  <GigList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gigs/create"
              element={
                <ProtectedRoute>
                  <CreateGig />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/post"
              element={
                <ProtectedRoute>
                  <PostProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:roomId"
              element={
                <ProtectedRoute>
                  <ChatRoom />
                </ProtectedRoute>
              }
            />
            {/* You can add more protected routes here */}
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;