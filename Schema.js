const mongoose = require('mongoose');

const BlogDetailsSchema = new mongoose.Schema({
    title:{
         type: String
    },
    content:{
        type: String
    },
    imageUrl: {
        type: String
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    userID:{
        type: String
    }
},{versionKey:false});

const  userDetailsSchema = new mongoose.Schema({
    username:{
        type: String
    },
    email:{
        type: String
    },
    password:{
        type: String
    }
},{versionKey:false});

const Blogs = mongoose.model('BlogDetails', BlogDetailsSchema);
const User = mongoose.model('UserDetails',userDetailsSchema);
module.exports={Blogs,User};
