import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role: {
        type: String, 
        enum: ['user','admin'], 
        default: 'user' 
    },
    avatar_path:{
        type:String,
        default: '/avatar/default-avatar.jpg'
    },
    submissions:[
        {
            problemid : {type:Number,required:true},
            code : {type:String , required:true},
            status : {type:String, required:true},
            time_complexity : {type:String , required:true, default:"N/A"},
            space_complexity : {type:String , required:true, default:"N/A"}
        }
    ]
})

const User = mongoose.model('user', UserSchema);

export default User;