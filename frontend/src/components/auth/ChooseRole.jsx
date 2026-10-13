import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { setCredentials } from '../../store/authSlice';

const ROLES = [
  {
    value: 'client',
    title: 'Client',
    desc: 'I want to hire freelancers and manage projects.',
  },
  {
    value: 'freelancer',
    title: 'Freelancer',
    desc: 'I want to offer my skills and find work.',
  },
  {
    value: 'both',
    title: 'Both',
    desc: 'I want to hire and work — I do both.',
  },
];

const ChooseRole = () => {
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, refresh } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setError('Please choose an account type.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('accounts/choose-role/', { role: selected });
      dispatch(setCredentials({
        user: res.data,
        token,
        refresh,
      }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Choose your account type
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Hi {user?.first_name || 'there'}! How do you want to use SkillBridge?
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setSelected(r.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition ${
                selected === r.value
                  ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gold-300'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">
                {r.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {r.desc}
              </div>
            </button>
          ))}

          <button
            type="submit"
            disabled={loading || !selected}
            className="w-full bg-gold-600 hover:bg-gold-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-6"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChooseRole;