import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaClock, FaSync, FaArrowLeft } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.get(`gigs/${id}/`)
      .then((res) => { if (!cancelled) setGig(res.data); })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.detail || 'Gig not found.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleBuyNow = async () => {
    setBuying(true);
    setBuyError('');
    try {
      const res = await api.post('orders/buy-gig/', { gig_id: gig.id });
      const orderId = res.data.order.id;
      navigate(`/orders/${orderId}`);
    } catch (err) {
      setBuyError(err.response?.data?.error || 'Could not create order.');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Gig not found.'}</p>
        <button onClick={() => navigate('/gigs')} className="bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700">
          Back to Gigs
        </button>
      </div>
    );
  }

  const isOwner = user?.id === gig.freelancer;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gold-600 hover:underline mb-4">
        <FaArrowLeft /> Back
      </button>

      <div className="glass p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-700 dark:text-gold-300">
            {gig.title}
          </h1>
          {isOwner && (
            <span className="text-xs px-3 py-1 bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 rounded-full">
              Your gig
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {gig.category}{gig.subcategory ? ` / ${gig.subcategory}` : ''}
        </p>

        <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {gig.description}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gold-50/50 dark:bg-gold-950/20 rounded-xl">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
            <p className="text-xl font-bold text-gold-600 dark:text-gold-400">${gig.price}</p>
          </div>
          <div className="text-center border-x border-gold-200 dark:border-gold-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              <FaClock className="inline mr-1" size={10} /> Delivery
            </p>
            <p className="text-xl font-bold text-gray-700 dark:text-gray-300">{gig.delivery_days} days</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              <FaSync className="inline mr-1" size={10} /> Revisions
            </p>
            <p className="text-xl font-bold text-gray-700 dark:text-gray-300">{gig.revisions}</p>
          </div>
        </div>

        {buyError && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {buyError}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gold-200 dark:border-gold-800">
          {isOwner ? (
            <Link to="/gigs/mine" className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 transition">
              Manage this gig in My Gigs
            </Link>
          ) : (
            <button
              onClick={handleBuyNow}
              disabled={buying}
              className={`w-full py-4 rounded-lg text-white font-semibold transition ${
                buying ? 'bg-gray-400 cursor-not-allowed' : 'bg-gold-600 hover:bg-gold-700'
              }`}
            >
              {buying ? 'Creating order...' : `Buy Now for $${gig.price}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetail;