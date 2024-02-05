const mongoose=require("mongoose")

const schema={
    username:{type:String,required:true},
    email:{type:String,required:true},
    phonenumber:{type:String,required:true},
    password:{type:String,required:true},
    role:{type:String,required:true},
    verified:{type:Boolean}
}



const signupSchema=new mongoose.Schema(schema)
const signupModel=new mongoose.model('signupData',signupSchema)
module.exports=signupModel