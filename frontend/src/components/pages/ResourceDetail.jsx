import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { RESOURCES_DATA } from './resourcesData';

const ResourceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = RESOURCES_DATA.find((r) => r.slug === slug);

  if (!article) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">Article not found.</p>
        <Link
          to="/resources"
          className="bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700 inline-block"
        >
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/resources')}
        className="flex items-center gap-2 text-sm text-gold-600 hover:underline mb-6"
      >
        <FaArrowLeft /> Back to Resources
      </button>

      <article className="glass p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gold-700 dark:text-gold-300 mb-2">
          {article.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{article.desc}</p>

        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
          {article.body.trim()}
        </div>
      </article>
    </div>
  );
};

export default ResourceDetail;