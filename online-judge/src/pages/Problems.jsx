import { useEffect, useState, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { Link } from "react-router-dom";
import { Search, Sliders, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Problems = () => {
  // 1. Fetched data
  const [problems, setProblems] = useState([]);

  // 2. Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortField, setSortField] = useState("problemid");
  const [sortOrder, setSortOrder] = useState("asc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // UI toggles
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  // Fetch problems once
  useEffect(() => {
    const getProblems = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/problems`);
        setProblems(response.data.problems || []);
        const url = `${import.meta.env.VITE_BACKEND_URL}/problems`;
        console.log("📡 Making request to:", url);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };
    getProblems();
  }, []);

  // Close settings panel on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsOpen]);

  // Derive unique tags
  const tagOptions = useMemo(() => {
    const tags = Array.from(new Set(problems.map((p) => p.tag))).filter(Boolean);
    tags.sort();
    return ["All", ...tags];
  }, [problems]);

  // Filter
  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (selectedTag !== "All" && p.tag !== selectedTag) return false;
      const term = searchTerm.trim().toLowerCase();
      if (term) {
        const inTitle = p.title?.toLowerCase().includes(term);
        const inId = String(p.problemid).toLowerCase().includes(term);
        return inTitle || inId;
      }
      return true;
    });
  }, [problems, selectedTag, searchTerm]);

  // Sort
  const sortedAndFiltered = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      const numA = Number(aVal);
      const numB = Number(bVal);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortField, sortOrder]);

  // Pagination
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedAndFiltered.length / itemsPerPage));
  }, [sortedAndFiltered, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginated = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedAndFiltered.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedAndFiltered, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Animations
  const searchVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: { width: '200px', opacity: 1 },
    exit: { width: 0, opacity: 0 }
  };
  const settingsVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <div className="font-sans bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
        {/* Top bar with icons */}
        <div className="flex justify-end items-center space-x-4 relative">
          {/* Search Icon / Input */}
          <div className="flex items-center">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  key="search-input"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={searchVariants}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    className="border border-gray-300 dark:border-gray-600 rounded-l-md p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    autoFocus
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
            <button
              onClick={() => {
                setSearchOpen((prev) => !prev);
                if (searchOpen) {
                  setSearchTerm('');
                }
              }}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center justify-center"
            >
              <Search size={16} className="text-gray-700 dark:text-gray-200" />
            </button>
          </div>

          {/* Settings / Filter Icon */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen((prev) => !prev)}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center"
            >
              <Sliders size={16} className="text-gray-700 dark:text-gray-200" />
            </button>
            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  key="settings-panel"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={settingsVariants}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10 p-4 space-y-4"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <X size={16} />
                  </button>

                  {/* Search inside settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search by title or ID"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* Filter by Tag */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Tag</label>
                    <select
                      value={selectedTag}
                      onChange={(e) => {
                        setSelectedTag(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {tagOptions.map((tag) => (
                        <option key={tag} value={tag} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                          {tag}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                    <div className="flex space-x-2">
                      <select
                        value={sortField}
                        onChange={(e) => {
                          setSortField(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="mt-1 flex-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value="problemid">ID</option>
                        <option value="title">Title</option>
                        <option value="tag">Tag</option>
                      </select>
                      <button
                        onClick={() => {
                          setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                          setCurrentPage(1);
                        }}
                        className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </button>
                    </div>
                  </div>

                  {/* Items per Page */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Items per Page</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{n}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* List of problems */}
        <div className="space-y-4">
          {paginated.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No problems found.</p>
          ) : (
            paginated.map((problem) => (
              <Link key={problem._id} to={`/problems/${problem.problemid}`}>                  
                <div className="cursor-pointer bg-white dark:bg-gray-800 shadow-md dark:shadow-none rounded-lg p-6 m-3 transform transition-transform duration-200 hover:scale-[1.03]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ID: {problem.problemid}</span>
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-100 px-2 py-1 rounded">
                      {problem.tag}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{problem.title}</h2>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-2 mt-6 flex-wrap">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border ${
              currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed dark:text-gray-600 dark:border-gray-700"
                : "text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            « Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`px-3 py-1 rounded-md border ${
                pageNum === currentPage
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md border ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed dark:text-gray-600 dark:border-gray-700"
                : "text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            Next »
          </button>
        </div>
      </div>
    </div>
  );
};

export default Problems;
