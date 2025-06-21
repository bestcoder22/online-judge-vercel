import express from 'express'
import { delete_testcase, get_details_input, get_details_output , get_testcase, run_code, save_testcase, update_testcase} from '../controllers/testcaseController.js';
import testcase_upload from '../middlewares/temp_store.js';
import verifyToken from '../middlewares/verifyToken.js';
const testcaserouter = express.Router();

testcaserouter.post('/run', verifyToken , run_code);
testcaserouter.post("/admin/getdetails_input", verifyToken, testcase_upload.single('file'), get_details_input);
testcaserouter.post("/admin/getdetails_output", verifyToken, testcase_upload.single('file'), get_details_output);
testcaserouter.post("/admin/testcase" , verifyToken ,  save_testcase);
testcaserouter.post("/admin/deletetestcases",verifyToken, delete_testcase);
testcaserouter.post("/gettestcase", verifyToken, get_testcase);
testcaserouter.post("/admin/updatetestcase",verifyToken, update_testcase);

export default testcaserouter;