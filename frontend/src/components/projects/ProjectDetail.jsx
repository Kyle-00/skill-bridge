import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCalendar, FaArrowLeft, FaDollarSign, FaClock } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [proposal, setProposal] = useState({
    cover_letter: '',
    proposed_price: '',
    estimated_days: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api.get(`projects/${id}/`)
      .then((res) => { if (!cancelled) setProject(res.data); })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.detail || 'Project not found.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('projects/proposals/', {
        project: parseInt(id),
        cover_letter: proposal.cover_letter,
        proposed_price: parseFloat(proposal.proposed_price),
        estimated_days: parseInt(proposal.estimated_days),
      });
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.project?.[0] ||
        data?.error ||
        data?.detail ||
        'Failed to submit proposal.';
      setError(msg);
    } finally {
      setSubmitting(false);
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
        <p className="text-red-600 dark:text-red-400 mb-4">
          {error || 'Project not found.'}
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const isOwner = user?.id === project.client;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gold-600 hover:underline mb-4"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="glass p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300">
            {project.title}
          </h1>
          <span
            className={`text-xs px-3 py-1 rounded-full capitalize ${
              project.status === 'open'
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                : project.status === 'in_progress'
                ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {project.status.replace('_', ' ')}
          </span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {project.category}
        </p>

        <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {project.description}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gold-50/50 dark:bg-gold-950/20 rounded-xl">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              <FaDollarSign className="inline mr-1" size={10} /> Budget
            </p>
            <p className="text-base font-bold text-gold-600 dark:text-gold-400">
              ${project.budget_min}-${project.budget_max}
            </p>
          </div>
          <div className="text-center border-x border-gold-200 dark:border-gold-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              <FaCalendar className="inline mr-1" size={10} /> Deadline
            </p>
            <p className="text-base font-bold text-gray-700 dark:text-gray-300">
              {new Date(project.deadline).toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              <FaClock className="inline mr-1" size={10} /> Posted
            </p>
            <p className="text-base font-bold text-gray-700 dark:text-gray-300">
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {isOwner ? (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200 flex items-center justify-between flex-wrap gap-3">
            <span>This is your project.</span>
            <button
              onClick={() => navigate(`/projects/${project.id}/manage`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              Manage Proposals
            </button>
          </div>
        ) : project.status !== 'open' ? (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
            This project is no longer accepting proposals.
          </div>
        ) : submitted ? (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-semibold">
              Proposal submitted.
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              The client will review your bid.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 pt-6 border-t border-gold-200 dark:border-gold-800 space-y-4"
          >
            <h3 className="font-semibold text-gold-700 dark:text-gold-300">
              Submit Your Proposal
            </h3>

            <textarea
              value={proposal.cover_letter}
              onChange={(e) =>
                setProposal({ ...proposal, cover_letter: e.target.value })
              }
              placeholder="Why are you a good fit for this project?"
              rows="4"
              required
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={proposal.proposed_price}
                onChange={(e) =>
                  setProposal({ ...proposal, proposed_price: e.target.value })
                }
                placeholder="Your price ($)"
                min="1"
                step="0.01"
                required
                className="p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400"
              />
              <input
                type="number"
                value={proposal.estimated_days}
                onChange={(e) =>
                  setProposal({ ...proposal, estimated_days: e.target.value })
                }
                placeholder="Days to complete"
                min="1"
                required
                className="p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gold-600 hover:bg-gold-700'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;