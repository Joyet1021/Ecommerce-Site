const cartModel=require("../../Models/cart");
const profileModel = require('../../Models/userprofile');
const productModel=require("../../Models/productdetails");
const couponModel=require('../../Models/couponmodel')
var nodemailer = require('nodemailer');
const mailOTP = require('../middlewares/otp');
const flash=require('connect-flash');
const session = require('express-session');
const orderModel = require("../../Models/order");
const Razorpay=require('razorpay')

const razorpayid=process.env.RAZORPAY_ID_KEY;
const razorpaykey=process.env.RAZORPAY_SECRET_KEY;

const instance=new Razorpay({
    key_id:razorpayid,
    key_secret:razorpaykey
});

exports.checkoutGet = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
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
            const qty = req.query.quantity||'1';
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
        const payment=req.body.payment;
        const total=req.query.finalPrice
        const order={
            address:req.body,
            finalPrice:total
        };
        req.session.order=order
        
        if(payment=='cashondelivery'){
            const email=req.session.order.address.email;
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
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent');
                }
              });
            return res.json({cod:true});
        }else{

          const orders = await instance.orders.create({
            amount: total*100,
            currency: "INR",
          })
          
          
          return res.status(200).json({cod:false,total,orders});
        } 
    } catch (error) {
        // console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}    
  
exports.codConfirmGet = (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
        const error = req.flash('error');
        const email=req.session.order.address.email;
          console.log("forget password otp send successfully");
        res.render('user/codconfirm',{email,error})
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
exports.codconfirmPost = async (req, res) => {
    try {
        const { D1, D2, D3, D4 } = req.body;
        const otp = D1 + D2 + D3 + D4;
        if (otp == mailOTP.otp) {
            
            res.redirect("/user/orderplaced")
            
        } else {
            req.flash("error", "Incorrect otp");
            res.redirect("/user/codConfirm")
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

exports.orderPlacedGet = async (req, res) => {
    try {
        const userid = req.session.user ? req.session.user._id : null;
        const paymentmethod=req.session.order.address.payment;
        const quantity=req.session.preorder.forEach(async(product) => {
            const id=product.productid._id;
            const qty=product.quantity;
            const productdetails=await productModel.findOne({_id:id});
            const stock=productdetails.quantity;
            const quantity=stock-qty;
            await productModel.updateOne({_id:id},{$set:{quantity}})
            
        });
        
        const address={
            firstname:req.session.order.address.firstname,
            lastname:req.session.order.address.lastname,
            mobilenumber:req.session.order.address.mobilenum,
            email:req.session.order.address.email,
            country:req.session.order.address.country,
            state:req.session.order.address.state,
            district:req.session.order.address.district,
            zip:req.session.order.address.zip,
            post:req.session.order.address.address
        }
        const newSchema=new orderModel({
            userid,
            productsid:req.session.preorder,
            paymentmethod,
            address:address,
            total:req.session.order.finalPrice

        });
        await newSchema.save();
        
        res.render("user/orderplaced");

        
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}
