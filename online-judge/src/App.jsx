import './App.css'
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Problems from './pages/Problems';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import Addproblem from './pages/Addproblem';
import Updateproblem from './pages/Updateproblem';
import Problempage from './pages/Problempage';
import Profile from './pages/Profile';
import Submissions from './pages/Submissions';
import Submissionspage from './pages/Submissionspage';
import ProtectedRoutes from './utils/ProtectedRoutes';


const App = () =>{
    return (
        <>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route element={<ProtectedRoutes />} >
                    <Route path='/profile' element={< Profile/>} />
                    <Route path='/admin/addproblem' element={<Addproblem />} />
                    <Route path='/admin/updateproblem' element={<Updateproblem />} />
                    <Route path='/submissions/:submissionid' element={<Submissionspage />} />
                </Route>
                <Route path='/problems' element={<Problems />} />
                <Route path='/problems/:problemid' element={<Problempage />} />
                <Route path='/leaderboard' element={<Leaderboard />} />
                <Route path='/admin' element={<Admin />} />
                <Route path='/submissions' element={<Submissions />} />
                
            </Routes>
        </>
    )
    
}

export default App;