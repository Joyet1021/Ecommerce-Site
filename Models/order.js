const mongoose=require('mongoose')

const schema={
    userid:{
        type:String,
        required:true
    },
    productsid:[{
        productid:{type:mongoose.Schema.Types.ObjectId,ref:'productdatas' },
        quantity:{
            type:Number,
            _id:false
        }
    }],
    total:{
        type:String
    }

}

const orderSchema= new mongoose.Schema(schema)
const orderModel= new mongoose.model('orderdetails',orderSchema)

module.exports=orderModel