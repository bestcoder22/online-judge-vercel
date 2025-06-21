// src/pages/Signup.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import bgImage from "../assets/5166950.jpg";
import CursorNetBackground from "../components/Cursornetbackground";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const inputVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

const buttonVariants = {
  hover: { scale: 1.03, transition: { yoyo: Infinity, duration: 0.4 } }
};

const Signup = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: ""
  });

  const changeHandler = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signup`, user);
      if (response.data.success) {
        toast.success(response.data.message || 'Signup successful!');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        const errMsg = response.data.errors || response.data.message || 'Signup failed';
        toast.error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-6 py-12">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -30 }}
      />
      {/* Dark overlay for contrast */}
      <div className="fixed inset-0 bg-indigo-900/70" style={{ zIndex: -20 }} />
      <CursorNetBackground />

      <motion.div
        className="relative w-full max-w-md bg-white/10 backdrop-blur-md border border-indigo-500 rounded-xl shadow-lg p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-center text-2xl font-bold text-white">Signup</h2>
        <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
          <motion.input
            name="username"
            type="text"
            placeholder="Username"
            value={user.username}
            onChange={changeHandler}
            className="block w-full rounded-md bg-white/20 px-3 py-2 text-base text-white placeholder-gray-300 border border-transparent focus:border-indigo-400 focus:bg-white/30 focus:outline-none transition"
            variants={inputVariants}
          />
          <motion.input
            name="email"
            type="email"
            placeholder="Email Address"
            value={user.email}
            onChange={changeHandler}
            className="block w-full rounded-md bg-white/20 px-3 py-2 text-base text-white placeholder-gray-300 border border-transparent focus:border-indigo-400 focus:bg-white/30 focus:outline-none transition"
            variants={inputVariants}
          />
          <motion.input
            name="password"
            type="password"
            placeholder="Password"
            value={user.password}
            onChange={changeHandler}
            className="block w-full rounded-md bg-white/20 px-3 py-2 text-base text-white placeholder-gray-300 border border-transparent focus:border-indigo-400 focus:bg-white/30 focus:outline-none transition"
            variants={inputVariants}
          />
        </motion.div>
        <motion.div className="mt-6">
          <motion.button
            onClick={submit}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-full shadow-md transition"
            variants={buttonVariants}
            whileHover="hover"
          >
            Continue
          </motion.button>
        </motion.div>
        <p className="text-center text-sm text-gray-200">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-300 hover:text-indigo-100 font-medium">
            Login Here
          </Link>
        </p>
      </motion.div>
      {/* Toast container */}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default Signup;
