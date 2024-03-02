const cartModel=require("../../Models/cart");
const profileModel = require('../../Models/userprofile');
const productModel=require("../../Models/productdetails");
const couponModel=require('../../Models/couponmodel')

exports.checkoutGet = async (req, res) => {
    try {
        const userId = req.session.user._id;
        let total = 0;
        let productId = 0;
        let order = 0;

        if (req.query.total) {
            total = req.query.total;
            const cart = await cartModel.findOne({ userid: userId }).populate('productsid.productid');
            order = cart.productsid;
            req.session.preorder = order;
        } else {
            productId = req.query.productid;
            const size = req.query.size;
            const color = req.query.color;
            const qty = req.query.quantity;
            const productid = await productModel.findOne({ _id: productId });
            order = [{ productid, quantity: qty, size: size, color: color }];
            total = order[0].productid.discount * qty;
            req.session.preorder = order;
            quantity = req.query.quantity;
        }

        const user = await profileModel.findOne({ userId: userId });
        const Address = user.newAddress;

        const coupon = await couponModel.find({ minimumPurchase: { $lte: total } });
        res.render('user/checkout', { order, total, Address, coupon });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
}


exports.addressChoiceGet = async (req, res) => {
    try {
        const index = req.query.index;
        const userId = req.session.user._id;
        const data = await profileModel.findOne({ userId });
        const userdata = data.newAddress[index];
        req.session.orderaddress={
            userId:userId,
            address:userdata
          };
        res.status(200).json({ success: true, userdata: userdata });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


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

exports.checkoutPost = async (req, res) => {
    try {
        let body = req.body;
        const userdetails = req.body;
        const finalPrice = req.query.finalPrice;
        const products = req.session.preorder;
       
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
