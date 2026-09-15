import { Link } from 'react-router-dom';
import { FaBook, FaVideo, FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { RESOURCES_DATA } from './resourcesData';

const iconMap = {
  book: FaBook,
  video: FaVideo,
  file: FaFileAlt,
};

const Resources = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gold-700 dark:text-gold-300 text-center mb-4">
        Resources
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
        Learn, grow, and succeed with SkillBridge.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {RESOURCES_DATA.map((item) => {
          const Icon = iconMap[item.icon] || FaBook;
          return (
            <div
              key={item.slug}
              className="glass p-6 rounded-2xl shadow-lg flex gap-4 items-start hover:shadow-xl transition"
            >
              <div className="text-3xl text-gold-500 shrink-0">
                <Icon />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gold-800 dark:text-gold-200">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                <Link
                  to={`/resources/${item.slug}`}
                  className="inline-flex items-center gap-1 text-gold-600 hover:underline text-sm mt-2"
                >
                  Read more <FaExternalLinkAlt size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Resources;