
const categoryModel = require("../../Models/categories");
const productModel=require("../../Models/productdetails")
const bannerModel=require("../../Models/bannermodel");
const cartModel=require("../../Models/cart");
const wishlistModel=require("../../Models/wishlist")
const { Redirect } = require("twilio/lib/twiml/VoiceResponse");

exports.userhomeGet = async (req, res) => {
    try {
        const productDetails = await productModel.find();
        const categoryDetails = await categoryModel.find();
        const bannerDetails = await bannerModel.find();
        let noUser = false;
        const userId = req.session.user ? req.session.user._id : null;
        let productCount = 0;
        const { ObjectId } = require('mongoose');
        let wishlist=await wishlistModel.findOne(({userid:userId}));
        let cartCount=0;
        let wishlistCount=0;
        if(userId){
            const productids = await cartModel.findOne({ userid: userId });
            console.log(productids,"puo");
            if(productids !== null){ // Corrected check for null
                cartCount = productids.productsid.length;
            } else {
                cartCount = 0;
            }
            const productIds = await wishlistModel.findOne({ userid: userId });
            if(productIds !== null){ // Corrected check for null
                wishlistCount = productIds.productsid.length; // Changed from productids to productIds
            } else {
                wishlistCount = 0;
            }
        }
        res.render('user/userhome', { productDetails, categoryDetails, bannerDetails, wishlist, productCount, userId, ObjectId, cartCount, wishlistCount });        
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
                let cartCount=0;
                let wishlistCount=0;
                if(userExist){
                    const productids = await cartModel.findOne({ userid: userId })
                    const productIds = await wishlistModel.findOne({ userid: userId })
                    wishlistCount = productIds.productsid.length;
                    cartCount = productids.productsid.length;
                }
                
                res.render('user/viewproduct', { product, relatedProducts, productExist,cartCount,wishlistCount });
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
        const color = req.query?.color || ''; 
        const size = req.query?.size || ''; 

        let userExistCart = await cartModel.findOne({ userid: userId });

        if (!userExistCart) {
            userExistCart = await new cartModel({
                userid: userId,
                productsid:[],
                color:color,
                size:size
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
                userExistCart.productsid.unshift({ productid: productId, quantity: 1, color: color, size: size });
                await userExistCart.save();
            }
        }
        
        return res.status(200).json({ success: true, message: 'Added To Cart Successfully' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.buynowpost = async (req, res) => {
    try {
        const quantity = req.body.quantity;
        const productid = req.query.id;
        const color = req.body?.color || ''; 
        const size = req.body?.size || '';
        res.redirect(`/user/checkout?productid=${productid}&quantity=${quantity}&size=${size}&color=${color}`);
    } catch (error) {
        console.error("Error in buynowpost:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
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
        let cartCount=0;
        let wishlistCount=0;
        const products = productIds.productsid;
        cartCount = products.length;
        const productids = await wishlistModel.findOne({ userid: userId })
        wishlistCount = productids.productsid.length;
            
        res.render('user/cart', { nouser, productIds, products, cartCount,wishlistCount });

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


exports.addtowishlist = async (req, res) => {
    try {
        const userId = req.session?.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const productId = req.query?.productid;
        let userExistCart = await wishlistModel.findOne({ userid: userId });

        if (!userExistCart) {
            userExistCart = await new wishlistModel({
                userid: userId,
                productsid: []
            }).save();
        }

        let productFound = false;
        for (let i = 0; i < userExistCart.productsid.length; i++) {
            if (userExistCart.productsid[i].productid == productId) {
                userExistCart.productsid.splice(i, 1);
                productFound = true;
                break;
            }
        }
        if (!productFound) {
            userExistCart.productsid.unshift({ productid: productId });
        }
        await userExistCart.save();
        const Product=await  wishlistModel.findOne({userid:userId})
        const noproduct=Product.productsid;
        const wishlistCount=noproduct?noproduct.length:0;
        return res.status(200).json({ success: true,count:wishlistCount, message: 'Added To Wishlist Successfully' });
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}




exports.wishlistGet = async (req, res) => {
    try {
        let nouser = false;
        if (!req.session.user) {
            nouser = true;
            return res.render('user/wishlist', { nouser });
        }
        const userId = req.session.user._id;

        let userwishlist = await wishlistModel.findOne({ userid: userId });

        if (!userwishlist) {
            userwishlist = await new wishlistModel({
                userid: userId,
                productsid: []
            }).save();
        }

        const productIds = await wishlistModel.findOne({ userid: userId }).populate('productsid.productid');
        let cartCount=0;
        let wishlistCount=0;
        const products = productIds.productsid;
        wishlistCount = products.length;
        const productids = await cartModel.findOne({ userid: userId })
        cartCount = productids.productsid.length;
        
        res.render('user/wishlist', { nouser, productIds, products, wishlistCount,cartCount });

    } catch (error) {
        console.error('Error in wishlistGet', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};


exports.deleteWishlist = async (req, res) => {
    try {
        const product = req.query.id;
        const userId = req.session.user._id;
        await wishlistModel.findOneAndUpdate(
            { userid: userId },
            { $pull: { productsid: { productid: product } } },
            { new: true }
        );        
        const Product=await  wishlistModel.findOne({userid:userId})
        const noproduct=Product.productsid;
        const wishlistCount=noproduct?noproduct.length:0;
        
        if(wishlistCount==0){
            return res.json({ success: true ,productExist:false,count:wishlistCount });
        }
        res.json({ success: true ,produtExist:true,count:wishlistCount});
    } catch (error) {
        console.error('Error deleting product from cart:', error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

