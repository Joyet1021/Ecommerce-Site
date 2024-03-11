const signupModel = require('./../../Models/signupmodel'); // Importing the signup model
const flash = require("connect-flash"); // Importing flash for displaying messages
const session = require('express-session'); // Importing express-session for session management

// Controller function to get the list of users
exports.userslistGet = async (req, res) => {
    try {
        // Checking if the admin is logged in
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }

        // Finding all user data where role is user and blocked is false
        const userData = await signupModel.find({ role: 'user', blocked: false });
        res.render('admin/userslist', { userData }); // Rendering the userslist view with user data
    } catch (error) {
        console.error('Error fetching user data:', error.message); // Logging error message
        res.status(500).send('Internal Server Error'); // Sending internal server error response
    }
};

// Controller function to block a user
exports.blockuser = async (req, res) => {
    try {
        // Checking if the admin is logged in
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }

        // Getting the user id from query parameter
        const id = req.query.id;
        // Updating the user document to set blocked as true
        await signupModel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    blocked: true
                }
            }
        );

        res.status(203).json({ success: true, message: "Blocked user Successfully" }); // Sending success response
    } catch (error) {
        console.error('Error in blocking user:', error.message); // Logging error message
        res.status(500).send('Internal Server Error'); // Sending internal server error response
    }
};

// Controller function to get the list of blocked users
exports.blockedusersGet = async (req, res) => {
    try {
        // Checking if the admin is logged in
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }

        // Finding all user data where role is user and blocked is true
        const userData = await signupModel.find({ role: 'user', blocked: true });
        res.render('admin/blockedusers', { userData }); // Rendering the blockedusers view with user data
    } catch (error) {
        console.error('Error fetching user data:', error.message); // Logging error message
        res.status(500).send('Internal Server Error'); // Sending internal server error response
    }
};

// Controller function to unblock a user
exports.unblockuser = async (req, res) => {
    try {
        // Getting the user id from query parameter
        const id = req.query.id;
        // Updating the user document to set blocked as false
        await signupModel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    blocked: false
                }
            }
        );

        res.status(203).json({ success: true, message: "Unblocked user" }); // Sending success response
    } catch (error) {
        console.error('Error fetching user data:', error.message); // Logging error message
        res.status(500).send('Internal Server Error'); // Sending internal server error response
    }
};
