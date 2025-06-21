// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CursorNetBackground from "../components/Cursornetbackground";
import Navbar from "../components/Navbar";
import bgImage from "../assets/5166950.jpg";
import Footer from "../components/Footer";
import { Puzzle, Cpu, Award, ArrowRight } from "lucide-react";

// Variants for the heading entrance animation
const headingVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};
console.log("✅ BACKEND_URL from env:", import.meta.env.VITE_BACKEND_URL);

// Variants for container to stagger children animations
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
      when: "beforeChildren",
      duration: 0.5
    }
  }
};

// Variants for feature cards: entrance and hover
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: { duration: 0.3 } }
};

// Variants for icon rotation on hover
const iconVariants = {
  rest: { rotate: 0 },
  hover: { rotate: 15, transition: { yoyo: Infinity, duration: 0.6 } }
};

// Variants for arrow animation in button
const buttonVariants = {
  rest: {},
  hover: {}
};

const arrowVariants = {
  rest: { x: 0 },
  hover: { x: 8, transition: { yoyo: Infinity, duration: 0.6 } }
};

// Create a motion-enabled Link component
const MotionLink = motion(Link);

const Home = () => {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -20 }}
      />
      <CursorNetBackground />

      {/* Page content */}
      <div className="relative z-10 flex flex-col flex-grow">
        {/* Navbar */}
        <div className="backdrop-blur-md bg-white/10 shadow-sm z-20">
          <Navbar />
        </div>

        {/* Main */}
        <main className="flex-grow px-6 py-12 flex flex-col items-center">
          {/* Animated Welcome */}
          <motion.section
            className="text-center mb-6 max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={headingVariants}
          >
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold mb-5 mt-3"
              variants={headingVariants}
            >
              Welcome to CodeIQ
            </motion.h1>
            <p className="text-gray-200 mb-10">
              Level up your coding skills with diverse problems, AI‑powered
              compilation, and real‑time ranking.
            </p>
            <MotionLink
              to="/problems"
              className="inline-flex items-center px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-full transition mb-3"
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              Get Started
              <motion.span variants={arrowVariants} className="ml-2 flex items-center">
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </MotionLink>
          </motion.section>

          {/* Feature Cards with entrance animation */}
          <motion.div
            className="grid gap-6 md:grid-cols-3 w-full max-w-5xl mb-8 mt-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {[
              {
                Icon: Puzzle,
                color: "text-cyan-400",
                title: "Diverse Problems",
                desc:
                  "Tackle a broad library of challenges with full problem statements, sample test cases and constraints—and track every submission you make."
              },
              {
                Icon: Cpu,
                color: "text-orange-300",
                title: "AI‑Powered Compiler",
                desc:
                  "Get smart fixes for syntax errors, AI‑driven code reviews scored to interview standards, and instant error suggestions to sharpen your code."
              },
              {
                Icon: Award,
                color: "text-pink-300",
                title: "Leaderboard & Profile",
                desc:
                  "Track your global ranking, see how many problems you’ve solved by difficulty and tags, and showcase your coding achievements."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg flex flex-col items-center"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="rest"
              >
                <motion.div variants={iconVariants} className={`mb-4 ${item.color}`}>
                  <item.Icon className="w-10 h-10" />
                </motion.div>
                <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-200 text-sm text-center">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </main>

        {/* Footer */}
        <div className="backdrop-blur-md bg-white/10 shadow-sm z-20">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
