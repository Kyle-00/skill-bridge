import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useSelector } from 'react-redux';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('projects/');
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gold-600 animate-pulse">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gold-700 dark:text-gold-300">Open Projects</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gold-200 dark:border-gold-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-gold-400 outline-none w-full md:w-64"
            />
          </div>
          {isAuthenticated && (
            <Link
              to="/projects/post"
              className="bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700 transition whitespace-nowrap"
            >
              Post Project
            </Link>
          )}
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass p-8 rounded-2xl text-center text-gray-500 dark:text-gray-400">
          {search ? 'No projects match your search.' : 'No projects available yet. Be the first to post one!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="glass p-5 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 flex flex-col"
            >
              <h3 className="text-xl font-semibold text-gold-800 dark:text-gold-200 line-clamp-2">
                {project.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 flex-1 line-clamp-3">
                {project.description}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold-200 dark:border-gold-800">
                <span className="text-gold-600 font-bold">
                  ${project.budget_min} – ${project.budget_max}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-gold-100 dark:bg-gold-900 text-gold-700 dark:text-gold-300 capitalize">
                  {project.status}
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <Link
                  to={`/projects/${project.id}`}
                  className="text-sm bg-gold-600 text-white px-4 py-1.5 rounded-full hover:bg-gold-700 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;