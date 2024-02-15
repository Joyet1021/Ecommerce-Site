const mongoose=require('mongoose')

const schema={
    categoryName:{
        type:String,
    },
    subCategory:{
        type:Array
        
        
    }

}

const categorySchema= new mongoose.Schema(schema)
const categoryModel= new mongoose.model('category',categorySchema)

module.exports=categoryModel