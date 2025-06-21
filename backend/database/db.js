import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const DBConnection = async () => {
    const mongo_uri=process.env.MONGO_URI;
    try{
        await mongoose.connect(mongo_uri);
        console.log("Connected to MongoDB Successfully");
    }
    catch(error){
        console.error("Error in connecting MongoDB",error);
    }
}
export default DBConnection;