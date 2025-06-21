import { useContext, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircle, XCircle, Loader, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeContext } from "../context/ThemeContext";

const Profile = () => {
  const { userinfo } = useContext(AuthContext);
  const fileInputRef = useRef();
  const { isDark } = useContext(ThemeContext)
  const [submissions, setSubmissions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState({ totalProblems: 0, totalSolved: 0, byTag: {} });
  const [acceptedList, setAcceptedList] = useState([]);
  const [attemptedList, setAttemptedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAcceptedSearch, setShowAcceptedSearch] = useState(false);
  const [showAttemptedSearch, setShowAttemptedSearch] = useState(false);
  const [acceptedFilter, setAcceptedFilter] = useState('');
  const [attemptedFilter, setAttemptedFilter] = useState('');

  useEffect(() => {
    if (!userinfo) return;
    setLoading(true);
    axios.post(`${import.meta.env.VITE_BACKEND_URL}/getsubmissions`, { userid: userinfo._id }, { withCredentials: true })
      .then(res => setSubmissions(res.data.submissions || []))
      .catch(() => toast.error('Failed to load submissions'))
      .finally(() => setLoading(false));
  }, [userinfo]);

  useEffect(() => {
    if (!userinfo) return;
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/problems`)
      .then(res => setProblems(res.data.problems || []))
      .catch(() => toast.error('Failed to load problems'));
  }, [userinfo]);

  useEffect(() => {
    if (!problems.length) return;
    const buckets = { easy: { total: 0, solved: 0 }, medium: { total: 0, solved: 0 }, hard: { total: 0, solved: 0 }, insane: { total: 0, solved: 0 } };
    problems.forEach(p => {
      const tag = p.tag.toLowerCase();
      buckets[tag] && buckets[tag].total++;
    });
    const enriched = submissions.map(s => {
      const prob = problems.find(p => p.problemid === s.problemid);
      return prob && { ...s, title: prob.title, tag: prob.tag.toLowerCase() };
    }).filter(Boolean);
    const accepted = enriched.filter(e => e.status === 'Accepted');
    const attempted = enriched.filter(e => e.status !== 'Accepted');
    accepted.forEach(a => buckets[a.tag] && buckets[a.tag].solved++);
    setStats({ totalProblems: problems.length, totalSolved: accepted.length, byTag: buckets });
    setAcceptedList(accepted);
    setAttemptedList(attempted);
  }, [problems, submissions]);

  const editAvatar = () => fileInputRef.current?.click();
  const handleFileChange = async e => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', userinfo._id);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/profile/avatar`, formData, { withCredentials: true });
      if (res.data.success) {
        toast.success('Avatar updated!');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch {
      toast.error('Avatar update failed');
    }
  };

  const filterList = (list, q) => {
  const f = q.trim().toLowerCase();
  if (!f) return list;
  return list.filter(item =>
    item.title.toLowerCase().includes(f) ||
    String(item.problemid).includes(f) ||
    item.tag.toLowerCase().includes(f)
  );
};

useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest('.accepted-search')) setShowAcceptedSearch(false);
    if (!e.target.closest('.attempted-search')) setShowAttemptedSearch(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowAcceptedSearch(false);
      setShowAttemptedSearch(false);
    }
  };

  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleKeyDown);
  };
}, []);

  return (
    <>
      <div className="font-sans bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
    <Navbar />
    <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative max-w-4xl mx-auto mt-16 p-6 rounded-2xl shadow-xl 
                 bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20"
    >
      {/* Profile Card */}
      <div className="flex items-center space-x-6 mb-8">
        <div className="relative">
          <img
            className="w-28 h-28 rounded-full object-cover shadow-lg ring-2 ring-white/40 dark:ring-white/20"
            src={`${import.meta.env.VITE_BACKEND_URL}${userinfo?.avatar_path}`}
            alt="Profile"
          />
          <div
            onClick={editAvatar}
            className="cursor-pointer absolute bottom-1 right-2 bg-white dark:bg-gray-700 rounded-full p-1 border border-gray-200 dark:border-gray-600 shadow"
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-gray-700"
                fill="none"
                viewBox="0 0 512 512"
                stroke="currentColor"
              >
                <path
                  fill={isDark ? "#dddddd" : "#000000"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1 0 32c0 8.8 7.2 16 16 16l32 0zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"
                />
              </svg>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Hey, {userinfo?.username}!</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {userinfo?.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <div className="p-4 rounded-lg text-center 
                        bg-indigo-50 dark:bg-indigo-900/30 
                        shadow border border-indigo-200/40 dark:border-indigo-500/20">
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            Total Solved
          </p>
          <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
            {stats.totalSolved} / {stats.totalProblems}
          </p>
        </div>

        <motion.div
          className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Object.entries(stats.byTag).map(([tag, v]) => (
            <div
              key={tag}
              className="p-3 rounded-lg text-center transition transform hover:scale-105
                         bg-white/60 dark:bg-white/10 backdrop-blur-md 
                         shadow border border-white/20"
            >
              <p className="text-sm capitalize text-gray-600 dark:text-gray-300">
                {tag}
              </p>
              <p className="text-lg font-medium text-gray-800 dark:text-white">
                {v.solved} / {v.total}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

        {/* Submission Lists */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader className="animate-spin h-8 w-8 text-gray-400 dark:text-gray-300" />
          </div>
        ) : (
          <>
            <section className="mb-8">
              <div className="flex items-center">
                <h3 className="text-xl font-semibold flex-grow flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="mr-2" /> Accepted
                </h3>
                <div className="relative accepted-search">
                  <button
                    onClick={() => setShowAcceptedSearch((prev) => !prev)}
                    className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full"
                  >
                    <Search className="h-4 w-4 text-gray-600" />
                  </button>
                  {showAcceptedSearch && (
                    <motion.input
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 160, opacity: 1 }}
                      className="absolute right-0 top-0 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-8 text-xs text-gray-700 dark:text-gray-200 focus:outline-none"
                      placeholder="Filter accepted"
                      value={acceptedFilter}
                      onChange={(e) => setAcceptedFilter(e.target.value)}
                    />
                  )}
                </div>
              </div>
              {filterList(acceptedList, acceptedFilter).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No accepted submissions.</p>
              ) : (
                <ul className="space-y-2 mt-2">
                  {filterList(acceptedList, acceptedFilter).map((s) => (
                    <Link key={s.id} to={`/problems/${s.problemid}`}>
                      <motion.li
                        className="p-2 rounded-lg hover:bg-green-100 transition mx-1 mb-2 bg-green-50 dark:bg-green-900/20 dark:hover:bg-green-900/30 border border-green-200/50 dark:border-green-400/20"
                        whileHover={{ x: 3 }}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{s.title}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-300">
                            #{s.problemid}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.tag}</p>
                      </motion.li>
                    </Link>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <div className="flex items-center">
                <h3 className="text-xl font-semibold flex-grow flex items-center text-yellow-600 dark:text-yellow-400">
                  <XCircle className="mr-2" /> Attempted
                </h3>
                <div className="relative attempted-search">
                  <button
                    onClick={() => setShowAttemptedSearch((prev) => !prev)}
                    className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full"
                  >
                    <Search className="h-4 w-4 text-gray-600" />
                  </button>
                  {showAttemptedSearch && (
                    <motion.input
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 160, opacity: 1 }}
                      className="absolute right-0 top-0 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-8 text-xs text-gray-700 dark:text-gray-200 focus:outline-none"
                      placeholder="Filter attempted"
                      value={attemptedFilter}
                      onChange={(e) => setAttemptedFilter(e.target.value)}
                    />
                  )}
                </div>
              </div>
              {filterList(attemptedList, attemptedFilter).length === 0 ? (
                <p className="text-gray-500">No attempted submissions.</p>
              ) : (
                <ul className="space-y-2 mt-2">
                  {filterList(attemptedList, attemptedFilter).map((s) => (
                    <Link key={s.id} to={`/problems/${s.problemid}`}>
                      <motion.li
                        className="p-2 rounded-lg hover:bg-yellow-100 transition bg-yellow-50 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 border border-yellow-200/50 dark:border-yellow-400/20"
                        whileHover={{ x: 3 }}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{s.title}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-300">
                            #{s.problemid}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.tag}</p>
                      </motion.li>
                    </Link>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </motion.div>
      </div>
    </>
  );
};

export default Profile;
