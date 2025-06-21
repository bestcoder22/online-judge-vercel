import express from 'express'
import { ai_smart_fix, ai_complexity, ai_code_review, ai_error_suggestion } from '../controllers/submissionController.js';
import verifyToken from '../middlewares/verifyToken.js';
const submissionrouter = express.Router();


submissionrouter.post('/smartfix', verifyToken, ai_smart_fix)
submissionrouter.post('/get_complexity' , verifyToken, ai_complexity);
submissionrouter.post('/codereview', verifyToken, ai_code_review);
submissionrouter.post('/errorsuggestion' , verifyToken, ai_error_suggestion)

export default submissionrouter;