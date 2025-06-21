import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { toast, ToastContainer } from "react-toastify";

const Navbar = () => {
  const { userinfo, isAdmin } = useContext(AuthContext);
  const {isDark, toggleTheme } = useContext(ThemeContext)
  const location = useLocation();
  const path = location.pathname;

  // Identify home and leaderboard as “special” pages
  const isHome = path === "/";
  const isLeaderboard = path.startsWith("/leaderboard");
  const isSpecial = isHome || isLeaderboard;

  // Theme state
  
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/logout`,
        {},
        { withCredentials: true }
      );
      toast.success(response.data.message || 'Logged Out Successfully!');
      setTimeout(() => {
          window.location.href = '/';
        }, 1200);
    } catch {
      toast.error(err.response.data.message);
    }
  };

  const isActive = route =>
    route === "/" ? path === "/" : path === route || path.startsWith(route + "/");

  // Classes
  const titleClass = isSpecial
    ? "font-serif text-3xl font-extrabold text-teal-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)] drop-shadow-[0_0_14px_rgba(0,255,255,0.4)]"
    : "font-serif text-2xl font-medium text-black dark:text-white";
  const linkTextBase = isSpecial
    ? "text-blue-300 font-bold text-xl"
    : "text-black font-medium text-lg dark:text-gray-100";
  const specialBtnClass =
    "bg-animated-gradient bg-300% animate-gradient text-white font-semibold py-2 px-6 rounded-2xl shadow-lg hover:scale-105 transition duration-200 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-purple-300";
  const normalBtnClass =
    "bg-white text-black border border-gray-600 rounded-xl px-4 py-2 hover:shadow-lg transition-transform hover:opacity-90 hover:scale-105 duration-200 dark:bg-gray-800 dark:text-white dark:border-gray-600";

  return (
    <div
      className={`${isSpecial ? "" : "bg-white dark:bg-gray-800"} sticky top-0 inset-x-0 z-50`}
    >
      <div className="flex justify-around items-center px-6 py-4">
        {/* Logo */}
        <Link to="/">
          <motion.h2
            className={titleClass}
            whileHover={isSpecial ? { scale: 1.1, y: -2 } : { scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            &lt;CodeIQ/&gt;
          </motion.h2>
          </Link>

        {/* Links */}
        <div className="flex justify-center space-x-4">
          {[
            { to: "/problems", label: "Problems" },
            { to: "/leaderboard", label: "Leaderboard" },
            ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
            { to: "/submissions", label: "Submissions" },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="no-underline">
              <motion.h3
                className={`${linkTextBase} px-5 ${
                  isActive(to) ? "small-underline" : ""
                }`}
                whileHover={isSpecial ? { scale: 1.1, y: -2 } : { scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                {label}
              </motion.h3>
            </Link>
          ))}
        </div>

        {/* Auth + Toggle */}
        <div className="flex items-center gap-4">
          {userinfo ? (
            <>
              <button onClick={handleLogout} className={isSpecial ? specialBtnClass : normalBtnClass}>
                Logout
              </button>
              <Link to="/profile">
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}${userinfo.avatar_path}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full hover:shadow-xl hover:scale-105 transition duration-200 cursor-pointer"
                />
              </Link>
            </>
          ) : (
            <Link to="/login" className="no-underline">
              <button type="button" className={isSpecial ? specialBtnClass : normalBtnClass}>
                Login
              </button>
            </Link>
          )}
          <button onClick={toggleTheme}>
            {isDark ? <Sun className="w-6 h-6 text-white" /> : <Moon className="w-6 h-6 text-black" />}
          </button>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default Navbar;
