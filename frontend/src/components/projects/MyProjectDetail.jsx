import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const MyProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const [projRes, propRes] = await Promise.all([
          api.get(`projects/${id}/`),
          api.get(`projects/${id}/proposals-list/`),
        ]);
        if (!cancelled) {
          setProject(projRes.data);
          setProposals(propRes.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail || 'Failed to load.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [id]);

  const handleAccept = async (proposalId) => {
    if (!window.confirm('Accept this proposal and create an order? Other proposals will be rejected.')) return;
    setAccepting(proposalId);
    setError('');
    try {
      const res = await api.post(`projects/${id}/accept-proposal/`, {
        proposal_id: proposalId,
      });
      navigate(`/orders/${res.data.order_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept proposal.');
      setAccepting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Project not found.'}</p>
        <button
          onClick={() => navigate('/projects/mine')}
          className="bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700"
        >
          Back to My Projects
        </button>
      </div>
    );
  }

  const statusBadge = (s) => ({
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    accepted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }[s] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300');

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/projects/mine')}
        className="flex items-center gap-2 text-sm text-gold-600 hover:underline mb-4"
      >
        <FaArrowLeft /> Back to My Projects
      </button>

      <div className="glass p-6 rounded-2xl shadow-lg mb-6">
        <div className="flex justify-between items-start gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
              {project.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {project.category} / Budget ${project.budget_min}-${project.budget_max}
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full capitalize ${
            project.status === 'open'
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
              : project.status === 'in_progress'
              ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
        <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {project.description}
        </p>
      </div>

      <h2 className="text-xl font-semibold text-gold-700 dark:text-gold-300 mb-4">
        Proposals ({proposals.length})
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="glass p-8 rounded-2xl text-center text-gray-500 dark:text-gray-400">
          No proposals yet. Freelancers will appear here once they bid.
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => (
            <div key={p.id} className="glass p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold shrink-0">
                    {p.freelancer?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {p.freelancer?.first_name && p.freelancer?.last_name
                        ? `${p.freelancer.first_name} ${p.freelancer.last_name}`
                        : p.freelancer?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{p.freelancer?.username}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusBadge(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {p.cover_letter}
              </p>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gold-200 dark:border-gold-800 flex-wrap gap-3">
                <div className="text-sm">
                  <span className="font-bold text-gold-600 dark:text-gold-400">
                    ${p.proposed_price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-3">
                    {p.estimated_days} days
                  </span>
                </div>

                {p.status === 'pending' && project.status === 'open' && (
                  <button
                    onClick={() => handleAccept(p.id)}
                    disabled={accepting === p.id}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white font-semibold transition ${
                      accepting === p.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <FaCheckCircle size={14} />
                    {accepting === p.id ? 'Accepting...' : 'Accept Proposal'}
                  </button>
                )}
                {p.status === 'rejected' && (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <FaTimesCircle size={12} /> Rejected
                  </span>
                )}
                {p.status === 'accepted' && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <FaCheckCircle size={12} /> Accepted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjectDetail;