import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const verifyToken = (req,res,next) =>{
    const token = req.cookies.access_token;
    if (!token) {
        return res.json({ message: "Access denied. No token provided." });
    }
    try{
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = data.id;
        req.userRole = data.role;
        return next();
    }
    catch(error){
        return res.status(403).json({ message: "Invalid or expired token." });
    }
}

export default verifyToken;