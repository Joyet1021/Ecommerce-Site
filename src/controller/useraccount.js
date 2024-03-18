// Import necessary modules and models
const profileModel = require('../../Models/userprofile');
const signupModel = require('../../Models/signupmodel');
const fs=require( "fs");
const bcrypt = require('bcrypt');
const orderModel = require("../../Models/order");
const productModel = require('../../Models/productdetails');
const cartModel=require('../../Models/cart');
const wishlistModel=require('../../Models/wishlist')
const reviewModel=require('../../Models/review')


// Display the address form
exports.addressGet = async (req, res) => {
    try {
        // Check if the user is logged in
        const userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
        // Get user details from session
        const user = req.session.user;
        const userName=user.username
        const email = user.email;
        const number = user.phonenumber;

        // Check if user profile exists, if not, create one
        let userdata = await profileModel.findOne({ userId: userId });

        if (!userdata) {
            userdata = await new profileModel({
                userId:userId,
                userImage: '',
                userName: userName,
                firstName: '',
                lastName: '',
                email: email,
                phoneNumber: number,
                dateofBirth: '',
                country: '',
                district: '',
                state: '',
                landMark: '',
                zip:'', 
                Address: '',
                newAddress:[]
            }).save();
        }

        // Fetch user profile data
        const profiledata = await profileModel.findOne({ userId: userId });
        let data='false';
        let img='false';
        if(!profiledata.firstName==' '){
            data='true';
        }
        if(!profiledata.userImage==' '){
            img='true';
        }
        let cartCount=0;
        let wishlistCount=0;
        // Fetch cart and wishlist count
        if(userId){
            const productids = await cartModel.findOne({ userid: userId });
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
        
        // Render the address form
        res.render('user/addaddress',{profiledata,data,img,wishlistCount,cartCount});

    } catch (error) {
        console.error('Error in addaddressGet', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// Handle address form submission
exports.addAddressPost = async (req, res) => {
    try {
        // Get user ID from session
        const userId = req.session.user ? req.session.user._id : null;
        // Get uploaded image file
        let userImage = req.file ? req.file.filename : null;
        const { firstName, lastName, dateofBirth, country, state, district, zip, landMark, Address, username, phoneNumber, email } = req.body;
        const address = Address + ' Pin ' + zip;

        // Update user details in signupModel
        await signupModel.findOneAndUpdate({ _id: userId }, {
            $set: {
                username: username,
                email,
                phonenumber: phoneNumber
            }
        });

        // Fetch old profile data
        const oldProfile = await profileModel.findOne({ userId });

        // Create updated profile data object
        let updatedProfileData = {
            userImage: userImage || oldProfile.userImage,
            userName:username,
            firstName,
            lastName,
            phoneNumber,
            email,
            dateofBirth,
            country,
            district,
            state,
            landMark,
            zip,
            Address,
            newAddress: [{
                firstName,
                lastName,
                phoneNumber,
                email,
                country,
                district,
                state,
                zip,
                Address,
            }]
        };

        // Delete old image file if new image is uploaded
        if (req.file && req.file.filename && req.file.filename !== ' ') {
            const img = oldProfile.userImage;
            if (!img == ' ') {
                
                const imagePath = './public/'+'uploads/' +'profiles/'+ img;
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        // Update profile data in profileModel
        await profileModel.updateOne({ userId }, { $set: updatedProfileData });

        // Return success message
        res.status(200).json({ success: true, message: "Address added successfully", data: updatedProfileData });

    } catch (error) {
        console.error("Error in adding address:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Display alternate address form
exports.altaddressGet=async (req,res)=>{
    try{
        const userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
        const profiledata = await profileModel.findOne({ userId: userId });
        let img='false';
        if(!profiledata.userImage==' '){
            img='true';
        }
        let cartCount=0;
        let wishlistCount=0;
        if(userId){
            const productids = await cartModel.findOne({ userid: userId });
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
        // Render alternate address form
        res.render("user/altaddress",{profiledata,img,cartCount,wishlistCount})

    }catch (error) {
        console.error('Error in altaddressGet', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// Handle alternate address form submission
exports.altaddressPost = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        const { firstName, lastName, phoneNumber, dateofBirth, email, country, state, district, zip, landMark, Address } = req.body;

        const data = await profileModel.findOne({ userId });

        // Push the new address to the existing addresses array
        data.newAddress.push({
            firstName,
            lastName,
            phoneNumber,
            email,
            dateofBirth,
            country,
            state,
            district,
            zip,
            landMark,
            Address
        });

        // Save the updated user profile
        await data.save();
        res.redirect('/user/Address')
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ success: false, message: 'Failed to add address' });
    }
}

// Display user orders
exports.ordersGet = async (req, res) => {
    try {
        let userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
        userId = userId.toString();
        
        // Fetch user orders
        const orders = await orderModel.find({ userid: userId }).populate('productsid.productid');

        const profiledata = await profileModel.findOne({ userId: userId });
        let img = 'false';
        if (!profiledata.userImage == ' ') {
            img = 'true';
        }
        let cartCount=0;
        let wishlistCount=0;
        if(userId){
            const productids = await cartModel.findOne({ userid: userId });
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
        // Render user orders page
        res.render('user/orders', { orders, profiledata, img,wishlistCount,cartCount });

    } catch (error) {
        console.error('Error:', error);
        // Handle the error, e.g., render an error page
        res.status(500).render('error', { error: 'An unexpected error occurred.' });
    }
};

// Delete order
exports.deleteorder = async (req, res) => {
    try {
        const id = req.query.id;
        const order = await orderModel.findOne({ _id: id });
        const productid = order.productsid[0].productid;
        const quantity = order.productsid[0].quantity;
        
        // Update product quantity and order status
        await productModel.updateOne({ _id: productid }, { $inc: { quantity: quantity } });
        await orderModel.updateOne({ _id: id }, { status:'Cancelled' });
        
        res.status(203).json({ success: true, message: "Product Deleted Successfully" });
    } catch (error) {
        console.log('Error in deleting product', error);
        res.status(500).send('Internal Server Error');
    }
}

// Display detailed order information
exports.orderopenGet=async(req,res)=>{
    try{
        const userId = req.session.user ? req.session.user._id : null;
        const orderid=req.query.id;
        let order = await orderModel.find({ _id: orderid }).populate('productsid.productid');
        order=order[0];
        // Initialize variables for user-specific data
        let wishlist = null;
        let cartCount = 0;
        let wishlistCount = 0;

        // Check if user is logged in
        if (userId) {
            // Fetch user's wishlist and cart details
            wishlist = await wishlistModel.findOne({ userid: userId });
            const cart = await cartModel.findOne({ userid: userId });

            // Update cart and wishlist counts
            cartCount = cart ? cart.productsid.length : 0;
            wishlistCount = wishlist ? wishlist.productsid.length : 0;
        }
        res.render('user/orderopen',{order,wishlistCount,cartCount})

    }catch (error) {
        console.error('Error in getting orders', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// Display update password form
exports.updatePasswordGet=async(req,res)=>{
    try{
        const userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
        const profiledata = await profileModel.findOne({ userId: userId });
        let img='false';
        if(!profiledata.userImage==' '){
            img='true';
        }
        let cartCount=0;
        let wishlistCount=0;
        if(userId){
            const productids = await cartModel.findOne({ userid: userId });
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
        // Render update password form
        res.render("user/updatepassword",{profiledata,img,cartCount,wishlistCount})

    }catch (error) {
        console.error('Error in altaddressGet', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// Handle password update
exports.updatePasswordput = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
        const { oldpassword, newpassword } = req.body;

        const user = await signupModel.findById(userId);

        const isMatch = await bcrypt.compare(oldpassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid old password" });
        }

        const hashedPassword = await bcrypt.hash(newpassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password updated" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


exports.aboutusGet=async(req,res)=>{
    try{
        const userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
        const profiledata = await profileModel.findOne({ userId: userId });
        let img='false';
        if(!profiledata.userImage==' '){
            img='true';
        }
        let cartCount=0;
        let wishlistCount=0;
        if(userId){
            const productids = await cartModel.findOne({ userid: userId });
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
        // Render update password form
        res.render("user/aboutus",{profiledata,img,cartCount,wishlistCount})

    }catch (error) {
        console.error('Error in altaddressGet', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

// Added product review
exports.reviewPost = async (req, res) => {
    try {
        const { productId, rating, review } = req.body;
        const userid = req.session.user ? req.session.user._id : null;
        const productExist = await reviewModel.findOne({ productid: productId });
        let newSchema;
        if (productExist) {
            productExist.reviews.push({
                userid,
                rating,
                review
            });
            newSchema = productExist;
        } else {
            newSchema = new reviewModel({
                productid: productId,
                reviews: [{
                    userid,
                    review,
                    rating
                }]
            });
        }
        const orderToUpdate = await orderModel.findOne({ userid: userid, 'productsid.productid': productId });
        if (orderToUpdate) {
            // Update the document
            await orderModel.updateOne(
                { _id: orderToUpdate._id }, // Filter to find the document
                { $set: { reviewed: true } } // Set the reviewed field to true
            );
        }

        if (userid === null) {
            return res.status(400).json({ success: false, message: "Please Login to write a Review" });
        } else {
            await newSchema.save();
            return res.status(200).json({ success: true, message: "Review saved successfully" });
        }
    } catch (error) {
        console.error("Error in reviewPost:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
