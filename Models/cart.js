const mongoose=require('mongoose')

const schema={
    userid:{
        type:String,
    },
    productid:{
        type:Array
    }

}

const cartSchema= new mongoose.Schema(schema)
const cartModel= new mongoose.model('cartDetails',cartSchema)

module.exports=cartModel