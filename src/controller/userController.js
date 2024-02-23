
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
                let productExist = false;
                userExist.productsid.forEach((product) => {
                if (product.productid === productId) {
                    productExist = true;
                }
            });
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

exports.addtoCart = async (req, res) => {
    try {
        console.log(req.body);
        const userId = req.session?.user._id;
        if (!userId) {
            res.status(401).json('not')
        }

        const productId = req.query?.productid;

        let userExistCart = await cartModel.findOne({ userid: userId });

        if (!userExistCart) {
            userExistCart = await new cartModel({
                userid: userId,
                productsid:[]
            }).save();
        }

        if (productId) {
            let productFound = false;
            userExistCart.productsid.forEach((product) => {
                if (product.productid === productId) {
                    productFound = true;
                }
            });
        
            if (!productFound) {
                userExistCart.productsid.unshift({ productid: productId, quantity: 1 });
                await userExistCart.save();
            }
        }
        
        return res.status(200).json({ success: true, message: 'Added To Cart Successfully' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.cartGet = async (req, res) => {
    try {
        let nouser = false;
        if (!req.session.user) {
            nouser = true;
            return res.render('user/cart', { nouser });
        }
        const userId = req.session.user._id;

        let userexistCart = await cartModel.findOne({ userid: userId });

        if (!userexistCart) {
            userexistCart = await new cartModel({
                userid: userId,
                productid: []
            }).save();
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


exports.deleteCartProduct = async (req, res) => {
    try {
        const product = req.query.id;
        const userId = req.session.user._id;
        await cartModel.findOneAndUpdate(
            { userid: userId },
            { $pull: { productid: product } }, 
            { new: true }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product from cart:', error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};


exports.buyProduct=async(req,res)=>{
    try{
        let id=req.query.id;
        console.log(id,"this is the id of the product");
    }catch{

    }
}