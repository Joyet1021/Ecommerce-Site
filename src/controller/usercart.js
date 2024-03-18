const cartModel = require("../../Models/cart");
const wishlistModel = require("../../Models/wishlist");

// Controller for adding a product to the cart
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
                productsid: [],
                color: color,
                size: size
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

// Controller for rendering the cart page
exports.cartGet = async (req, res) => {
    try {
        let cartCount = 0;
        let wishlistCount = 0;
        let nouser = false;
        if (!req.session.user) {
            nouser = true;
            return res.render('user/cart', { nouser, cartCount, wishlistCount });
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
        cartCount = products.length;
        const productids = await wishlistModel.findOne({ userid: userId });
        wishlistCount = productids?productids.productsid.length:0;

        // Render the cart page with the fetched data
        res.render('user/cart', { nouser, productIds, products, cartCount, wishlistCount });

    } catch (error) {
        console.error('Error in cartGet', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

// Controller for updating the quantity of a product in the cart
exports.updateCartQty = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const quantity = parseInt(req.query.qty);
        const productId = req.query.id;

        const cart = await cartModel.findOne({ userid: userId });

        // Update the quantity of the specified product in the cart
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

// Controller for deleting a product from the cart
exports.deleteCartProduct = async (req, res) => {
    try {
        const product = req.query.id;
        const userId = req.session.user._id;
        await cartModel.findOneAndUpdate(
            { userid: userId },
            { $pull: { productsid: { productid: product } } },
            { new: true }
        );
        const Product = await cartModel.findOne({ userid: userId });
        const noproduct = Product.productsid;
        const cartCount = noproduct ? noproduct.length : 0;

        // Check if the cart is empty and return the appropriate response
        if (cartCount == 0) {
            return res.json({ success: true, productExist: false, count: cartCount });
        }
        res.json({ success: true, produtExist: true, count: cartCount });
    } catch (error) {
        console.error('Error deleting product from cart:', error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
