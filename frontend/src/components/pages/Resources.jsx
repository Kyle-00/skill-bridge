import { FaBook, FaVideo, FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa';

const Resources = () => {
  const resources = [
    { icon: FaBook, title: 'How to Write the Perfect Proposal', desc: 'A guide to winning your first gigs.', link: '#' },
    { icon: FaVideo, title: 'Video Tutorial: Getting Started', desc: 'Walkthrough of the platform.', link: '#' },
    { icon: FaFileAlt, title: 'Freelancer Tax Guide', desc: 'Understand your tax obligations.', link: '#' },
    { icon: FaBook, title: 'Client Handbook: Hiring Right', desc: 'How to evaluate and hire top talent.', link: '#' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gold-700 dark:text-gold-300 text-center mb-4">Resources</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
        Learn, grow, and succeed with SkillBridge.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {resources.map((item, i) => (
          <div key={i} className="glass p-6 rounded-2xl shadow-lg flex gap-4 items-start hover:shadow-xl transition">
            <div className="text-3xl text-gold-500 shrink-0"><item.icon /></div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gold-800 dark:text-gold-200">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
              <a href={item.link} className="inline-flex items-center gap-1 text-gold-600 hover:underline text-sm mt-2">
                Read more <FaExternalLinkAlt size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Resources;