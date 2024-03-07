const express=require('express')
const router=express.Router()
const adminController=require("../controller/admin")
const adminProductController=require("../controller/adminProduct")
const categoryController=require("../controller/category")
const authController=require("../controller/auth")
const couponController=require("../controller/Coupons")
const bannerController=require("../controller/banner")
const ordersController=require("../controller/adminorders")
const multer = require('../middlewares/multerMiddleware')
const dashboardController=require("../controller/admindashboard")


router.get("/adminhome",authController.adminhomeGet)

router.get("/addproduct",adminProductController.addproductGet)
router.post("/addproductpost",multer.setUploadType('products'),multer.upload.array("productImage",99),adminProductController.addproductPost)

router.get("/products",adminProductController.productsGet)
router.get("/editproduct/:id",adminProductController.editproductGet)
router.post("/editproductpost/:id",multer.setUploadType('products'),multer.upload.array("image",99),adminProductController.editproductPost)
router.delete("/deleteproduct",adminProductController.deleteproduct)

router.get("/categories",categoryController.categoriesGet)
router.post("/addCategory",categoryController.addCategory)
router.delete("/deletecategory",categoryController.deleteCategory)
router.get("/subCategory/:name",categoryController.subCategory)
router.delete("/deletesubCategory",categoryController.deletesubCategory)

router.get("/userslist",adminController.userslistGet)
router.get("/blockuser",adminController.blockuser)

router.get("/adminorders",ordersController.ordersGet)
router.get("/orderstatus",ordersController.orderStatus)

router.get("/couponlist",couponController.couponlistGet)
router.get("/addCoupon",couponController.addCouponGet)
router.post("/addcoupon",couponController.addCouponPost)
router.get("/editcoupon",couponController.editCouponGet)
router.post("/editCouponPost",couponController.editcouponPost)
router.delete("/deletecoupon",couponController.deleteCoupon)

router.get("/bannerlist",bannerController.bannerlistGet)
router.get("/addbannerGet",bannerController.addbannerGet)
router.post('/addbannerPost',multer.setUploadType('banners'),multer.upload.single("bannerImage"),bannerController.addbannerPost)
router.get("/editbanner",bannerController.editbannerGet)
router.post("/editbannerPost",multer.setUploadType('banners'),multer.upload.single("bannerImage"),bannerController.editbannerPost)
router.delete("/deletebanner",bannerController.deletebanner)

router.get("/blockedusers",adminController.blockedusersGet)
router.get("/unblockuser",adminController.unblockuser)

router.get("/dashboardstock",dashboardController.dashboardStock);
router.get("/dashboardsales",dashboardController.dailySales);
router.get("/dashboardusers",dashboardController.totalusers);








module.exports=router