import Testcase from "../models/Testcase.js";
import { executeCpp } from "../utils/executeCpp.js";
import { executeJava } from "../utils/executeJava.js";
import { executeJs } from "../utils/executeJs.js";
import { executePython } from "../utils/executePython.js";
import { generateFile } from "../utils/generateFile.js";

export const run_code = async (req,res) => {
    const {problemid,code,language,inputArray} = req.body;
    try{
        const filePath = generateFile(code,language);

        if (inputArray) {
            let output;
            if(language === "cpp"){
                output = await executeCpp(filePath, inputArray);
            }
            else if(language === "py"){
                output = await executePython(filePath, inputArray);
            }
            else if(language === "java"){
                output = await executeJava(filePath, inputArray);
            }
            else if(language === "js"){
                output = await executeJs(filePath, inputArray);
            }
          return res.json({
            status: "success",
            filePath,
            output,
          });
        }
        else{
          const testcase = await Testcase.findOne({problemid: problemid});
        //   console.log(response_input.data.success)
        let output
        if(language === "cpp"){
          output = await executeCpp(filePath,testcase.input);
        }
        else if(language === "py"){
            output = await executePython(filePath,testcase.input);
        }
        else if(language === "java"){
            output = await executeJava(filePath,testcase.input);
        }
        else if(language === "js"){
            output = await executeJs(filePath,testcase.input);
        }
          return res.json({
          status: "success",
          filePath,
          input:testcase.input,
          expectedOutput:testcase.expectedOutput,
          output,
          });
        }
    } catch (err) {
        const { step, errorType, error } = err;
    return res.json({
      status: "error",
      step,
      errorType,
      message: error,
    });
  }
}

// import fs from "fs"
export const get_details_input = (req,res) => {

    if(req.userRole != "admin") return res.status(401).json({
        success:false ,
        message:"Unauthorized Access!"
    })
    const { originalname, buffer } = req.file;
    const text = buffer.toString('utf8');
    const rawCases = text.split(/\n\s*\n/);

    // Build array of objects
    const input = rawCases
        .map((block, idx) => ({
        name: `testcase ${idx + 1}`,
        data: block.trim()
        }))
        // (optional) filter out any empty blocks just in case
        .filter(tc => tc.data.length > 0);

    return res.json({
        success: true,
        input:input
    });
}

export const get_details_output = (req,res) => {

    if(req.userRole != "admin") return res.status(401).json({
        success:false ,
        message:"Unauthorized Access!"
    })
    const { originalname, buffer } = req.file;
    const text = buffer.toString('utf8');
    const rawCases = text.split(/\n\s*\n/);

    // Build array of objects
    const output = rawCases
        .map((block, idx) => ({
        name: `testcase ${idx + 1}`,
        data: block.trim()
        }))
        // (optional) filter out any empty blocks just in case
        .filter(tc => tc.data.length > 0);


    return res.json({
        success: true,
        output:output
    });
}

export const save_testcase = async(req,res) => {

    if(req.userRole != "admin") return res.status(401).json({
        success:false ,
        message:"Unauthorized Access!"
    })

    const {response_input,response_output} = req.body;
    const testcases = await Testcase.find({});
    let id;
    if(testcases.length>0)
    {
        let last_testcase_array = testcases.slice(-1);
        let last_testcase = last_testcase_array[0];
        id = last_testcase.problemid+1;
    }
    else{
        id=1;
    }
    const testcase = new Testcase({
        problemid : id ,
        input : response_input.data.input,
        expectedOutput : response_output.data.output,
    })
    await testcase.save();
    return res.status(200).json({
        success:true,
        problemid : testcase.problemid
    });
}

export const delete_testcase = async (req,res) => {

    if(req.userRole != "admin") return res.status(401).json({
        success:false ,
        message:"Unauthorized Access!"
    })

    const {problemid} = req.body;
    await Testcase.findOneAndDelete({problemid:problemid});
    await Testcase.updateMany(
        { problemid: { $gt: problemid } },
        { $inc: { problemid: -1 } }
    );
    res.json({ success: true, message: 'Testcase deleted Successfully!' });
}

export const get_testcase = async (req,res) => {

    const {problemid} = req.body;
    const testcase = await Testcase.findOne({problemid: problemid});
    res.json({
        success:true,
        testcase:testcase
    });
}

export const update_testcase = async (req,res) =>{

    if(req.userRole != "admin") return res.status(401).json({
        success:false ,
        message:"Unauthorized Access!"
    })

    const { problemid } = req.body;
    await Testcase.findOneAndUpdate(
      { problemid },         // find by problemid
      req.body,              // replace with this body
      { new: true }          // return updated document
    );
    return res.json({
        success:true,
        message:"Problem Testcases Updated Successfully!!"
    })
}