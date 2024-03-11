const categoryModel = require("../../Models/categories");
const productModel = require("../../Models/productdetails");
const bannerModel = require("../../Models/bannermodel");
const cartModel = require("../../Models/cart");
const wishlistModel = require("../../Models/wishlist");
const { Redirect } = require("twilio/lib/twiml/VoiceResponse");

// Controller for rendering the user's home page
exports.userhomeGet = async (req, res) => {
    try {
        // Fetch all products, categories, and banners
        const productDetails = await productModel.find();
        const categoryDetails = await categoryModel.find();
        const bannerDetails = await bannerModel.find();

        // Initialize variables for user-specific data
        let wishlist = null;
        let cartCount = 0;
        let wishlistCount = 0;

        // Check if user is logged in
        const userId = req.session.user ? req.session.user._id : null;
        if (userId) {
            // Fetch user's wishlist and cart details
            wishlist = await wishlistModel.findOne({ userid: userId });
            const cart = await cartModel.findOne({ userid: userId });

            // Update cart and wishlist counts
            cartCount = cart ? cart.productsid.length : 0;
            wishlistCount = wishlist ? wishlist.productsid.length : 0;
        }

        // Render the user's home page with the fetched data
        res.render('user/userhome', { productDetails, categoryDetails, bannerDetails, wishlist, userId, cartCount, wishlistCount });

    } catch (error) {
        console.log('Error in home Page', error);
        res.status(404).json({ success: false });
    }
}

// Controller for viewing a product
exports.viewProduct = async (req, res) => {
    try {
        let productId = req.query.id;
        const userId = req.session.user ? req.session.user._id : null;
        let cartCount = 0;
        let wishlistCount = 0;
        // Check if user is logged in
        if (userId) {
            const userExist = await cartModel.findOne({ userid: userId });
            if (userExist) {
                // Fetch product details and related products
                const product = await productModel.findById(productId);
                let productExist = false;
                userExist.productsid.forEach((product) => {
                    if (product.productid == productId) {
                        productExist = true;
                    }
                });
                const relatedProducts = await productModel.find({ category: product.category }).limit(15);

                // Update cart and wishlist counts
                const productids = await cartModel.findOne({ userid: userId });
                const productIds = await wishlistModel.findOne({ userid: userId });
                wishlistCount = productIds ? productIds.productsid.length : 0;
                cartCount = productids ? productids.productsid.length : 0;

                // Render the product view page with the fetched data
                res.render('user/viewproduct', { product, relatedProducts, productExist, cartCount, wishlistCount });
                return;
            }
        }

        // Fetch product details and related products
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).render('error', { message: 'Product not found' });
        }
        const relatedProducts = await productModel.find({ category: product.category }).limit(15);

        // Render the product view page with the fetched data
        const productExist = false;
        res.render('user/viewproduct', { product, relatedProducts, productExist, cartCount, wishlistCount });

    } catch (error) {
        console.error('Error in viewProduct', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
}

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

// Controller for handling the buy now functionality
exports.buynowpost = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
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

// Controller for fetching products based on category
exports.categoryGet = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        const categoryName = req.query.catid;
        const category = await productModel.find({ category: categoryName });
        const categoryDetails = await categoryModel.find();
        let wishlist = await wishlistModel.findOne({ userid: userId });
        let cartCount = 0;
        let wishlistCount = 0;
        if (userId) {
            const productids = await cartModel.findOne({ userid: userId });
            if (productids !== null) {
                cartCount = productids.productsid.length;
            }
            const productIds = await wishlistModel.findOne({ userid: userId });
            if (productIds !== null) {
                wishlistCount = productIds.productsid.length;
            }
        }

        res.render("user/categoryproducts", { category, categoryDetails, wishlist, cartCount, wishlistCount });

    } catch (error) {
        console.error("Error in categoryGet controller:", error);
        res.status(500).send("Internal Server Error");
    }
}

// Controller for fetching products based on subcategory
exports.subCategory = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        const subcategoryName = req.query.subid;
        const subcategory = await productModel.find({ subcategory: subcategoryName });
        const categoryDetails = await categoryModel.find();
        let wishlist = await wishlistModel.findOne({ userid: userId });
        let cartCount = 0;
        let wishlistCount = 0;
        if (userId) {
            const productids = await cartModel.findOne({ userid: userId });
            if (productids !== null) {
                cartCount = productids.productsid.length;
            }
            const productIds = await wishlistModel.findOne({ userid: userId });
            if (productIds !== null) {
                wishlistCount = productIds.productsid.length;
            }
        }

        res.render("user/subcategory", { subcategory, categoryDetails, wishlist, cartCount, wishlistCount });

    } catch (error) {
        console.error("Error in subCategory controller:", error);
        res.status(500).send("Internal Server Error");
    }
}

   // Controller for fetching all products
