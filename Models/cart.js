const mongoose=require('mongoose')

const schema={
    userid:{
        type:mongoose.Schema.Types.ObjectId
    },
    productsid:[{
        productid:{type:mongoose.Schema.Types.ObjectId,ref:'productdatas' },
        quantity:{
            type:Number,
            _id:false
        }
    }]

}

const cartSchema= new mongoose.Schema(schema)
const cartModel= new mongoose.model('cartDetails',cartSchema)

module.exports=cartModel