const mongoose=require("mongoose");
const { array } = require("../src/middlewares/multerMiddleware");
const mongoosePaginate = require('mongoose-paginate-v2');

const schema={
    productImage:{
        type:Array,
        required:true
    },
    productName:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    subcategory:{
        type:String,
        required:true
    },
    size:{
        type:[String]
    },
    color:{
        type:[String]
    },
    return:{
        type:Boolean,
        default:false
    },
    deliverydate:{
        type:String,
        required:true
    },
    description:{
        type : String,
        required:true
    },
    price:{
        type:Number,
        required: true
    },
    quantity:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        required:true
    }
    


}


const productSchema=new mongoose.Schema(schema)
productSchema.plugin(mongoosePaginate);
const productModel=new mongoose.model('productdatas',productSchema)
module.exports = productModel;