exports.allProducts = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        let wishlist = await wishlistModel.findOne({ userid: userId });
        const categoryDetails = await categoryModel.find();
        let products = await productModel.find({});

        let cartCount = 0;
        let wishlistCount = 0;
        if (userId) {
            const productids = await cartModel.findOne({ userid: userId });
            if (productids !== null) {
                cartCount = productids.productsid.length;
            } else {
                cartCount = 0;
            }
            const productIds = await wishlistModel.findOne({ userid: userId });
            if (productIds !== null) {
                wishlistCount = productIds.productsid.length;
            } else {
                wishlistCount = 0;
            }
        }

        // Render the all products page with the fetched data
        res.render('user/allproducts', { products, categoryDetails, wishlist, cartCount, wishlistCount });


    } catch (error) {
        console.error("Error in allProducts controller:", error);
        res.status(500).send("Internal Server Error");
    }
}

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
        wishlistCount = productids.productsid.length;

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

// Controller for filtering products based on category and price
exports.filterproducts = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        let wishlist = userId ? await wishlistModel.findOne({ userid: userId }) : null;
        const category = req.query.category !== undefined ? req.query.category : null;
        const price = req.query.price !== undefined ? req.query.price : null;
        const sort=req.query.sortOrder?req.query.sortOrder:null;
        const categoryDetails = await categoryModel.find();
        console.log(price, category, 'lokix');
        let products = await productModel.find();
        console.log(sort,'hfhf');

        
        if (category !== null && price === 'null' ? price : null) {
            products = await productModel.find({ category: category });
        } else if (price !== null && category === 'null' ? category : null) {
            const prices = price.split(",");
            const less = parseInt(prices[0]);
            const greater = parseInt(prices[1]);
            products = await productModel.find({ discount: { $gte: less, $lte: greater } });
        } else if (category !== null && price !== null) {
            const prices = price.split(",");
            const less = parseInt(prices[0]);
            const greater = parseInt(prices[1]);
            products = await productModel.find({ category: category, discount: { $gte: less, $lte: greater } });
        } else {
            products = await productModel.find();
        }
        

        // Return the filtered products
        return res.status(200).json({success: true,message: "filtered",product: products,wishlist: wishlist,categoryDetails: categoryDetails});

    } catch (error) {
        console.error('Error filtering products:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
// Controller for filtering products based on price
exports.filterprice = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        let wishlist = userId ? await wishlistModel.findOne({ userid: userId }) : null;
        const sort = req.query.sortOrder ? req.query.sortOrder : null;
        const categoryDetails = await categoryModel.find();
        let products = await productModel.find();

        if (sort == 'lowtohigh') {
            products = products.sort((a, b) => a.discount - b.discount);
        } else if (sort == 'hightolow') {
            products = products.sort((a, b) => b.discount - a.discount);
        }

        return res.status(200).json({
            success: true,
            message: "filtered",
            products: products,
            wishlist: wishlist,
            categoryDetails: categoryDetails
        });

    } catch (error) {
        console.error('Error filtering products:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Controller for handling product search
exports.searchGet = async (req, res) => {
    try {
        const Name = req.query.product;
        const categoryDetails = await categoryModel.find();
        const products = await productModel.find({
            productName: { $regex: Name, $options: 'i' },
        });
        const userId = req.session.user ? req.session.user._id : null;
        let wishlist = await wishlistModel.findOne({ userid: userId });
        let cartCount = 0;
        let wishlistCount = 0;
        if (userId) {
            const productids = await cartModel.findOne({ userid: userId });
            cartCount = productids ? productids.productsid.length : 0;
            const productIds = await wishlistModel.findOne({ userid: userId });
            wishlistCount = productIds ? productIds.productsid.length : 0;
        }
        res.render('user/allproducts', { products, categoryDetails, wishlist, cartCount, wishlistCount });
    } catch (error) {
        console.error('Error in searchGet controller:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};
