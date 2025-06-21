import Problem from "../models/Problem.js"
import axios from 'axios';
export const addproblem = async (req,res) => {

    if(req.userRole != "admin") return res.status(401).json({
        success:false ,
        message:"Unauthorized Access!"
    })
    // const {problemid , tag , title , description} = req.body;
    const problem = new Problem(req.body);
    await problem.save();
    return res.status(200).json({success : true , message:"Problem Added Successfully!!"});
}

export const getproblems = async (req,res) => {
    const problems =  await Problem.find({});
    return res.json({success:true , message:"All problems Fetched Seuccessfully!", problems:problems});
}

export const deleteproblem = async (req,res) => {

    if(req.userRole != "admin") return res.status(401).json({
        success:false ,
        message:"Unauthorized Access!"
    })

    const { problemid }= req.body;
    await Problem.findOneAndDelete({problemid:problemid});
    
    
    await Problem.updateMany(
      { problemid: { $gt: problemid } },
      { $inc: { problemid: -1 } }
    );
    return res.status(200).json({ success: true, message: 'Problem deleted Successfully!' });

}
export const update_problem = async (req,res) =>{

    if(req.userRole != "admin") return res.status(401).json({
        success:false ,
        message:"Unauthorized Access!"
    })

    const { problemid } = req.body;
    await Problem.findOneAndUpdate(
      { problemid },         // find by problemid
      req.body,              // replace with this body
      { new: true }          // return updated document
    );
    return res.json({
        success:true,
        message:"Problem Info Updated Successfully!!"
    })
}

export const get_problem = async (req,res) => {
    const {problemid} = req.body;
    const problem = await Problem.findOne({problemid: problemid});
    res.json({
        success:true,
        problem:problem
    });
}