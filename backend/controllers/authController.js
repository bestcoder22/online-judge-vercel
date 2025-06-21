import User from "../models/User.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config();

export const login = async (req,res) => {
    const user = await User.findOne({email: req.body.email});
    if(user){
        if(req.body.password === user.password){
            const token = jwt.sign({id : user._id , role : user.role}, process.env.JWT_SECRET);
            res.cookie("access_token",token,{
                httpOnly: true,
                secure: true,         // only send over HTTPS
                sameSite: "None",     // required if frontend & backend are on different domains
                maxAge: 7 * 24 * 60 * 60 * 1000, // optional: 7 days
            })
            return res.status(200).json({success:true , message:"Successfully Logged In"});
        }
        else{
            return res.json({success:false , message:"Wrong Password!!", errors:"Wrong Password!!"});
        }
    }
    else{
        return res.json({success:false , message:"User Not Found", errors:"Email not registered!!"});
    }
}

export const signup = async(req,res) => {

    const user = await User.findOne({email: req.body.email});
    if(user){
        return res.json ({success:false , message:"Email already exists" , errors:"User already exists!"});
    }
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password : req.body.password,
    })

    await newUser.save();

    return res.status(200).json({success:true, message: "User registered successfully" });
}

export const logout = async (req,res) => {
    res.clearCookie("access_token", {
        httpOnly:true
    });
    return res.status(200).json({success:true, message:"Logged Out Successfully!"});
}


export const me = async (req,res) => {
    res.json({
        success : true,
        id : req.userId,
        role : req.userRole
    })
}

export const get_user = async (req,res) => {
    const {userid} = req.body;
    const user = await User.findOne({_id:userid});
    return res.json({
        success:true,
        user
    })
}

export const update_avatar = async (req,res) => {
    const userId = req.body.userId;
    const avatarfile = req.file.filename;
    const user = await User.findOne({_id:userId});
    user.avatar_path=`/avatar/${avatarfile}`;
    await user.save();
    return res.json({
        success:true,
        message:"Avatar Updated Successfully!"
    })

}

export const save_submission = async (req,res) => {
    const {userid,problemid,code,status,time_complexity,space_complexity} = req.body;
    const user = await User.findOne({_id:userid});
    
    user.submissions.push({
        problemid,
        code,
        status,
        time_complexity,
        space_complexity
    });
    await user.save();
    return res.json({
        success:true,
        message:"Submission saved Successfully!"
    })
}

export const get_submissions = async (req,res) => {
    const {userid} = req.body;
    const user = await User.findOne({_id:userid});
    const submission_details = user.submissions;
    const submissionsMap = new Map();

    for (let i = 0; i < submission_details.length; i++) {
      const current = submission_details[i];
      const existing = submissionsMap.get(current.problemid);

      if (existing) {
        if (current.status === "Accepted") {
          existing.status = "Accepted";
        }
      } else {
        submissionsMap.set(current.problemid, {
          problemid: current.problemid,
          status: current.status === "Accepted" ? "Accepted" : "Attempted",
          id: current._id,
        });
      }
    }

    const submissions = Array.from(submissionsMap.values());

    return res.json({
        success:true,
        submissions
    })
}

export const get_leaderboard = async(req,res) => {
    const users = await User.find({});
    const leaderboard = [];

    for (let user of users) {
      const solvedSet = new Set();

      for (let sub of user.submissions) {
        if (sub.status === "Accepted") {
          solvedSet.add(sub.problemid.toString()); // ensures uniqueness
        }
      }

      leaderboard.push({
        username: user.username,
        problemsSolved: solvedSet.size,
      });
    }

    // Optional: sort leaderboard by problems solved (descending)
    leaderboard.sort((a, b) => b.problemsSolved - a.problemsSolved);

    return res.json({
      success: true,
      message: "Leaderboard fetched successfully",
      leaderboard: leaderboard,
    });

}