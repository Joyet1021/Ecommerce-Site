const express=require('express')
const router=express.Router()
const adminController=require("../controller/admin")
const adminProductController=require("../controller/adminProduct")
const categoryController=require("../controller/category")
const authController=require("../controller/auth")
const couponController=require("../controller/Coupons")
const bannerController=require("../controller/banner")
const upload = require('../middlewares/multerMiddleware')


router.get("/adminhome",authController.adminhomeGet)

router.get("/addproduct",adminProductController.addproductGet)
router.post("/addproductpost",upload.array("productImage",99),adminProductController.addproductPost)

router.get("/products",adminProductController.productsGet)
router.get("/editproduct/:id",adminProductController.editproductGet)
router.post("/editproductpost/:id",upload.array("image",99),adminProductController.editproductPost)
router.delete("/deleteproduct",adminProductController.deleteproduct)

router.get("/categories",categoryController.categoriesGet)
router.post("/addCategory",categoryController.addCategory)
router.delete("/deletecategory",categoryController.deleteCategory)
router.get("/subCategory/:name",categoryController.subCategory)
router.delete("/deletesubCategory",categoryController.deletesubCategory)

router.get("/userslist",adminController.userslistGet)
router.get("/blockuser",adminController.blockuser)

router.get("/couponlist",couponController.couponlistGet)
router.get("/addCoupon",couponController.addCouponGet)
router.post("/addcoupon",couponController.addCouponPost)
router.get("/editcoupon",couponController.editCouponGet)
router.post("/editCouponPost",couponController.editcouponPost)
router.delete("/deletecoupon",couponController.deleteCoupon)

router.get("/bannerlist",bannerController.bannerlistGet)
router.get("/addbannerGet",bannerController.addbannerGet)
router.post('/addbannerPost',upload.single("bannerImage"),bannerController.addbannerPost)
router.get("/editbanner",bannerController.editbannerGet)
router.post("/editbannerPost",upload.single("bannerImage"),bannerController.editbannerPost)
router.delete("/deletebanner",bannerController.deletebanner)

router.get("/blockedusers",adminController.blockedusersGet)
router.get("/unblockuser",adminController.unblockuser)








module.exports=router