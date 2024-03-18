const cartModel = require("../../Models/cart");
const profileModel = require('../../Models/userprofile');
const productModel = require("../../Models/productdetails");
const couponModel = require('../../Models/couponmodel');
var nodemailer = require('nodemailer');
const mailOTP = require('../Utilities/otp');
const flash = require('connect-flash');
const session = require('express-session');
const orderModel = require("../../Models/order");
const Razorpay = require('razorpay');
const wishlistModel = require("../../Models/wishlist");

// Environment variables for Razorpay
const razorpayid = process.env.RAZORPAY_ID_KEY;
const razorpaykey = process.env.RAZORPAY_SECRET_KEY;

const instance = new Razorpay({
    key_id: razorpayid,
    key_secret: razorpaykey
});

// Controller function to render the checkout page
exports.checkoutGet = async (req, res) => {
    try {
        // Check if user is logged in
        const userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
        let total = 0;
        let productId = 0;
        let order = 0;

        // Check if the request is for a cart or a single product
        if (req.query.total) {
            total = req.query.total;
            const cart = await cartModel.findOne({ userid: userId }).populate('productsid.productid');
            order = cart.productsid;
            req.session.preorder = order;
        } else {
            productId = req.query.productid;
            const size = req.query.size;
            const color = req.query.color;
            const qty = req.query.quantity || '1';
            const productid = await productModel.findOne({ _id: productId });
            order = [{ productid, quantity: qty, size: size, color: color }];
            total = order[0].productid.discount * qty;
            req.session.preorder = order;
            quantity = req.query.quantity;
        }
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

        // Get user's address and available coupons
        const user = await profileModel.findOne({ userId: userId });
        const Address = user.newAddress;
        const coupon = await couponModel.find({ minimumPurchase: { $lte: total } });

        res.render('user/checkout', { order, total, Address, coupon,wishlistCount,cartCount });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
}

// Controller function to get the selected address for the order
exports.addressChoiceGet = async (req, res) => {
    try {
        const index = req.query.index;
        const userId = req.session.user._id;
        const data = await profileModel.findOne({ userId });
        const userdata = data.newAddress[index];
        req.session.orderaddress = {
            userId: userId,
            address: userdata
        };
        res.status(200).json({ success: true, userdata: userdata });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Controller function to apply a coupon code
exports.applyCouponGet = async (req, res) => {
    try {
        const couponCode = req.query.couponCode;
        const coupon = await couponModel.findOne({ couponCode: couponCode });
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        const couponAmount = coupon.discountPercentage;
        return res.status(200).json({ success: true, amount: couponAmount, message: "Coupon found" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Controller function to handle the checkout process
exports.checkoutPost = async (req, res) => {
    try {
        const payment = req.body.payment;
        const total = req.query.finalPrice;
        const order = {
            address: req.body,
            finalPrice: total
        };
        req.session.order = order;

        // Check if payment method is cash on delivery or online
        if (payment == 'cashondelivery') {
            // Send OTP for cash on delivery
            const email = req.session.order.address.email;
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'joyetjoyasi@gmail.com',
                    pass: 'etja nfps utyg phkw'
                }
            });

            var mailOptions = {
                from: 'joyetjoyasi@gmail.com',
                to: `${email}`,
                subject: 'Sending Email using Node.js',
                text: `Your OTP is ${mailOTP.otp}`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent');
                }
            });
            return res.json({ cod: true });
        } else {
            // Generate Razorpay order for online payment
            const orders = await instance.orders.create({
                amount: total * 100,
                currency: "INR",
            });

            return res.status(200).json({ cod: false, total, orders });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Controller function to render the cash on delivery confirmation page
exports.codConfirmGet = async(req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
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
        const error = req.flash('error');
        const email = req.session.order.address.email;
        res.render('user/codconfirm', { email, error,wishlistCount,cartCount })
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

// Controller function to confirm cash on delivery payment
exports.codconfirmPost = async (req, res) => {
    try {
        const { D1, D2, D3, D4 } = req.body;
        const otp = D1 + D2 + D3 + D4;
        if (otp == mailOTP.otp) {
            // Place order if OTP is correct
            res.redirect("/user/orderplaced");
        } else {
            // Redirect with error message if OTP is incorrect
            req.flash("error", "Incorrect otp");
            res.redirect("/user/codConfirm");
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

// Controller function to handle the order placement
exports.orderPlacedGet = async (req, res) => {
    try {
        const userid = req.session.user ? req.session.user._id : null;
        const paymentmethod = req.session.order.address.payment;
        const quantity = req.session.preorder.forEach(async (product) => {
            const id = product.productid._id;
            const qty = product.quantity;
            const productdetails = await productModel.findOne({ _id: id });
            const stock = productdetails.quantity;
            const quantity = stock - qty;
            await cartModel.updateOne({userid:userid},{$pull:{productsid:{productid:id}}});
            await productModel.updateOne({ _id: id }, { $set: { quantity } });

        });

        const address = {
            firstname: req.session.order.address.firstname,
            lastname: req.session.order.address.lastname,
            mobilenumber: req.session.order.address.mobilenum,
            email: req.session.order.address.email,
            country: req.session.order.address.country,
            state: req.session.order.address.state,
            district: req.session.order.address.district,
            zip: req.session.order.address.zip,
            post: req.session.order.address.address
        }
        const preorder = req.session.preorder;
        preorder.forEach(async (order) => {

            const newSchema = new orderModel({
                userid,
                productsid: [{
                    productid: order.productid._id,
                    quantity: order.quantity,
                    color: order.color,
                    size: order.size

                }],
                paymentmethod,
                address: address,
                total: req.session.order.finalPrice

            });
            await newSchema.save();
            const productid = order.productid._id;
            await cartModel.findOneAndUpdate(
                { userid: userid },
                { $pull: { productsid: { productid: productid } } },
                { new: true }
            );

        })
        // Initialize variables for user-specific data
        let wishlist = null;
        let cartCount = 0;
        let wishlistCount = 0;

        // Check if user is logged in
        if (userid) {
            // Fetch user's wishlist and cart details
            wishlist = await wishlistModel.findOne({ userid });
            const cart = await cartModel.findOne({ userid});

            // Update cart and wishlist counts
            cartCount = cart ? cart.productsid.length : 0;
            wishlistCount = wishlist ? wishlist.productsid.length : 0;
        }
        res.render("user/orderplaced",{wishlistCount,cartCount});


    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}
