import express from 'express'
import { addproblem, deleteproblem, get_problem, getproblems, update_problem } from '../controllers/problemController.js';
import verifyToken from '../middlewares/verifyToken.js';
const problemrouter = express.Router();

problemrouter.post('/admin/addproblem', verifyToken, addproblem)
problemrouter.get('/problems', getproblems);
problemrouter.post('/admin/deleteproblem', verifyToken, deleteproblem);
problemrouter.post('/admin/updateproblem',verifyToken, update_problem);
problemrouter.post('/getproblem',get_problem);

export default problemrouter;