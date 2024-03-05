const mongoose=require("mongoose");
const { array } = require("../src/middlewares/multerMiddleware");

const schema={
    userId:{
        type:String
    },
    userImage:{
        type:String,
        
    },
    userName:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        
    },
    lastName:{
        type:String,
        
    },
    email:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    dateofBirth:{
        type:Date,
        
    },
    country:{
        type:String,
        
    },
    district:{
        type:String,
        
    },
    state:{
        type:String
    },
    landMark:{
        type:String,
        
    },
    zip:{
        type:Number
    },
    Address:{
        type:String,
        
    },
    newAddress:[{
        firstName:{
            type:String
        },
        lastName:{
            type:String
        },
        phoneNumber:{
            type:String
        },
        email:{
            type:String
        },
        country:{
            type:String
        },
        state:{
            type:String
        },
        district:{
            type:String
        },
        zip:{
            type:String
        },
        Address:{
            type:String
        }
    }]

}


const profileSchema=new mongoose.Schema(schema)
const profileModel=new mongoose.model('userprofile',profileSchema)
module.exports = profileModel;