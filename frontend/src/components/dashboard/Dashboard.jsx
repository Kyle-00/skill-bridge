import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import ClientDashboard from './ClientDashboard';
import FreelancerDashboard from './FreelancerDashboard';
import BothDashboard from './BothDashboard';

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);

  if (!user) return <Navigate to="/login" replace />;

  // Superuser → admin dashboard (handled by route)
  if (user.is_superuser) return <Navigate to="/admin" replace />;

  // Role-based dashboards
  if (user.role === 'client') return <ClientDashboard />;
  if (user.role === 'freelancer') return <FreelancerDashboard />;
  return <BothDashboard />;
};

export default Dashboard;