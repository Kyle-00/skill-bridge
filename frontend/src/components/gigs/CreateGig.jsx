import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { FaInfoCircle, FaDollarSign, FaClock, FaTags, FaCheckCircle } from 'react-icons/fa';

const CreateGig = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    delivery_days: 3,
    revisions: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!form.title || !form.description || !form.category || !form.price) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('gigs/', {
        ...form,
        price: parseFloat(form.price),
        delivery_days: parseInt(form.delivery_days),
        revisions: parseInt(form.revisions),
      });
      setSuccess(true);
      setTimeout(() => navigate('/gigs'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create gig. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 text-center">
        <div className="glass p-12 rounded-3xl shadow-xl">
          <div className="text-6xl text-gold-500 mb-4 flex justify-center">
            <FaCheckCircle />
          </div>
          <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300">
            Gig Created Successfully
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Redirecting to your gigs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <div className="glass p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-bold text-gold-700 dark:text-gold-300">Create a Gig</h2>
          <span className="text-xs bg-gold-100 dark:bg-gold-900/50 text-gold-700 dark:text-gold-300 px-3 py-1 rounded-full">
            New
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Describe the service you want to offer and set your price.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gig Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
              placeholder="e.g., Build a Professional E-commerce Website"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <FaInfoCircle /> Use a clear, specific title that describes your service.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
              placeholder="Describe your service in detail. What will you deliver? What makes you stand out?"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={form.subcategory}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
                placeholder="e.g., React, Shopify, WordPress"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <FaDollarSign className="text-gold-500" /> Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
                placeholder="49.99"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <FaClock className="text-gold-500" /> Delivery Days <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="delivery_days"
                value={form.delivery_days}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <FaTags className="text-gold-500" /> Number of Revisions
            </label>
            <input
              type="number"
              name="revisions"
              value={form.revisions}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none"
              placeholder="1"
              min="0"
              max="10"
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
              {submitting ? 'Creating...' : 'Create Gig'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/gigs')}
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

export default CreateGig;