import Editor from "@monaco-editor/react";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Clock, Database } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Play, Send, Wand } from "lucide-react";
import Navbar from "./Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeContext } from "../context/ThemeContext";

const Compiler = ({ problemid }) => {
  const { userinfo } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [responseData, setResponseData] = useState(null);
  const [errorData, setErrorData] = useState(null);
  const [selectedTestcase, setSelectedTestcase] = useState(null);
  const [problem, setProblem] = useState(null);
  const [isSampleRun, setIsSampleRun] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [customError, setCustomError] = useState(null);
  const [timecomplexity, setTimeComplexity] = useState(null);
  const [spacecomplexity, setSpaceComplexity] = useState(null);
  const [codereview, setCodeReview] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [errorsuggestion, setErrorSuggestion] = useState(null);
  const [loadingRun, setLoadingRun] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingFix, setLoadingFix] = useState(false);

  const defaultCodes = {
    cpp: `#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
    js: `console.log("Hello, World!");`,
    py: `print("Hello, World!")`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  };

  // Wrap the sample “Run” (Play) button
  const handleRun = async () => {
    setLoadingRun(true);
    await run_sample_code(); // your existing function
    setLoadingRun(false);
  };

  // Wrap the full “Submit” (Send) button
  const handleSubmit = async () => {
    setLoadingSubmit(true);
    await run_code(); // your existing function
    setLoadingSubmit(false);
  };

  // Wrap the “Smart Fix” (Wand) button
  const handleFix = async () => {
    setLoadingFix(true);
    await ai_smart_fix(); // your existing function
    setLoadingFix(false);
  };

  useEffect(() => {
    const getProblem = async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/getproblem`, {
          problemid,
        });
        setProblem(response.data.problem);
      } catch {
        setProblem(null);
      }
    };
    getProblem();
  }, [problemid]);

  useEffect(() => {
    setCode(defaultCodes[language]);
  }, [language]);

  const run_code = async () => {
    setResponseData(null);
    setErrorData(null);
    setSelectedTestcase(null);
    setIsSampleRun(false);

    if (code.trim() === "") {
      toast.error("Write some code");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/run`,
        {
          problemid,
          code,
          language,
        },
        { withCredentials: true }
      );

      if (res.data.status === "success") {
        console.log("Hi");
        const response_complexity = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/get_complexity`,
          { language, code },
          { withCredentials: true }
        );
        if (response_complexity.data.success) {
          const raw = response_complexity.data.complexity; // e.g. "```txt\nO(n)\nO(1)\n```"
          const lines = raw
            .replace(/```[\s\S]*?```/, (match) =>
              match // strip only the fences
                .replace(/^```.*\n/, "")
                .replace(/```$/, "")
            )
            .split("\n")
            .filter(Boolean);

          setTimeComplexity(lines[0].trim()); // first line ⇒ time
          setSpaceComplexity(lines[1].trim()); // second line ⇒ space
        } else {
          setTimeComplexity("Not Available");
          setSpaceComplexity("Not Available");
        }
        setResponseData(res.data);
      } else {
        // Backend returned a JSON with status: "error"
        const errorType = res.data.errorType || "Error";
        const message = res.data.message || "An unknown error occurred.";
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/errorsuggestion`,
          { language, code, problem, errorType, message },
          { withCredentials: true }
        );
        if (response.data.success) {
          setErrorSuggestion(response.data.suggestion);
        } else {
          setErrorSuggestion("");
        }
        setErrorData({
          errorType: errorType,
          message: message,
        });
      }
    } catch (err) {
      // Axios/network error
      const serverData = err.response?.data || {};
      setErrorData({
        errorType: serverData.errorType || "Error",
        message:
          serverData.message || err.message || "An unknown error occurred.",
      });
    }
  };

  const run_sample_code = async () => {
    setResponseData(null);
    setErrorData(null);
    setSelectedTestcase(null);
    setIsSampleRun(true);

    if (code.trim() === "") {
      toast.error("Write some code");
      return;
    }

    if (!problem?.sampleCases) {
      toast.warn("Sample cases not yet loaded.");
      return;
    }

    // Build input array from sampleCases
    const inputArray = problem.sampleCases.map((sc, idx) => ({
      name: `Sample #${idx}`,
      data: sc.sampleInput,
    }));

    // Build expected output array from sampleCases
    const expectedOutputArray = problem.sampleCases.map((sc, idx) => ({
      name: `Sample #${idx}`,
      data: sc.sampleOutput,
    }));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/run`,
        {
          problemid,
          code,
          language,
          inputArray,
        },
        { withCredentials: true }
      );

      if (res.data.status === "success") {
        // Manually construct responseData to match the same shape as a full submission
        setResponseData({
          status: "success",
          input: inputArray,
          expectedOutput: expectedOutputArray,
          output: res.data.output,
        });
      } else {
        // Backend returned status: "error"
        setErrorData({
          errorType: res.data.errorType || "Error",
          message: res.data.message || "An unknown error occurred.",
        });
      }
    } catch (err) {
      const serverData = err.response?.data || {};
      setErrorData({
        errorType: serverData.errorType || "Error",
        message:
          serverData.message || err.message || "An unknown error occurred.",
      });
    }
  };

  const open_custom_testcase = async () => {
    setIsCustomOpen(true);
  };

  const run_custom_code = async () => {
    setCustomOutput("");
    setCustomError(null);

    if (!customInput.trim()) {
      toast.info("Please enter custom input");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/run`,
        {
          problemid,
          code,
          language,
          inputArray: [{ name: "Custom", data: customInput }],
        },
        { withCredentials: true }
      );

      if (res.data.status === "success") {
        setCustomOutput(res.data.output?.[0]?.output || "");
      } else {
        setCustomError(res.data.message || "Unknown error");
      }
    } catch (err) {
      setCustomError(err.response?.data?.message || err.message);
    }
  };

  const normalize = (str) => str.replace(/\r\n/g, "\n").trim();

  let testcaseSummaries = [];
  if (responseData) {
    testcaseSummaries = (responseData.output || []).map((outObj) => {
      const name = outObj.name;
      const userRaw = outObj.output || "";
      const userNorm = normalize(userRaw);

      const inputObj =
        (responseData.input || []).find((i) => i.name === name) || {};
      const inputRaw = inputObj.data || "";

      const expectedObj =
        (responseData.expectedOutput || []).find((e) => e.name === name) || {};
      const expectedRaw = expectedObj.data || "";
      const expectedNorm = normalize(expectedRaw);

      const isCorrect = userNorm === expectedNorm;

      return {
        name,
        inputRaw,
        userRaw,
        expectedRaw,
        isCorrect,
      };
    });
  }

  const closePanel = () => {
    setResponseData(null);
    setErrorData(null);
    setSelectedTestcase(null);
  };

  // Check if all testcases passed (only for full submissions)
  const allPassed =
    responseData &&
    !isSampleRun &&
    testcaseSummaries.length > 0 &&
    testcaseSummaries.every((tc) => tc.isCorrect);

  useEffect(() => {
    const save_submission = async () => {
      if (errorData && !isSampleRun) {
        const data = {
          userid: userinfo._id,
          problemid: problemid,
          code: code,
          status: errorData.errorType,
        };
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/submission`, data, {
          withCredentials: true,
        });
      }
      if (responseData && !isSampleRun) {
        if (allPassed) {
          const data = {
            userid: userinfo._id,
            problemid: problemid,
            code: code,
            status: "Accepted",
            time_complexity: timecomplexity,
            space_complexity: spacecomplexity,
          };

          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/submission`, data, {
            withCredentials: true,
          });
        } else {
          const data = {
            userid: userinfo._id,
            problemid: problemid,
            code: code,
            status: "Wrong Answer",
          };
          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/submission`, data, {
            withCredentials: true,
          });
        }
      }
    };
    save_submission();
  }, [errorData, responseData]);

  const ai_smart_fix = async () => {
    const data = {
      language: language,
      code: code,
    };
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/smartfix`, data, {
      withCredentials: true,
    });
    if (response.data.success) {
      let rawCode = response.data.code;

      // Remove markdown-style code fences
      if (rawCode.startsWith("```")) {
        rawCode = rawCode.replace(/^```[\s\S]*?\n/, "");
        rawCode = rawCode.replace(/```$/, "");
      }

      setCode(rawCode.trim());
    } else {
      toast.error(response.data.error);
    }
  };

  const ai_code_review = async () => {
    const data = {
      language: language,
      code: code,
      problem: problem,
    };
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/codereview`,
      data,
      { withCredentials: true }
    );
    if (response.data.success) {
      setCodeReview(response.data.codereview);
    } else {
      setCodeReview("Code Review Unavailable. Try after sometime.");
    }
    setShowReview(true);
  };
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const [leftWidth, setLeftWidth] = useState(window.innerWidth / 2);

  // When user presses mouse down on divider
  const onMouseDownDivider = (e) => {
    e.preventDefault();
    dragging.current = true;
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let newLeftWidth = e.clientX - rect.left;
    // enforce minimum widths, e.g., 200px each side
    const min = 200;
    const max = rect.width - 200;
    if (newLeftWidth < min) newLeftWidth = min;
    if (newLeftWidth > max) newLeftWidth = max;
    setLeftWidth(newLeftWidth);
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Update leftWidth if window resizes, to keep it reasonable
  useEffect(() => {
    const onResize = () => {
      if (!containerRef.current) return;
      const total = containerRef.current.getBoundingClientRect().width;
      // keep leftWidth <= total - min
      const min = 200;
      if (leftWidth > total - min) {
        setLeftWidth(total / 2);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [leftWidth]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Navbar at top */}
      <Navbar />

      {/* Main area: split container */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* LEFT PANE */}
        <div
          className="flex flex-col min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700 bg-white dark:bg-gray-900"
          style={{ width: leftWidth }}
        >
          {/* ===== Left column content unchanged ===== */}
          <div className="w-full p-6 flex flex-col">
            {isCustomOpen ? (
              <div className="relative bg-white/90 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-none dark:ring-1 dark:ring-white/10 dark:border dark:border-gray-700 p-6 flex-1 overflow-y-auto">
                {/* × close */}
                <button
                  onClick={() => {
                    setIsCustomOpen(false);
                    setCustomInput("");
                    setCustomOutput("");
                    setCustomError(null);
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>

                {/* Heading */}
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Custom Testcase Run
                </h2>

                {/* Input box */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Input:
                  </h3>
                  <textarea
                    rows={6}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md font-mono text-sm dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Output / Error */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Output:
                  </h3>
                  <pre className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md font-mono text-sm min-h-[100px] dark:bg-gray-800 dark:text-white">
                    {customError ? `Error: ${customError}` : customOutput}
                  </pre>
                </div>

                {/* Run button */}
                <button
                  onClick={run_custom_code}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
                >
                  Run Custom Test
                </button>
              </div>
            ) : errorData || responseData ? (
              <div className="relative bg-white/90 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-none dark:ring-1 dark:ring-white/10 dark:border dark:border-gray-700 p-6 flex-1 overflow-y-auto">
                <button
                  onClick={closePanel}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>

                {errorData ? (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-600 rounded-xl p-4 space-y-4 w-full">
                    {/* 1) Error Type */}
                    <h2 className="text-lg font-semibold text-red-600 font-sans">
                      {errorData.errorType}
                    </h2>

                    {/* 2) AI Suggestion */}
                    {errorsuggestion && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-600 rounded-lg shadow-sm ">
                        <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                          💡 AI Suggestion
                        </h3>
                        <h2 className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line">
                          {errorsuggestion}
                        </h2>
                      </div>
                    )}

                    {/* 3) Error Message */}
                    <span className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line font-sans">
                      {errorData.message}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col flex-1 overflow-auto">
                    {/* If this was a sample‐run */}
                    {isSampleRun && (
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 font-sans">
                        Sample Testcase Results
                      </h2>
                    )}

                    {/* Accepted */}
                    {!isSampleRun && allPassed && (
                      <>
                        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                          Accepted
                        </h2>
                        <div className="mt-5 flex flex-wrap items-center gap-3 mb-5">
                          <span className="inline-flex items-center space-x-1 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-medium">
                            <Clock className="w-4 h-4 animate-bounce-slow" />
                            <span>Time: {timecomplexity}</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 bg-purple-50 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full font-medium">
                            <Database className="w-4 h-4 animate-bounce-slow" />
                            <span>Space: {spacecomplexity}</span>
                          </span>
                        </div>
                        <div>
                          <button
                            onClick={ai_code_review}
                            className="mb-5 cursor-pointer bg-gradient-to-r from-purple-500 via-pink-500 via-red-500 via-pink-500 to-purple-500 text-white font-semibold py-2 px-3 rounded-xl shadow-lg transform transition focus:outline-none focus:ring-4 focus:ring-pink-300 bg-300% animate-gradient"
                          >
                            Ai Code Review
                          </button>
                        </div>
                      </>
                    )}

                    {/* Wrong Answer */}
                    {!isSampleRun && !allPassed && (
                      <h2 className="text-2xl text-red-800 dark:text-red-400 mb-4 font-sans font-bold">
                        Wrong Answer
                      </h2>
                    )}

                    {/* Testcase list */}
                    <div className="flex-1 overflow-auto">
                      <div className="flex flex-col space-y-2">
                        {testcaseSummaries.map((tc) => (
                          <div key={tc.name}>
                            <button
                              onClick={() =>
                                setSelectedTestcase((prev) =>
                                  prev === tc.name ? null : tc.name
                                )
                              }
                              className={`
            w-full text-left px-4 py-2 rounded-lg font-medium font-sans
            ${
              tc.isCorrect
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600"
                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-600"
            }
            hover:opacity-90
          `}
                            >
                              <span className="text-base">{tc.name}</span>{" "}
                              <span className="ml-2">
                                {tc.isCorrect ? "✅" : "❌"}
                              </span>
                            </button>

                            {selectedTestcase === tc.name && (
                              <div
                                className={` mt-2 ml-4 p-4 rounded-xl border bg-gray-50 dark:bg-gray-800/60 dark:backdrop-blur-sm dark:ring-1 dark:ring-white/10 border-gray-200 dark:border-gray-60 `}
                              >
                                <div className="mb-3">
                                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 font-sans">
                                    Input:
                                  </h3>
                                  <pre className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap mt-1 font-mono">
                                    {tc.inputRaw.replace(/\r\n/g, "\n")}
                                  </pre>
                                </div>

                                <div className="mb-3">
                                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 font-sans">
                                    Your Output:
                                  </h3>
                                  <pre className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap mt-1 font-mono">
                                    {tc.userRaw.replace(/\r\n/g, "\n")}
                                  </pre>
                                </div>

                                <div>
                                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 font-sans">
                                    Expected Output:
                                  </h3>
                                  <pre className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap mt-1 font-mono">
                                    {tc.expectedRaw.replace(/\r\n/g, "\n")}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className=" bg-white dark:bg-gray-900/60 rounded-2xl shadow-lg p-6 flex-1 overflow-y-auto dark:backdrop-blur-md dark:ring-1 dark:ring-white/15"
              >
                {problem ? (
                  <>
                    {/* Tag & Title */}
                    <div className="mb-4 flex justify-between">
                      <h1 className="mt-1 text-3xl font-bold text-gray-800 dark:text-gray-100 font-sans">
                        {problem.title}
                      </h1>
                      <span className="mt-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase font-sans">
                        {problem.tag}
                      </span>
                    </div>

                    {/* Description */}
                    <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2 font-sans">
                      Description
                    </h2>
                    <div className="mb-6 max-h-44 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-4">
                      <h2 className="text-base text-gray-700 dark:text-gray-100 whitespace-pre-wrap font-sans">
                        {problem.description}
                      </h2>
                    </div>

                    {/* Constraints */}
                    <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2 font-sans">
                      Constraints
                    </h2>
                    <div className="mb-6 max-h-28 overflow-y-auto bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-4">
                      <h2 className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-serif">
                        {problem.constraints}
                      </h2>
                    </div>

                    {/* Sample Cases */}
                    <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-4 font-sans">
                      Sample Cases
                    </h2>
                    <div className="grid gap-4">
                      {(problem.sampleCases || []).map((sc, idx) => (
                        <div
                          key={sc.id}
                          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                        >
                          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 font-sans">
                            Sample #{idx}
                          </h2>

                          <div className="mb-4">
                            <h2 className="text-base font-medium text-gray-600 dark:text-gray-300 mb-1 font-sans">
                              Input
                            </h2>
                            <pre className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap font-mono">
                              {sc.sampleInput}
                            </pre>
                          </div>

                          <div>
                            <h2 className="text-base font-medium text-gray-600 dark:text-gray-300 mb-1 font-sans">
                              Output
                            </h2>
                            <pre className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap font-mono">
                              {sc.sampleOutput}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 italic">
                      Loading problem…
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          {showReview && (
            <div
              className="absolute top-0 left-0"
              style={{ width: leftWidth, height: "100%" }}
            >
              {/* 1) Blur only left half */}
              <div
                className="absolute inset-0 backdrop-blur-sm"
                onClick={() => setShowReview(false)}
              />

              {/* 2) Centered panel container */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative z-10 pointer-events-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-96 max-h-[80vh] overflow-auto font-serif">
                  <button
                    onClick={() => setShowReview(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <div
                          className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <div
                          className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <div
                          className="text-sm text-gray-800 dark:text-gray-200 mb-2"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc list-inside ml-4 mb-2"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li
                          className="text-sm text-gray-800 dark:text-gray-200 mb-1"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {codereview}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className="w-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-cyan-600 cursor-col-resize transition"
          onMouseDown={onMouseDownDivider}
        />

        {/* RIGHT PANE */}
        <div
          className="flex flex-col min-h-0 overflow-y-auto"
          style={{ width: `calc(100% - ${leftWidth}px)` }}
        >
          {/* Top bar: dropdown + Custom Testcase */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-white dark:bg-gray-900 flex-shrink-0">
            <select
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 cursor-pointer text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="cpp">C++</option>
              <option value="js">JavaScript</option>
              <option value="py">Python</option>
              <option value="java">Java</option>
            </select>
            <button
              onClick={() => {
                setIsCustomOpen(true);
                setResponseData(null);
                setErrorData(null);
              }}
              className="text-blue-600 dark:text-blue-400 underline underline-offset-4 font-medium hover:text-blue-800 dark:hover:text-blue-300 transition"
            >
              Custom Testcase
            </button>
          </div>

          {/* Editor area */}
          <div className="flex-1 overflow-auto px-6 py-4 bg-white dark:bg-gray-900">
            <div className="h-full border dark:border-gray-700 rounded-xl shadow-md overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="cpp"
                language={language}
                value={code}
                onChange={(value) => setCode(value)}
                theme={isDark ? "vs-dark" : "light"}
                options={{ automaticLayout: true, minimap: { enabled: false } }}
              />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex justify-around items-center border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-900 flex-shrink-0">
            {userinfo ? (
              <button
                onClick={handleRun}
                disabled={loadingRun || !userinfo}
                className="group flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transform transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                {loadingRun ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-5 h-5 group-hover:animate-bounce" />
                    <span>Run</span>
                  </>
                )}
              </button>
            ) : (
              <button
                className="flex items-center space-x-2 bg-green-500 text-white font-medium py-2 px-5 rounded-lg shadow-md opacity-50 cursor-not-allowed"
                disabled
              >
                <Play className="w-4 h-4" />
                <span>Run</span>
              </button>
            )}

            {userinfo ? (
              <button
                onClick={handleSubmit}
                disabled={loadingSubmit || !userinfo}
                className="group flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-full shadow-lg transform transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                {loadingSubmit ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:animate-bounce" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            ) : (
              <button
                className="flex items-center space-x-2 bg-blue-500 text-white font-medium py-2 px-5 rounded-lg shadow-md opacity-50 cursor-not-allowed"
                disabled
              >
                <Send className="w-4 h-4" />
                <span>Submit</span>
              </button>
            )}

            {userinfo ? (
              <button
                onClick={handleFix}
                disabled={loadingFix || !userinfo}
                className="group flex items-center space-x-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold py-2 px-6 rounded-full shadow-lg transform transition hover:scale-105 hover:from-pink-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-pink-300"
              >
                {loadingFix ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Wand className="w-5 h-5 group-hover:animate-spin" />
                    <span>Smart Fix</span>
                  </>
                )}
              </button>
            ) : (
              <button
                className="flex items-center space-x-2 bg-purple-500 text-white font-medium py-2 px-5 rounded-lg shadow-md opacity-50 cursor-not-allowed"
                disabled
              >
                <Wand className="w-4 h-4" />
                <span>Smart Fix</span>
              </button>
            )}
          </div>
        </div>
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

export default Compiler;
