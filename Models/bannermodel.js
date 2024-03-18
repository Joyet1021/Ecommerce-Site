const mongoose=require('mongoose')

const schema={
    bannerImage:{
        type:String,
        required:true
    },
    bannerName:{
        type:String,
        required:true
    },
    startDate:{
        type:Date,
        default:()=>new Date()
    },
    endDate:{
        type:Date,
        require:true
    }
}



const bannerSchema=new mongoose.Schema(schema)
bannerSchema.index({endDate:1},{expireAfterSeconds:0});
const bannerModel=mongoose.model("Bannerdatas",bannerSchema)

module.exports=bannerModel;