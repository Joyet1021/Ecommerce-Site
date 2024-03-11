const bannerModel = require("./../../Models/bannermodel");
const fs = require("fs");

// Controller function to render the list of banners
exports.bannerlistGet = async (req, res) => {
    try {
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
        const bannerData = await bannerModel.find();
        res.render('admin/bannerlist', { bannerData });
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        res.status(500).send('Internal Server Error');
    }
}

// Controller function to render the add banner page
exports.addbannerGet = async (req, res) => {
    try {
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
        res.render('admin/addbanner');
    } catch (error) {
        console.error('Error fetching addbanner page:', error.message);
        res.status(500).send('Internal Server Error');
    }
}

// Controller function to handle adding a new banner
exports.addbannerPost = async (req, res) => {
    try {
        // Check if file is provided
        if (!req.file) {
            return res.status(203).json({ success: false, message: "Please provide an image" });
        }

        // Get image filename and other details from request body
        const image = req.file.filename;
        const { bannerName, bannerHeading, offerPrice, startDate, endDate } = req.body;

        // Create a new banner schema and save to database
        const newSchema = new bannerModel({
            bannerName,
            bannerHeading,
            offerPrice,
            startDate,
            endDate,
            bannerImage: image
        });
        await newSchema.save();

        res.status(203).json({ success: true, message: 'Banner added successfully' });
    } catch (error) {
        console.error("Error in adding the banner to the database", error);
        res.status(500).send('Internal Server Error');
    }
}

// Controller function to render the edit banner page
exports.editbannerGet = async (req, res) => {
    try {
        let id = req.query.id;
        const bannerData = await bannerModel.findById(id);
        res.render('admin/editbanner', { bannerData });
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(404).json({ success: false });
    }
}

// Controller function to handle editing an existing banner
exports.editbannerPost = async (req, res) => {
    try {
        const id = req.query.id;
        const { bannerName, bannerHeading, offerPrice, startDate, endDate } = req.body;

        // Find the banner by ID
        const banner = await bannerModel.findOne({ _id: id });

        // Prepare banner details for update
        const bannerDetail = {
            bannerName,
            bannerHeading,
            offerPrice,
            startDate,
            endDate,
            bannerImage: banner.bannerImage
        }

        // Update banner image if new image is provided
        if (req.file) {
            const img = banner.bannerImage;
            const imagePath = './public/' + 'uploads/' + img;
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            const bannerImage = req.file.filename;
            bannerDetail.bannerImage = bannerImage;
        }

        // Update the banner details in the database
        await bannerModel.updateOne({ _id: id }, bannerDetail);
        res.redirect("/admin/bannerlist");
    } catch (error) {
        console.log('Error in updating the banner:', error);
        res.status(500).send('Error in updating the banner');
    }
}

// Controller function to handle deleting a banner
exports.deletebanner = async (req, res) => {
    try {
        const id = req.query.id;
        const banner = await bannerModel.findOne({ _id: id });
        const img = banner.bannerImage;
        const imagePath = './public/' + 'uploads/' + img;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        await bannerModel.deleteOne({ _id: id });
        res.status(203).json({ success: true, message: "Banner deleted successfully" });
    } catch (error) {
        console.log('Error in deleting banner', error);
        res.status(500).send('Internal Server Error');
    }
}
