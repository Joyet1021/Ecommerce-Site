const mongoose=require('mongoose')

const schema={
    categoryName:{
        type:String,
        unique:true
    },
    subCategory:{
        type:[String],
        unique:true
    }

}

const categorySchema= new mongoose.Schema(schema)
const categoryModel= new mongoose.model('category',categorySchema)

module.exports=categoryModel