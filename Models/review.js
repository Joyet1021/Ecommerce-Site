const mongoose=require("mongoose")

const schema={
    productid:{type:String,required:true},
    reviews:[{
        userid:{type:String,required:true},
        review:{type:String,required:true},
        rating:{type:Number,required:true}
    }]
    
    
}
const reviewSchema=new mongoose.Schema(schema)
const reviewModel=new mongoose.model('reviewdata',reviewSchema)
module.exports=reviewModel