import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Search , X} from "lucide-react";
import { toast } from "react-toastify";

const Updateproblem = () => {
  const {isAdmin} = useContext(AuthContext)
  const [problems, setproblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedTestcase, setselectedTestcase] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    const getproblems = async () => {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/problems`);
      setproblems(response.data.problems);
    };
    getproblems();
  }, []);

  const filteredProblems = problems.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.problemid.toString().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q)
    );
  });

  const addSamplePair = () => {
    if (selectedProblem.sampleCases.length >= 5) return;
    const newPair = {
      id: Date.now() + Math.random(), // simple unique key
      sampleInput: '',
      sampleOutput: '',
    };
    setSelectedProblem(prev => ({
      ...prev,
      sampleCases: [...prev.sampleCases, newPair],
      }));
    };

  const removeSampleCases = (id) => {
    setSelectedProblem((prev) => ({
      ...prev,
      sampleCases: prev.sampleCases.filter((pair) => pair.id !== id),
      }));
    };

    const onSampleChange = (id, field, value) => {
      setSelectedProblem((prev) => ({
        ...prev,
        sampleCases:prev.sampleCases.map((pair) =>
          pair.id === id ? { ...pair, [field]: value } : pair
        )
      })
      
    );
  };

  const handledelete = async (problemid) => {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/admin/deleteproblem`,
      { problemid },
      {withCredentials:true}
    );
    const response_testcases = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/deletetestcases`,{ problemid }, {withCredentials:true});
    if (response.data.success && response_testcases.data.success) {
      toast.success(`${response.data.message}. ${response_testcases.data.message}`);
      setTimeout(() => {
        window.location.href = '/admin/updateproblem';
      }, 1200);
    }
  };
  

  const handleEdit = async (problem) => {
    setSelectedProblem(problem);
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/gettestcase`, problem , {withCredentials:true});
    setselectedTestcase(response.data.testcase); 
    
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProblem((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    
    if(e.target.name === "inputFile"){
        const data_input = new FormData();
        const inputfile = e.target.files[0];
        data_input.append('name',inputfile.name);
        data_input.append('file',inputfile);
        const response_input = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/getdetails_input`, data_input , {withCredentials:true});
        setselectedTestcase((prev) => ({...prev, input:response_input.data.input}));
    }
    if(e.target.name === "outputFile"){
        const data_output = new FormData();
        const outputfile=e.target.files[0]
        data_output.append('name', outputfile.name);
        data_output.append('file', outputfile);
        const response_output = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/getdetails_output` , {withCredentials:true});
        setselectedTestcase((prev) => ({...prev, expectedOutput:response_output.data.output}));
    }
  };

  const handleUpdate = async () => {
    if(selectedProblem.title===""){
      toast.warn("Enter Title");
      return;
    }
    if(selectedProblem.description===""){
      toast.warn("Enter Description");
      return;
    }

    if(selectedProblem.constraints===""){
      toast.warn("Add Constraints");
      return;
    }

    for(let i=0 ; i<selectedProblem.sampleCases.length ; i++){
      const pair = selectedProblem.sampleCases[i];
      if (pair.sampleInput === '' || pair.sampleOutput === '') {
        toast.warn(`Enter Sample I/O for sample ${i + 1}`);
        return ;
      }
    }
    // send updated details and files using axios here
    if(selectedProblem===null && selectedTestcase===null){
        toast.warn("You haven't change anything for update!!")
        return;
    }
    if(selectedProblem!=null){
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/updateproblem`, selectedProblem , {withCredentials:true});
    }
    if(selectedTestcase!=null){
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/updatetestcase`, selectedTestcase , {withCredentials:true});
    }
    toast.success("Details Updated Successfully!");
    setTimeout(() => {
        window.location.href = '/admin/updateproblem';
      }, 1200);

  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Navbar />
      {isAdmin ? (
      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="flex justify-end mb-4">
            <button
              onClick={() => setSearchOpen((o) => !o)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <Search size={20} className="dark:text-gray-300"/>
            </button>
          </div>
          {searchOpen && (
            <div className="mb-6 flex justify-end">
              <input
                type="text"
                placeholder="Search by ID, title, or tag"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-indigo-600 dark:bg-gray-800 dark:text-white transition"
              />
            </div>
          )}
        <div className="overflow-x-auto border rounded-lg shadow bg-white dark:bg-gray-800 dark:border-gray-700">
          <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Tag</th>
                <th className="px-6 py-3 text-right">
                  <div className="mr-10">Actions</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((problem) => (
                  <tr
                    key={problem._id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">
                      {problem.problemid}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {problem.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded dark:bg-indigo-900/50 dark:text-indigo-300">
                        {problem.tag}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(problem)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handledelete(problem.problemid)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 dark:hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Edit Form Section */}
        {selectedProblem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative">
              {/* Close Button */}
              <button
                onClick={() => { setSelectedProblem(null); setselectedTestcase(null); }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <X size={20} className="dark:text-white"/>
              </button>

              <h2 className="text-3xl font-extrabold text-center text-indigo-600 dark:text-indigo-400 mb-8">
                Edit Problem
              </h2>

              <div className="space-y-6">
                {/* Problem ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Problem ID
                  </label>
                  <input
                    type="text"
                    value={selectedProblem.problemid}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-not-allowed"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    name="title"
                    value={selectedProblem.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-indigo-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Tag */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Tag
                  </label>
                  <select
                    name="tag"
                    value={selectedProblem.tag}
                    onChange={handleChange}
                    className="cursor-pointer w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:outline-indigo-600"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Insane</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={selectedProblem.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-indigo-600 dark:bg-gray-800 dark:text-white resize-none max-h-40 overflow-y-auto"
                  />
                </div>

                {/* Constraints */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Constraints
                  </label>
                  <textarea
                    name="constraints"
                    value={selectedProblem.constraints}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-indigo-600 dark:bg-gray-800 dark:text-white resize-none max-h-40 overflow-y-auto"
                  />
                </div>

                {/* Sample I/O */}
                <button
                  type="button"
                  onClick={addSamplePair}
                  disabled={selectedProblem.sampleCases.length >= 5}
                  className={`inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-md shadow hover:bg-cyan-600 focus:ring-2 focus:ring-indigo-500 transition ${selectedProblem.sampleCases.length >= 5 ? "opacity-50 cursor-not-allowed" : ""} dark:bg-cyan-600 dark:hover:bg-cyan-700`}
                >
                  Add Sample I/O ({selectedProblem.sampleCases.length}/5)
                </button>

                <div className="space-y-4">
                  {selectedProblem.sampleCases.map((pair, idx) => (
                    <div
                      key={pair.id}
                      className="relative bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <button
                        onClick={() => removeSampleCases(pair.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        ×
                      </button>
                      <h3 className="text-gray-700 dark:text-gray-200 font-medium mb-2">Sample #{idx + 1}</h3>
                      <textarea
                        value={pair.sampleInput}
                        onChange={e => onSampleChange(pair.id, "sampleInput", e.target.value)}
                        placeholder="Sample Input"
                        rows={3}
                        className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-indigo-600 dark:bg-gray-900 dark:text-white"
                      />
                      <textarea
                        value={pair.sampleOutput}
                        onChange={e => onSampleChange(pair.id, "sampleOutput", e.target.value)}
                        placeholder="Sample Output"
                        rows={3}
                        className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-indigo-600 dark:bg-gray-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Input File</label>
                    <input
                      type="file"
                      name="inputFile"
                      onChange={handleFileChange}
                      className="file:cursor-pointer w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold hover:file:bg-gray-100 dark:hover:file:bg-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Output File</label>
                    <input
                      type="file"
                      name="outputFile"
                      onChange={handleFileChange}
                      className="file:cursor-pointer w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold hover:file:bg-gray-100 dark:hover:file:bg-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => { setSelectedProblem(null); setselectedTestcase(null); }}
                  className="px-5 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      ) : (
        <h2 className='font-bold text-center m-5'>Only Admins can access this page!!</h2>
      )}
    </div>
  );
};

export default Updateproblem;
