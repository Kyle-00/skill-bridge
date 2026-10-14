import { Link } from 'react-router-dom';
import { FaBook, FaVideo, FaFileAlt, FaArrowRight, FaTag } from 'react-icons/fa';
import { RESOURCES_DATA } from './resourcesData';

// Map the `icon` string from resourcesData.js to a react-icon component
const ICON_MAP = {
  book: FaBook,
  video: FaVideo,
  file: FaFileAlt,
};

const Resources = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gold-700 dark:text-gold-300 mb-4">
          Resources
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Learn, grow, and succeed with SkillBridge. Guides, tutorials, and handbooks
          for freelancers and clients.
        </p>
      </div>

      {/* Grid of articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {RESOURCES_DATA.map((article) => {
          const Icon = ICON_MAP[article.icon] || FaBook;
          return (
            <Link
              key={article.slug}
              to={`/resources/${article.slug}`}
              className="group glass p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/40 flex items-center justify-center shrink-0">
                  <Icon className="text-gold-600 text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {article.category && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                        <FaTag size={8} /> {article.category}
                      </span>
                    )}
                    {article.readTime && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        &middot; {article.readTime}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-gold-800 dark:text-gold-200 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition line-clamp-2">
                    {article.title}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 mb-4">
                {article.description}
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-gold-600 dark:text-gold-400 group-hover:gap-3 transition-all">
                Read more <FaArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Resources;