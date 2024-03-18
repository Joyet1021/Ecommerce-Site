const wishlistModel = require("../../Models/wishlist");
const cartModel = require("../../Models/cart");

// Controller for adding a product to the wishlist
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
        const Product = await wishlistModel.findOne({ userid: userId });
        const noproduct = Product.productsid;
        const wishlistCount = noproduct ? noproduct.length : 0;
        return res.status(200).json({ success: true, count: wishlistCount, message: 'Added To Wishlist Successfully' });
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// Controller for rendering the wishlist page
exports.wishlistGet = async (req, res) => {
    try {
        let cartCount = 0;
        let wishlistCount = 0;
        let nouser = false;
        if (!req.session.user) {
            nouser = true;
            return res.render('user/wishlist', { nouser, wishlistCount, cartCount });
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
        const products = productIds.productsid;
        wishlistCount = products.length;
        const productids = await cartModel.findOne({ userid: userId })
        cartCount = productids.productsid.length;

        // Render the wishlist page with the fetched data
        res.render('user/wishlist', { nouser, productIds, products, wishlistCount, cartCount });

    } catch (error) {
        console.error('Error in wishlistGet', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

// Controller for deleting a product from the wishlist
exports.deleteWishlist = async (req, res) => {
    try {
        const product = req.query.id;
        const userId = req.session.user._id;
        await wishlistModel.findOneAndUpdate(
            { userid: userId },
            { $pull: { productsid: { productid: product } } },
            { new: true }
        );
        const Product = await wishlistModel.findOne({ userid: userId });
        const noproduct = Product.productsid;
        const wishlistCount = noproduct ? noproduct.length : 0;

        // Check if the wishlist is empty and return the appropriate response
        if (wishlistCount == 0) {
            return res.json({ success: true, productExist: false, count: wishlistCount });
        }
        res.json({ success: true, produtExist: true, count: wishlistCount });
    } catch (error) {
        console.error('Error deleting product from cart:', error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};