
const categoryModel = require("../../Models/categories");
const productModel=require("../../Models/productdetails")
const bannerModel=require("../../Models/bannermodel")


exports.userhomeGet=async(req,res)=>{
    try{
        const productDetails=await productModel.find();
        const categoryDetails=await categoryModel.find();
        const bannerDetails=await bannerModel.find();
        
        res.render('user/userhome',{productDetails,categoryDetails,bannerDetails});
    }catch(error){
        console.log('Error in Edit Coupon Page', error);
        res.status(404).json({success:false});
    }
}

exports.viewProduct=async(req,res)=>{
    try{
        let id=req.query.id;
        const product=await productModel.findById(id)
        const relatedProducts=await productModel.find({category:product.category}).limit(15)
        res.render('user/viewproduct', {product,relatedProducts}) 
    }catch{

    }

}

exports.cartGet=async(req,res)=>{
    try{
        

    }catch{

    }
}

exports.buyProduct=async(req,res)=>{
    try{
        let id=req.query.id;
        console.log(id,"this is the id of the product");
    }catch{

    }
}