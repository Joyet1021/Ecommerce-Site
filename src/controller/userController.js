
const categoryModel = require("../../Models/categories");
const productModel=require("../../Models/productdetails")
const bannerModel=require("../../Models/bannermodel");
const cartModel=require("../../Models/cart");
const { Redirect } = require("twilio/lib/twiml/VoiceResponse");


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
exports.viewProduct = async (req, res) => {
    try {
        let productId = req.query.id;
        const userId = req.session.user ? req.session.user._id : null;
        if(userId){
            const userExist = await cartModel.findOne({ userid: userId });
            if (userExist) {
                const product = await productModel.findById(productId);
                const productExist = userExist.productid.includes(productId);
                const relatedProducts = await productModel.find({ category: product.category }).limit(15);
                res.render('user/viewproduct', { product, relatedProducts, productExist });
                return;
            }
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).render('error', { message: 'Product not found' });
        }
        const relatedProducts = await productModel.find({ category: product.category }).limit(15);
        const productExist=false;
        res.render('user/viewproduct', { product, relatedProducts,productExist });
    } catch (error) {
        console.error('Error in viewProduct', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
}
exports.cartGet = async (req, res) => {
    try {
        let nouser = false;

        // Redirect unauthenticated users to login
        if (!req.session.user) {
            nouser = true;
            return res.render('user/cart', { nouser });
        }

        const productId = req.query.productId;
        const userId = req.session.user._id;

        let userexistCart = await cartModel.findOne({ userid: userId });

        if (!userexistCart) {
            userexistCart = await new cartModel({
                userid: userId,
                productid: []
            }).save();
        }

        if (productId) {
            const productIndex = userexistCart.productid.indexOf(productId);
            if (productIndex === -1) {
                userexistCart.productid.unshift(productId);
                await userexistCart.save();
            }
        }

        const cartProducts = await cartModel.findOne({ userid: userId });
        const productIds = cartProducts.productid;
        const products = await productModel.find({ _id: { $in: productIds } });
        res.render('user/cart', { products, nouser });

    } catch (error) {
        console.error('Error in cartGet', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.buyProduct=async(req,res)=>{
    try{
        let id=req.query.id;
        console.log(id,"this is the id of the product");
    }catch{

    }
}