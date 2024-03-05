const mongoose=require('mongoose')

const schema={
    userid:{
        type:String,
        required:true
    },
    productsid:{
        type:Array
    },
    paymentmethod:{
        type:String,
    },
    address:{
        type:Object
    },
    total:{
        type:String
    },
    orderdate:{
        type:Date,
        default:new Date()
    },
    status:{
        type:String,
        default:'pending'
    }

}

const orderSchema= new mongoose.Schema(schema)
const orderModel= new mongoose.model('orderdetails',orderSchema)

module.exports=orderModel