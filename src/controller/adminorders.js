const { render } = require("ejs")
const orderModel=require("./../../Models/order")


exports.ordersGet = async (req, res) => {
    try {
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
        const orders = await orderModel.find();
        res.render("admin/orders", { orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.orderStatus = async (req, res) => {
    try {
        const { orderId, userId, status } = req.query;
        const updatedOrder = await orderModel.findOneAndUpdate(
            { _id: orderId, userid: userId },
            { $set: { status: status } },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).send("Order not found");
        }
        res.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).send("Internal Server Error");
    }
};
