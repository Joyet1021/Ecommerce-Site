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

const wishlistSchema= new mongoose.Schema(schema)
const wishlistModel= new mongoose.model('wishlistdetails',wishlistSchema)

module.exports=wishlistModel