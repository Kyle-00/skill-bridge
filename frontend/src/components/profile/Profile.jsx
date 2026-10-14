import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  FaUser, FaBriefcase, FaBuilding, FaSave, FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const Profile = () => {
  const user = useSelector((state) => state.auth.user);

  const [profile, setProfile] = useState({
    first_name: '', last_name: '', username: '', email: '',
    phone_number: '', role: 'both',
  });
  const [freelancer, setFreelancer] = useState({
    title: '', overview: '', skills: [], portfolio: [],
    hourly_rate: '', availability: true,
  });
  const [client, setClient] = useState({
    company_name: '',
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [portfolioInput, setPortfolioInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, freeRes, clientRes] = await Promise.all([
          api.get('accounts/profile/'),
          api.get('accounts/profile/freelancer/').catch(() => ({ data: { skills: [], portfolio: [] } })),
          api.get('accounts/profile/client/').catch(() => ({ data: { company_name: '' } })),
        ]);
        setProfile(userRes.data);
        setFreelancer(freeRes.data);
        setClient(clientRes.data);
        setSkillsInput(freeRes.data.skills?.join(', ') || '');
        setPortfolioInput(freeRes.data.portfolio?.join(', ') || '');
      } catch {
        if (user) {
          setProfile({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            username: user.username || '',
            email: user.email || '',
            phone_number: user.phone_number || '',
            role: user.role || 'both',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const role = profile.role || 'both';
  const showFreelancer = role === 'freelancer' || role === 'both';
  const showClient = role === 'client' || role === 'both';

  // Live completion score matching backend logic
  const completion = useMemo(() => {
    let basicWeight;
    let freeWeight;
    let clientWeight;

    if (role === 'freelancer') {
      basicWeight = 10;
      freeWeight = 15;
      clientWeight = 0;
    } else if (role === 'client') {
      basicWeight = 15;
      freeWeight = 0;
      clientWeight = 40;
    } else {
      basicWeight = 10;
      freeWeight = 7.5;
      clientWeight = 30;
    }

    let score = 0;
    if (profile.first_name) score += basicWeight;
    if (profile.last_name) score += basicWeight;
    if (profile.email) score += basicWeight;
    if (profile.phone_number) score += basicWeight;

    if (showFreelancer) {
      if (freelancer.title) score += freeWeight;
      if (freelancer.overview) score += freeWeight;
      if (skillsInput) score += freeWeight;
      if (portfolioInput) score += freeWeight;
    }
    if (showClient) {
      if (client.company_name) score += clientWeight;
    }

    return Math.min(100, Math.round(score));
  }, [profile, freelancer, client, skillsInput, portfolioInput, role, showFreelancer, showClient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  const handleFreelancerChange = (e) => {
    const { name, value } = e.target;
    setFreelancer((prev) => ({ ...prev, [name]: value }));
  };
  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('accounts/profile/', profile);

      if (showFreelancer) {
        await api.put('accounts/profile/freelancer/', {
          ...freelancer,
          skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
          portfolio: portfolioInput.split(',').map((s) => s.trim()).filter(Boolean),
          hourly_rate: freelancer.hourly_rate || null,
        });
      }
      if (showClient) {
        await api.put('accounts/profile/client/', client);
      }

      setMessage('Profile updated successfully.');
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  const inputClass =
    'w-full p-3 rounded-xl border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-900/60 focus:ring-2 focus:ring-gold-400 outline-none transition';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
          {profile.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300 truncate">
            {profile.first_name || profile.username || 'My Profile'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {role === 'both' ? 'Client & Freelancer' : role}
          </p>
        </div>
      </div>

      {/* Completion Ring */}
      <div className="glass p-5 rounded-2xl shadow-lg mb-8 flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="15" fill="none" stroke="currentColor"
              className="text-gold-100 dark:text-gold-900" strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="15" fill="none" stroke="currentColor"
              className="text-gold-500 transition-all duration-700"
              strokeWidth="3"
              strokeDasharray={`${(completion / 100) * 94.2} 94.2`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gold-600 dark:text-gold-400">
              {completion}%
            </span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gold-700 dark:text-gold-300 mb-1">
            {completion === 100 ? 'Profile Complete!' : 'Complete your profile to get more work'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {completion === 100
              ? 'Your profile is fully set up. You are ready to win more clients.'
              : 'Freelancers with complete profiles win up to 5x more work.'}
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded-xl text-sm flex items-center gap-2 ${
          message.includes('success')
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {message.includes('success')
            ? <FaCheckCircle className="shrink-0" />
            : <FaExclamationCircle className="shrink-0" />}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1 - Account Info */}
        <section className="glass p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gold-200 dark:border-gold-800">
            <div className="w-9 h-9 rounded-lg bg-gold-100 dark:bg-gold-900/40 flex items-center justify-center">
              <FaUser className="text-gold-600" size={14} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">Account Information</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Basic details everyone can see</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input type="text" name="first_name" value={profile.first_name}
                onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" name="last_name" value={profile.last_name}
                onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <input type="text" name="username" value={profile.username}
                onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" value={profile.email}
                onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="tel" name="phone_number" value={profile.phone_number}
                onChange={handleChange} placeholder="2547XXXXXXXX" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <select name="role" value={profile.role} onChange={handleChange} className={inputClass}>
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 2 - Freelancer Details */}
        {showFreelancer && (
          <section className="glass p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gold-200 dark:border-gold-800">
              <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FaBriefcase className="text-green-600" size={14} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Freelancer Details</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Shown on your gigs and proposals</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Professional Title</label>
                <input type="text" name="title" value={freelancer.title || ''}
                  onChange={handleFreelancerChange}
                  placeholder="e.g. Full Stack Developer" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Overview</label>
                <textarea name="overview" value={freelancer.overview || ''}
                  onChange={handleFreelancerChange} rows="4"
                  placeholder="Tell clients about yourself, your experience and what makes you stand out..."
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Skills (comma separated)</label>
                <input type="text" value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, Django, Python, UI Design" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Portfolio Links (comma separated)</label>
                <input type="text" value={portfolioInput}
                  onChange={(e) => setPortfolioInput(e.target.value)}
                  placeholder="https://github.com/yourname, https://yourwebsite.com"
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hourly Rate (USD)</label>
                <input type="number" name="hourly_rate" value={freelancer.hourly_rate || ''}
                  onChange={handleFreelancerChange}
                  placeholder="50.00" step="0.01" className={inputClass} />
              </div>
            </div>
          </section>
        )}

        {/* Section 3 - Client Details */}
        {showClient && (
          <section className="glass p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gold-200 dark:border-gold-800">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FaBuilding className="text-blue-600" size={14} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Client Details</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Help freelancers know who they are working with</p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Company Name (optional)</label>
              <input type="text" name="company_name" value={client.company_name || ''}
                onChange={handleClientChange}
                placeholder="e.g. Acme Studios Ltd" className={inputClass} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                If you are an individual, you can leave this blank and enter your name in the "First Name" field above.
              </p>
            </div>
          </section>
        )}

        {/* Save Button */}
        <div className="sticky bottom-4 z-10">
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-4 rounded-2xl text-white font-semibold shadow-xl transition flex items-center justify-center gap-2 ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gold-600 hover:bg-gold-700 hover:shadow-2xl'
            }`}
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;