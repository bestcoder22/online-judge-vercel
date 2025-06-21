import { useContext } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Admin = () => {
  const { isAdmin, userinfo } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-extrabold text-center text-indigo-600 dark:text-indigo-400 mb-8">
          Welcome to the Admin Dashboard
        </h2>

        {!userinfo ? (
          <div className="text-center py-8 text-gray-700 dark:text-gray-300">
            Please <Link to="/login" className="text-indigo-500 hover:underline">login</Link> to continue!
          </div>
        ) : !isAdmin ? (
          <div className="text-center py-8 text-red-600 dark:text-red-400 font-semibold">
            Sorry, you are not allowed to access this page.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-white/5 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-white/10">
              <p className="text-center text-xl font-medium text-gray-800 dark:text-white">
                Hello, <span className="text-indigo-600 dark:text-indigo-400">Admin</span>
              </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
              <Link
                to="/admin/addproblem"
                className="flex items-center justify-center py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-2xl shadow-lg transition-transform transform hover:-translate-y-1"
              >
                Add Problem
              </Link>

              <Link
                to="/admin/updateproblem"
                className="flex items-center justify-center py-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-2xl shadow-lg transition-transform transform hover:-translate-y-1"
              >
                Update Problem
              </Link>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
