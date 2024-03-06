const mongoose=require('mongoose')

const schema={
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    productsid:[{
        productid:{type:mongoose.Schema.Types.ObjectId,ref:'productdatas' },
        quantity:{
            type:Number,
            _id:false
        },
        color:{
            type:String
        },
        size:{
            type:String
        } 
    }],
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
        default:'Confirmed'
    }

}

const orderSchema= new mongoose.Schema(schema)
const orderModel= new mongoose.model('orderdetails',orderSchema)

module.exports=orderModel