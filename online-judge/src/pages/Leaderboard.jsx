// src/pages/Leaderboard.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import CursorNetBackground from "../components/Cursornetbackground";
import bgImage from "../assets/5166950.jpg";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, when: "beforeChildren", staggerChildren: 0.1 } }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/leaderboard`);
        setLeaderboard(response.data.leaderboard || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    };
    fetchLeaderboard();
  }, []);

  // Compute sorted leaderboard and assign ranks, handling ties
  const processedLeaderboard = () => {
  const list = [...leaderboard].sort(
    (a, b) => b.problemsSolved - a.problemsSolved
  );

  let denseRank = 1;
  let prevSolved = null;

  return list.map((user, idx) => {
    if (idx > 0 && user.problemsSolved !== prevSolved) {
      denseRank += 1;
    }
    prevSolved = user.problemsSolved;
    return { ...user, rank: denseRank };
  });
};

  const rankedList = processedLeaderboard();

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Award className="w-5 h-5 text-yellow-400" title="Gold" />;
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" title="Silver" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" title="Bronze" />;
    return <span className="text-white">{rank}</span>;
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden text-white">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -20 }}
      />
      <CursorNetBackground />
      {/* Dark overlay for contrast */}
      <div className="relative z-10 flex flex-col">
        {/* Navbar */}
        <div className="backdrop-blur-md bg-white/10 shadow-sm z-20">
          <Navbar />
        </div>
      {/* Navbar */}
      </div>
      {/* Content */}
      <motion.div className="relative z-10 flex flex-col items-center w-full px-4 py-8">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
        >
          Leaderboard
        </motion.h1>
        <motion.p
          className="text-center text-gray-200 mb-6 max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6 } }}
        >
          Check out the top performers! Ranks are assigned, and ties share the same position.
        </motion.p>
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Problems Solved
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {rankedList.map((user) => (
                <motion.tr
                  key={user.username}
                  className="hover:bg-white/20"
                  variants={rowVariants}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white flex items-center">
                    {user.rank === 1 && (
                      <Award className="w-5 h-5 text-yellow-400" title="Gold" />
                    )}
                    {user.rank === 2 && (
                      <Award className="w-5 h-5 text-gray-400" title="Silver" />
                    )}
                    {user.rank === 3 && (
                      <Award className="w-5 h-5 text-orange-400" title="Bronze" />
                    )}
                    {user.rank > 3 && <span className="ml-1">{user.rank}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                    {user.problemsSolved}
                  </td>
                </motion.tr>
              ))}
              {rankedList.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-300">
                    No entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
