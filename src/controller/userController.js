const categoryModel = require("../../Models/categories");
const productModel = require("../../Models/productdetails");
const bannerModel = require("../../Models/bannermodel");
const cartModel = require("../../Models/cart");
const wishlistModel = require("../../Models/wishlist");
const reviewModel=require('../../Models/review')
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
        let totalrating=0;
        let review = []; // Initialize review as an empty array
         // Fetch reviews for the product
         review = await reviewModel.findOne({ productid: productId });
         if(review){
            review.reviews.forEach((item)=>{
                totalrating+=item.rating
            });
        }

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
                return res.render('user/viewproduct', { product, relatedProducts, productExist, cartCount, wishlistCount, review,totalrating });
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
        return res.render('user/viewproduct', { product, relatedProducts, productExist, cartCount, wishlistCount, review ,totalrating});

    } catch (error) {
        console.error('Error in viewProduct', error);
        return res.status(500).render('error', { message: 'Internal Server Error' });
    }
}

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
        let category=req.query.category||'';
        let pageNumber=parseInt(req.query.page)||1;
        let pagelimit=0;
        let products=0;
        if(pageNumber==1){
            pagelimit=0;
        }else{
            pagelimit=(pageNumber-1)*12;
        }
        if(category){
            products=await productModel.aggregate([{$match:{category:'category'}},{$skip:pagelimit},{$limit:12}]);
        }else{
            products= await productModel.aggregate([{$skip:pagelimit},{$limit:12}]);
        }
    
        // Render the all products page with the fetched data
        res.render('user/allproducts', { products, categoryDetails, wishlist, cartCount, wishlistCount ,pageNumber});


    } catch (error) {
        console.error("Error in allProducts controller:", error);
        res.status(500).send("Internal Server Error");
    }
}

// Controller for filtering products based on category and price
exports.filterproducts = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        let wishlist = userId ? await wishlistModel.findOne({ userid: userId }) : null;
        const category = req.query.category !== undefined ? req.query.category : null;
        const price = req.query.price !== undefined ? req.query.price : null;
        const sort=req.query.sortOrder?req.query.sortOrder:null;
        const categoryDetails = await categoryModel.find();
        let products = await productModel.find();
        
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
    
        let category= await productModel.aggregate([{$match:{productName:{ $regex: Name, $options: 'i' }}}]);
        if(category.length!==0){
            res.render('user/categoryproducts', { category, categoryDetails, wishlist, cartCount, wishlistCount});
        }else{
            category= await productModel.aggregate([{$match:{category:{ $regex: Name, $options: 'i' }}}]);
            res.render('user/categoryproducts', { category, categoryDetails, wishlist, cartCount, wishlistCount});
        }
    } catch (error) {
        console.error('Error in searchGet controller:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.pagination = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        let wishlist = userId ? await wishlistModel.findOne({ userid: userId }) : null;

        let category = req.query.category || '';
        let pageNumber = parseInt(req.query.page) || 1;
        let pagelimit = 0;

        if (pageNumber > 1) {
            pagelimit = (pageNumber - 1) * 12;
        }

        let products;

        if (category) {
            products = await productModel.aggregate([
                { $match: { category: category } },
                { $skip: pagelimit },
                { $limit: 12 }
            ]);
        } else {
            products = await productModel.aggregate([
                { $skip: pagelimit },
                { $limit: 12 }
            ]);
        }

        return res.status(200).json({ success: true, message: "paginated", products: products, wishlist: wishlist, pageNumber});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
}
