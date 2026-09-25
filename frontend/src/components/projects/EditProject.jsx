import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
  FaDollarSign, FaCalendar, FaCheckCircle, FaArrowLeft,
} from 'react-icons/fa';

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Design & Creative',
  'Writing & Translation',
  'Sales & Marketing',
  'Admin & Support',
  'Finance & Accounting',
  'Legal',
  'HR & Training',
  'Engineering & Architecture',
];

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api.get(`projects/${id}/`)
      .then((res) => {
        if (cancelled) return;
        const p = res.data;
        setForm({
          title: p.title || '',
          description: p.description || '',
          category: p.category || '',
          budget_min: String(p.budget_min ?? ''),
          budget_max: String(p.budget_max ?? ''),
          deadline: p.deadline || '',
        });
      })
      .catch(() => {
        if (!cancelled) setError('Could not load project.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.patch(`projects/${id}/`, {
        ...form,
        budget_min: parseFloat(form.budget_min),
        budget_max: parseFloat(form.budget_max),
      });
      setSuccess(true);
      setTimeout(() => navigate('/projects/mine'), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update project.');
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

  if (!form) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">
          {error || 'Project not found.'}
        </p>
        <button
          onClick={() => navigate('/projects/mine')}
          className="bg-gold-600 text-white px-6 py-2 rounded-lg"
        >
          Back to My Projects
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 text-center">
        <div className="glass p-12 rounded-3xl shadow-xl">
          <div className="text-6xl text-gold-500 mb-4 flex justify-center">
            <FaCheckCircle />
          </div>
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
            Project Updated
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Redirecting to My Projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <button
        onClick={() => navigate('/projects/mine')}
        className="flex items-center gap-2 text-sm text-gold-600 hover:underline mb-4"
      >
        <FaArrowLeft /> Back to My Projects
      </button>

      <div className="glass p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-bold text-gold-700 dark:text-gold-300">
            Edit Project
          </h2>
          <span className="text-xs bg-gold-100 dark:bg-gold-900/50 text-gold-700 dark:text-gold-300 px-3 py-1 rounded-full">
            Editing
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              required
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaDollarSign className="text-gold-500" /> Budget Min <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="budget_min"
                value={form.budget_min}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaDollarSign className="text-gold-500" /> Budget Max <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="budget_max"
                value={form.budget_max}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FaCalendar className="text-gold-500" /> Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-3 rounded-lg text-white font-semibold transition ${
                submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gold-600 hover:bg-gold-700'
              }`}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/projects/mine')}
              className="px-6 py-3 rounded-lg border border-gold-600 text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-900/30 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;