const express=require('express')
const mongoose=require('mongoose')
const session=require('express-session')
const dotenv=require('dotenv').config()
const secretkey=process.env.secret
const flash = require("connect-flash")

const port=process.env.PORT||7001
const app=express()

app.use(express.urlencoded({extended:true}))
app.use(express.json())


app.use(session({
    secret:secretkey,
    resave:true,
    saveUninitialized:false
}))

const userRouter=require("./src/router/user")
const adminRouter=require("./src/router/admin")

app.use(express.static("public"))

app.set("view engine","ejs")
app.set("views", "view");

app.use(flash());

app.use("/admin",adminRouter)
app.use("/user",userRouter)

mongoose.connect('mongodb://localhost:27017/mainproject')
.then(()=>console.log("database connected"))
.catch((err)=>console.log("database error"))

app.listen(port,()=>{
    console.log("server started",port);
})