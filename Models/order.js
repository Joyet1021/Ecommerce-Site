const mongoose=require('mongoose')

const schema={
    userid:{
        type:String,
        required:true
    },
    productsid:{
        type:String
    },
    address:{
        type:String
    },
    total:{
        type:String
    }

}

const orderSchema= new mongoose.Schema(schema)
const orderModel= new mongoose.model('orderdetails',orderSchema)

module.exports=orderModel