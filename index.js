const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const {Blogs,User} = require("./Schema");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const cors =  require("cors");
const path = require('path');  // Importing the path module
const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define storage for the images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({ storage: storage });

const port = process.env.PORT || 8080;

async function connectiontodb(){
    try{
        await mongoose.connect(
            "mongodb+srv://priyakoushiik:QT2vRypQt5EwDL1g@triptroves.qyridzv.mongodb.net/TripTrove?retryWrites=true&w=majority&appName=triptroves"
        );
        app.listen(port,()=>{
            console.log("The app is listening in the port no 8080 ...");
        });
    }catch(error){
        console.log(error);
        console.log("connection cannot be established ...");
    }
}

connectiontodb();

const accessKey = "priyakoushiik";
function generateToken(userDetail){
    return jwt.sign(userDetail, accessKey);
}

function authenticateToken(req,res,next){
    try{
        const authHeader = req.headers.authorization;
        const accessToken = authHeader && authHeader.split(" ")[1];
        if(accessToken){
            jwt.verify(accessToken,accessKey,(error , userDetail) => {
                if( error ){
                    console.log(error);
                    res.status(403).json({
                        status: "failure",
                        message: "access denied",
                    });
                } else{
                    next();
                }
            });
        }else{
            res.status(401).json({
                status:"failure",
                message: "access token not found"
            });
        }
    }catch (error) {
        res.status(500).json({});
    }
}

// User functions 

app.post("/addUser", async(req,res)=>{
    try{
        //console.log("Called the api");
        const user = await User.find({email: req.body.email});
        if(user.length === 0){
            const user = await User.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
            });
            const userDetail = {
                username: user.username,
                email: user.email,
                userID: user._id
              };
              const accessToken = generateToken(userDetail);
              res.json({
                status: "success",
                message: "user account created successfully",
                accessToken: accessToken,
                userDetail : userDetail
              });
        }else{
            res.json({
                status:"failed",
                message:"user account not created"
            });
        }
    }
    catch(error){
       res.status(500).json({
        message: "user cannot be created",
        status: "failure"
       });
    }
});

app.post("/validateUser",async (req, res)=>{
    try{
        const user = await User.find({
            email: req.body.email,
            password:req.body.password,
        });
        if(user.length ===0){
            res.status(401).json({
                message:"user does not exists",
                status: "failure",
            });
        }else{
            const userDetail={
                username: user[0].username,
                email: user[0].email,
                password: user[0].password,
                userID: user[0]._id
            }
            const accessToken = generateToken(userDetail);
            res.json({
                message:"entered into the website",
                status: "success",
                accessToken: accessToken,
                userDetail : userDetail
            })
        }
    }catch(error){
      res.status(500).json({
         message:"no user found",
         error: error,
      });
    }
})



app.post("/add-blog/:id",authenticateToken,upload.single('image'),async(req, res)=>{
    try{
        const newBlog = await Blogs.create({
            title: req.body.title,
            content: req.body.content,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
            userID : req.params.id,
        });
        res.json({
            status: "success",
            message: "Blog added successfully.",
            newBlog: newBlog,
        })
    }catch(error){
        res.status(500).json({
            status:"failure",
            message: "Blog entry not added",
            error: error
        });
    }
})



app.get("/get-myblogs/:id", authenticateToken,async(req,res)=>{
    try{
        const myblog = await Blogs.find({"userID": req.params.id}).sort({ createdAt: -1 });
        res.status(200).json(
            myblog
        )
    }catch(error){
        res.status(500).json({
            status: "failure",
            message: "Data cannot be fetched.",
            error: error,
        });
    }
})

app.get("/getting-blog/:id",authenticateToken,async(req,res)=>{
    try{
        const id = req.params.id;
        const val = await Blogs.findById({_id:id})
        res.json(val);
    }catch(error){
       res.status(500).json({
        status:" failure",
        message: "Data cannot be fetched.",
        error: error
       });
    }
})
app.patch("/update-blog/:id",authenticateToken,upload.single('image'), async (req,res)=>{
    try{
        const updatedData = {
            title: req.body.title,
            content: req.body.content,
          };

        if (req.file) {
            updatedData.imageUrl = `/uploads/${req.file.filename}`;
          }
        await Blogs.findByIdAndUpdate(req.params.id,updatedData,{new: true});

        res.status(200).json({
            status: "success",
            message:"entry updated"
        });
    }catch(error){
        res.status(500).json({
            status:  "failure",
            message:"couldn't update entry .",
            error: error,
        });
    }
});

app.delete("/delete-blog/:id",authenticateToken, async(req,res)=>{
    try{
        await Blogs.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status: "success",
            message:"entry deleted"
        });
    }catch (error){
        console.log(error);
    }
});

app.get("/all-blogs",authenticateToken,async(req,res)=>{
    const val = await Blogs.find({}).sort({ createdAt: -1 });
    res.json(val);
})


  