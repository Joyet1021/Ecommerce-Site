const mongoose=require('mongoose')

const schema={
    userid:{
        type:String,
    },
    productsid:[{
        productid:String,
        quantity:{
            type:Number,
            default:1
        }
    }]

}

const cartSchema= new mongoose.Schema(schema)
const cartModel= new mongoose.model('cartDetails',cartSchema)

module.exports=cartModel