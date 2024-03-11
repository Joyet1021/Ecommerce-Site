const couponModel = require('./../../Models/couponmodel');

// Controller function to render the list of coupons
exports.couponlistGet = async (req, res) => {
    try {
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
        let coupon = await couponModel.find();

        res.render('admin/couponlist', { coupon });
    } catch (error) {
        console.log('Error in getting coupon list', error);
        res.status(500).json({ success: false });
    }
};

// Controller function to render the add coupon form
exports.addCouponGet = async (req, res) => {
    try {
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
        res.render("admin/addcoupon");
    } catch (error) {
        console.log('Error in add coupon page', error);
        res.status(500).json({ "Error": "Internal server error" });
    }
};

// Controller function to handle the addition of a new coupon
exports.addCouponPost = async (req, res) => {
    try {
        const { couponCode, minimumPurchase, discountPercentage, startDate, endDate } = req.body;

        const newCoupon = new couponModel({
            couponCode,
            minimumPurchase,
            discountPercentage,
            startDate,
            endDate
        });

        await newCoupon.save();
        res.status(203).json({ success: true, message: "Coupon added successfully" });

    } catch (error) {
        console.error('Error in adding coupon', error);
        res.status(500).send('Internal Server Error');
    }
};

// Controller function to render the edit coupon form
exports.editCouponGet = async (req, res) => {
    try {
        const id = req.query.id;
        const couponDetails = await couponModel.findOne({ _id: id });
        res.render('admin/editcoupon', { couponDetails: couponDetails });
    } catch (error) {
        console.log('Error in edit coupon page', error);
        res.status(404).json({ success: false });
    }
};

// Controller function to handle the editing of a coupon
exports.editcouponPost = async (req, res) => {
    try {
        const id = req.query.id;
        const { couponCode, minimumPurchase, discountPercentage, startDate, endDate } = req.body;
        await couponModel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    couponCode,
                    minimumPurchase,
                    discountPercentage,
                    startDate,
                    endDate
                }
            }
        );
        res.redirect("/admin/couponlist");
    } catch (error) {
        console.log('Error in updating the coupon details', error);
        res.status(500).send('Internal Server Error');
    }
};

// Controller function to handle the deletion of a coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const id = req.query.id;
        await couponModel.deleteOne({ _id: id });
        res.status(203).json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.log('Error in deleting coupon', error);
        res.status(500).send('Internal Server Error');
    }
};
