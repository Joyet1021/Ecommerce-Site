const mongoose=require("mongoose")

const schema={
    image:{
        type:String,
        required:true
    },
    productName:{
        type:String,
        required:true
    },
    category:{
        type:String,
    },
    description:{
        type : String,
        required:true
    },
    price:{
        type:String,
        required: true
    },
    quantity:{
        type:String,
        required:true
    },
    discount:{
        type:String,
        required:true
    }
    


}


const productSchema=new mongoose.Schema(schema)
const productModel=new mongoose.model('ProductDatas',productSchema)
module.exports = productModel;