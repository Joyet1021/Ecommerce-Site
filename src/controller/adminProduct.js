const productModel = require('../../Models/productdetails');
const categoryModel = require('../../Models/categories');
const fs = require('fs');
const wishlistModel = require('../../Models/wishlist');
const cartModel = require("../../Models/cart");

// Controller function to render the add product page
exports.addproductGet = async (req, res) => {
    try {
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
        const categoryList = await categoryModel.find();
        res.render('admin/addproduct', { categoryList });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(404).json({ success: false });
    }
};

// Controller function to handle adding a new product
exports.addproductPost = async (req, res) => {
    try {
        // Check if files are uploaded and limit is not exceeded
        if (!req.files || req.files.length > 5) {
            return res.status(230).json({ message: "Please provide an image", success: false });
        }

        // Extract product image filenames from uploaded files
        const productImage = req.files.map((file) => file.filename);

        // Extract product details from request body
        const { productName, description, category, subcategory, returnproduct, size, color, deliverydate, price, quantity, discount } = req.body;

        // Create a new product schema instance with extracted details
        const newSchema = new productModel({
            productImage,
            productName,
            category,
            subcategory,
            returnproduct,
            size,
            color,
            deliverydate,
            description,
            price,
            quantity,
            discount,
        });

        // Save the new product to the database
        await newSchema.save();
        res.status(203).json({ success: true, message: "Product Added Successfully" });

    } catch (error) {
        console.error("Error in adding the product to the database", error);
        res.status(500).send('Internal Server Error');
    }
};

// Controller function to render the products page with product details
exports.productsGet = async (req, res) => {
    try {
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
        const productDetails = await productModel.find();
        res.render("admin/products", { productDetails });
    } catch (err) {
        console.log('error to send product to products page', err);
        res.status(500).json({ success: false });
    }
};

// Controller function to render the edit product page with product details
exports.editproductGet = async (req, res) => {
    try {
        const data = req.params.id;
        const productDetails = await productModel.findById(data);
        const categoryList = await categoryModel.find();
        res.render('admin/editproduct', { categoryList, productDetails });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(404).json({ success: false });
    }
};

// Controller function to handle updating product details
exports.editproductPost = async (req, res) => {
    try {
        const data = req.params.id;
        const { productName, price, category, subcategory, size,color, returnproduct, discount, deliverydate, description, quantity } = req.body;
        // Find the product by id
        const product = await productModel.findOne({ _id: data });

        // Create a new product detail object
        const productDetail = {
            productName,
            price,
            category,
            subcategory,
            size,
            color,
            returnproduct,
            discount,
            deliverydate,
            description,
            quantity,
            productImage: []
        }

        // Check if new files are uploaded, delete existing images, and add new image filenames
        if (req.files.length > 0) {
            product.productImage.forEach(img => {
                const imagePath = './public/' + 'uploads/' + img;
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });

            const productImage = req.files.map((file) => file.filename);
            productDetail.productImage = productImage;
        } else {
            productDetail.productImage = product.productImage;
        }

        // Update the product details
        await productModel.updateOne({ _id: data }, productDetail);

        res.redirect("/admin/products");

    } catch (error) {
        console.log('Error in updating the product:', error);
        res.status(500).send('Error in updating the product');
    }
};

// Controller function to handle deleting a product
exports.deleteproduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await productModel.findOne({ _id: id });

        // Delete the product images
        product.productImage.forEach(img => {
            const imagePath = './public/' + 'uploads/' + img;
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });

        // Delete the product from the database
        await productModel.deleteOne({ _id: id });
        // Remove the product from wishlist
        await wishlistModel.updateMany({}, { $pull: { productsid: { productid: id } } });
        // Remove the product from cart
        await cartModel.updateMany({}, { $pull: { productsid: { productid: id } } });

        res.status(203).json({ success: true, message: "Product Deleted Successfully" });

    } catch (error) {
        console.log('Error in deleting product', error);
        res.status(500).send('Internal Server Error');
    }
};
