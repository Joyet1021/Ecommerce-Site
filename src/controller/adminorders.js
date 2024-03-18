const { render } = require("ejs");
const orderModel = require("./../../Models/order");

// Controller function to render the orders page
exports.ordersGet = async (req, res) => {
    try {
        // Check if admin is logged in
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login'); // Redirect to login if not logged in
        }

        // Find all orders
        const orders = await orderModel.find().populate('productsid.productid');
        res.render("admin/orders", { orders }); // Render the orders page with orders data
    } catch (error) {
        console.error("Error fetching orders:", error); // Log error
        res.status(500).send("Internal Server Error"); // Send internal server error response
    }
};

// Controller function to update order status
exports.orderStatus = async (req, res) => {
    try {
        const { orderId, userId, status } = req.query;

        // Find and update the order status
        const updatedOrder = await orderModel.findOneAndUpdate(
            { _id: orderId, userid: userId },
            { $set: { status: status } },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).send("Order not found"); // Send not found response if order not found
        }

        res.json(updatedOrder); // Send updated order as JSON response
    } catch (error) {
        console.error("Error updating order status:", error); // Log error
        res.status(500).send("Internal Server Error"); // Send internal server error response
    }
};
