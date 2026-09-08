import { useState } from 'react';
import api from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const CreateGig = () => {
  const [form, setForm] = useState({ title: '', description: '', category: '', price: '', delivery_days: 3 });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('gigs/', form);
    navigate('/gigs');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 glass p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-gold-700 dark:text-gold-300 mb-6">Create a Gig</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white dark:bg-gray-800" required />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white dark:bg-gray-800" />
        <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white dark:bg-gray-800" required />
        <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white dark:bg-gray-800" required />
        <input type="number" placeholder="Delivery Days" value={form.delivery_days} onChange={e => setForm({...form, delivery_days: e.target.value})} className="w-full p-3 rounded-lg border border-gold-200 dark:border-gold-700 bg-white dark:bg-gray-800" required />
        <button type="submit" className="w-full bg-gold-600 text-white py-3 rounded-lg hover:bg-gold-700">Create Gig</button>
      </form>
    </div>
  );
};
export default CreateGig;