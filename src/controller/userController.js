
const categoryModel = require("../../Models/categories");
const productModel=require("../../Models/productdetails")
const bannerModel=require("../../Models/bannermodel");
const cartModel=require("../../Models/cart");
const { Redirect } = require("twilio/lib/twiml/VoiceResponse");

exports.userhomeGet = async (req, res) => {
    try {
        const productDetails = await productModel.find();
        const categoryDetails = await categoryModel.find();
        const bannerDetails = await bannerModel.find();
        let noUser = false;
        const userId = req.session.user ? req.session.user._id : null;
        let productCount = 0; // Initialize productCount variable

       
        res.render('user/userhome', { productDetails, categoryDetails, bannerDetails, productCount });
    } catch (error) {
        console.log('Error in home Page', error);
        res.status(404).json({ success: false });
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
                if (product.productid == productId) {
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
                if (product.productid == productId) {
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

        let userCart = await cartModel.findOne({ userid: userId });

        if (!userCart) {
            userCart = await new cartModel({
                userid: userId,
                productsid: []
            }).save();
        }

        const productIds = await cartModel.findOne({ userid: userId }).populate('productsid.productid');
        
        const products = productIds.productsid;
        const cartCount = products.length;
        
        res.render('user/cart', { nouser, productIds, products, cartCount });

    } catch (error) {
        console.error('Error in cartGet', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.updateCartQty = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const quantity = parseInt(req.query.qty);
        const productId = req.query.id;

        const cart = await cartModel.findOne({ userid: userId });

        const productIndex = cart.productsid.findIndex(product => product.productid == productId);
        if (productIndex !== -1) {
            cart.productsid[productIndex].quantity = quantity;
        }
        await cart.save();
        return res.status(200).json({ success: true, data: "quantity changed successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};


    



exports.deleteCartProduct = async (req, res) => {
    try {
        const product = req.query.id;
        const userId = req.session.user._id;
        await cartModel.findOneAndUpdate(
            { userid: userId },
            { $pull: { productsid: { productid: product } } },
            { new: true }
        );        
        const Product=await  cartModel.findOne({userid:userId})
        const noproduct=Product.productsid;
        const cartCount=noproduct?noproduct.length:0;
        
        if(cartCount==0){
            return res.json({ success: true ,productExist:false,count:cartCount });
        }
        res.json({ success: true ,produtExist:true,count:cartCount});
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