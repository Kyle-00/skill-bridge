import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { Link } from 'react-router-dom';

const GigList = () => {
  const [gigs, setGigs] = useState([]);
  useEffect(() => {
    api.get('gigs/').then(res => setGigs(res.data));
  }, []);
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300 mb-4">Available Gigs</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gigs.map(gig => (
          <div key={gig.id} className="glass p-4 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold text-gold-800 dark:text-gold-200">{gig.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{gig.description}</p>
            <p className="text-gold-600 font-bold">${gig.price}</p>
            <Link to={`/gigs/${gig.id}`} className="text-gold-600 hover:underline">View</Link>
          </div>
        ))}
      </div>
    </div>
  );
};
export default GigList;