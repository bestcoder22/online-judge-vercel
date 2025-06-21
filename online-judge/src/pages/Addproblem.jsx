import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";

const AddProblem = () => {
  const { isAdmin } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState("Select Difficulty");
  const [inputFile, setInputFile] = useState(null);
  const [outputFile, setOutputFile] = useState(null);
  const [samplePairs, setSamplePairs] = useState([]);
  const [problem, setProblem] = useState({
    problemid: null,
    tag: "",
    title: "",
    description: "",
    constraints: "",
    sampleCases: [],
  });
  const options = ["Easy", "Medium", "Hard", "Insane"];

  const handleSelect = (option) => {
    setSelectedTag(option);
    setOpen(false);
    setProblem({ ...problem, tag: option });
  };

  const onSampleChange = (id, field, value) => {
    setSamplePairs((prev) =>
      prev.map((pair) => (pair.id === id ? { ...pair, [field]: value } : pair))
    );
  };

  const addSamplePair = () => {
    if (samplePairs.length >= 5) return;
    const newPair = { id: Date.now(), sampleInput: "", sampleOutput: "" };
    setSamplePairs((prev) => [...prev, newPair]);
  };

  const removeSamplePair = (id) => {
    setSamplePairs((prev) => prev.filter((pair) => pair.id !== id));
  };

  const changeHandler = (e) => {
    setProblem({ ...problem, [e.target.name]: e.target.value });
  };

  const submitHandler = async () => {
    if (!inputFile) {
      toast.warn("Input File not added");
      return;
    }
    if (!outputFile) {
      toast.warn("Output File not added");
      return;
    }
    if (problem.tag === "") {
      toast.warn("Enter Tag");
      return;
    }
    if (problem.title === "") {
      toast.warn("Enter Title");
      return;
    }
    if (problem.description === "") {
      toast.warn("Enter Description");
      return;
    }

    if (problem.constraints === "") {
      toast.warn("Add Constraints");
      return;
    }

    for (let i = 0; i < samplePairs.length; i++) {
      const pair = samplePairs[i];
      if (pair.sampleInput === "" || pair.sampleOutput === "") {
        toast.warn(`Enter Sample I/O for sample ${i + 1}`);
        return;
      }
    }

    const data_input = new FormData();
    data_input.append("name", inputFile.name);
    data_input.append("file", inputFile);
    const response_input = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/admin/getdetails_input`,
      data_input,
      { withCredentials: true }
    );

    const data_output = new FormData();
    data_output.append("name", outputFile.name);
    data_output.append("file", outputFile);
    const response_output = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/admin/getdetails_output`,
      data_output,
      { withCredentials: true }
    );

    const response_testcase = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/admin/testcase`,
      { response_input, response_output },
      { withCredentials: true }
    );

    const finalProblem = {
      ...problem,
      problemid: response_testcase.data.problemid,
      sampleCases: samplePairs,
    };

    const response_problem = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/admin/addproblem`,
      finalProblem,
      { withCredentials: true }
    );
    if (response_problem.data.success) {
      toast.success("Problem added successfully");
      setTimeout(() => {
          window.location.href = '/admin';
        }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <h2 className="text-3xl font-extrabold text-center text-indigo-600 dark:text-indigo-400">
          Add New Problem
        </h2>

        {!isAdmin ? (
          <div className="text-center text-red-600 dark:text-red-400 font-semibold">
            Only admins can access this page.
          </div>
        ) : (
          <div
            className="bg-white dark:bg-white/5 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-white/10"
            onClick={() => open && setOpen(false)}
          >
            {/* Difficulty Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="w-full flex justify-between items-center px-4 py-2 
           bg-white border border-gray-300 rounded-md shadow-sm 
           hover:bg-gray-50 text-gray-700 dark:bg-gray-800 
           dark:border-gray-600 dark:text-gray-200 
           dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((o) => !o);
                }}
              >
                {selectedTag}
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06-.02L10 10.585l3.71-3.395a.75.75 0 111.02 1.097l-4 3.656a.75.75 0 01-1.02 0l-4-3.656a.75.75 0 01-.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {open && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/20 rounded-md shadow-lg">
                  {options.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                      onClick={() => handleSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Text Inputs */}
            <div className="space-y-4 mt-3">
              <div>
                <input
                  name="title"
                  value={problem.title}
                  onChange={changeHandler}
                  type="text"
                  placeholder="Problem Title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-md shadow-sm focus:outline-indigo-600 mt-2"
                />
              </div>
              <div>
                <textarea
                  name="description"
                  value={problem.description}
                  onChange={changeHandler}
                  placeholder="Problem Description"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-md shadow-sm focus:outline-indigo-600 mt-2"
                />
              </div>
              <div>
                <textarea
                  name="constraints"
                  value={problem.constraints}
                  onChange={changeHandler}
                  placeholder="Problem Constraints"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-md shadow-sm focus:outline-indigo-600 mt-2"
                />
              </div>
            </div>

            {/* Sample I/O */}
            <div className="space-y-4 mt-4">
              <button
                type="button"
                onClick={addSamplePair}
                disabled={samplePairs.length >= 5}
                className={`"inline-flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white rounded-md shadow focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" ${
                  samplePairs.length >= 5 ? "cursor-not-allowed" : ""
                }`}
              >
                Add Sample I/O ({samplePairs.length}/5)
              </button>

              {samplePairs.map((pair, idx) => (
                <div
                  key={pair.id}
                  className="relative bg-gray-50 dark:bg-white/5 p-4 border border-gray-200 dark:border-white/20 rounded-lg"
                >
                  <button
                    type="button"
                    onClick={() => removeSamplePair(pair.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white"
                  >
                    ×
                  </button>
                  <h3 className="text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Sample #{idx + 1}
                  </h3>
                  <textarea
                    value={pair.sampleInput}
                    placeholder="Sample Input"
                    onChange={(e) =>
                      onSampleChange(pair.id, "sampleInput", e.target.value)
                    }
                    className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-md shadow-sm focus:outline-indigo-600"
                    rows={3}
                  />
                  <textarea
                    value={pair.sampleOutput}
                    placeholder="Sample Output"
                    onChange={(e) =>
                      onSampleChange(pair.id, "sampleOutput", e.target.value)
                    }
                    className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-md shadow-sm focus:outline-indigo-600"
                    rows={3}
                  />
                </div>
              ))}
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <div className="mt-4">
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                  Upload Input File
                </label>
                <input
                  type="file"
                  onChange={(e) => setInputFile(e.target.files[0])}
                  className="w-full text-sm cursor-pointer
             text-gray-500 dark:text-gray-400
             file:mr-4 file:py-2 file:px-4 
             file:rounded-full file:border-0 
             file:text-sm file:font-semibold 
             file:bg-gray-100 hover:file:bg-gray-200 
             dark:file:bg-white/10 dark:hover:file:bg-white/20 
             dark:file:text-gray-200"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                  Upload Output File
                </label>
                <input
                  type="file"
                  onChange={(e) => setOutputFile(e.target.files[0])}
                  className="w-full text-sm cursor-pointer
             text-gray-500 dark:text-gray-400
             file:mr-4 file:py-2 file:px-4 
             file:rounded-full file:border-0 
             file:text-sm file:font-semibold 
             file:bg-gray-100 hover:file:bg-gray-200 
             dark:file:bg-white/10 dark:hover:file:bg-white/20 
             dark:file:text-gray-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={submitHandler}
              className="mt-7 w-full py-3 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-semibold rounded-2xl shadow-lg transition-transform transform hover:-translate-y-1"
            >
              Submit Problem
            </button>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark" // Optional: respects dark mode toast styling
      />
    </div>
  );
};

export default AddProblem;
