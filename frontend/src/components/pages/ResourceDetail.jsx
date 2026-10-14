import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaClock, FaTag } from 'react-icons/fa';
import { getResourceBySlug } from './resourcesData';

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = getResourceBySlug(id);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Article not found.
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The article you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/resources"
          className="inline-block bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 font-semibold"
        >
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/resources')}
        className="flex items-center gap-2 text-sm text-gold-600 hover:underline mb-6"
      >
        <FaArrowLeft /> Back to Resources
      </button>

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gold-700 dark:text-gold-300 bg-gold-100 dark:bg-gold-900/40 px-3 py-1 rounded-full">
            <FaTag size={9} /> {article.category}
          </span>
          {article.readTime && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <FaClock size={10} /> {article.readTime}
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gold-700 dark:text-gold-300 leading-tight mb-3">
          {article.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {article.description}
        </p>
      </div>

      {/* Video embed */}
      {article.videoUrl && (
        <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl aspect-video bg-black">
          <iframe
            src={article.videoUrl}
            title={article.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {/* Content blocks */}
      <article className="prose prose-lg max-w-none dark:prose-invert">
        {article.content.map((block, idx) => (
          <ContentBlock key={idx} block={block} />
        ))}
      </article>

      {/* Footer CTA */}
      <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-gold-50 to-white dark:from-gold-950/30 dark:to-black border border-gold-200 dark:border-gold-800 text-center">
        <h3 className="text-xl font-bold text-gold-700 dark:text-gold-300 mb-2">
          Ready to put this into practice?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          Head back to your dashboard and start winning work today.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 font-semibold transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Content block renderer
// ---------------------------------------------------------------------------
const ContentBlock = ({ block }) => {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">
          {block.text}
        </h2>
      );

    case 'subheading':
      return (
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-3">
          {block.text}
        </h3>
      );

    case 'paragraph':
      return (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
          {block.text}
        </p>
      );

    case 'list':
      return (
        <ul className="list-disc pl-6 mb-5 space-y-2 text-gray-700 dark:text-gray-300">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );

    case 'numbered':
      return (
        <ol className="list-decimal pl-6 mb-5 space-y-2 text-gray-700 dark:text-gray-300">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ol>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-gold-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
          {block.text}
        </blockquote>
      );

    case 'callout': {
      const variants = {
        tip: {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          title: 'text-green-800 dark:text-green-300',
          text: 'text-green-700 dark:text-green-400',
        },
        warning: {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          title: 'text-red-800 dark:text-red-300',
          text: 'text-red-700 dark:text-red-400',
        },
        info: {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          title: 'text-blue-800 dark:text-blue-300',
          text: 'text-blue-700 dark:text-blue-400',
        },
      };
      const v = variants[block.variant] || variants.info;
      return (
        <div className={`${v.bg} border ${v.border} rounded-xl p-5 my-6`}>
          {block.title && (
            <h4 className={`font-bold ${v.title} mb-1`}>{block.title}</h4>
          )}
          <p className={`text-sm ${v.text} leading-relaxed`}>{block.text}</p>
        </div>
      );
    }

    default:
      return null;
  }
};

export default ResourceDetail;