const express=require('express')
const router=express.Router()
const multer = require('../middlewares/multerMiddleware')


const authController=require("../controller/auth")
const userController=require("../controller/userController")
const accountController=require("../controller/useraccount")
const orderController=require("../controller/userorder")
const cartController=require("../controller/usercart")
const wishlistController=require("../controller/userwishlist")

router.get("/signup",authController.usersignupGet)
router.post("/sendotp",authController.usersignupPost)

router.get("/sendotp/:num",authController.sendotpget)
router.post("/login/:num",authController.sendotpPost)
router.get("/resendotp/:num",authController.resendotp)

router.get("/login",authController.userloginGet)
router.post("/home",authController.userloginPost)

router.get("/forgot",authController.forgotpasswordGet)
router.post("/forgotpost",authController.forgotpasswordPost)

router.get("/forgototp/:mail",authController.forgototpGet)
// router.get("/resendemailotp/:mail",authController.resendemailotp)
router.post("/resetpassword/:mail",authController.forgototpPost)

router.get("/resetpasswordGet/:mail",authController.resetpasswordGet)
router.post("/resetlogin/:mail",authController.resetpasswordPost)

router.get("/userhome",userController.userhomeGet)
router.get("/viewproduct",userController.viewProduct)
router.get("/addToCart",cartController.addtoCart)
router.post("/buyNow",userController.buynowpost)

router.get("/categoryGet",userController.categoryGet)
router.get("/allproducts",userController.allProducts)
router.get("/filterproduct",userController.filterproducts)
router.get("/filterPrice",userController.filterprice)
router.get("/subcategory",userController.subCategory)
   
router.get("/cart",cartController.cartGet)
router.delete("/deletecartproduct",cartController.deleteCartProduct)
router.get("/updateCartqty",cartController.updateCartQty)

router.get("/addtowishlist",wishlistController.addtowishlist)
router.get("/wishlist",wishlistController.wishlistGet)
router.delete("/deleteWishlist",wishlistController.deleteWishlist)

router.get("/Address",accountController.addressGet)
router.post("/addAddress",multer.setUploadType('profiles'),multer.upload.single("profileImage"),accountController.addAddressPost)
router.get("/altaddress",accountController.altaddressGet)
router.post("/altAddressPost",accountController.altaddressPost)
router.get("/aboutus",accountController.aboutusGet)

router.get("/checkout",orderController.checkoutGet)
router.get("/addresschoice",orderController.addressChoiceGet)
// router.post("/newaddress",orderController.newaddressPost)
router.get("/applyCoupon",orderController.applyCouponGet)
router.post("/checkoutPost",orderController.checkoutPost)
router.get("/codConfirm",orderController.codConfirmGet)
router.post("/codconfirmpost",orderController.codconfirmPost)
router.get("/orderplaced",orderController.orderPlacedGet)
router.get("/orders",accountController.ordersGet)
router.delete("/deleteorder",accountController.deleteorder)
router.get("/orderopen",accountController.orderopenGet)
router.get("/updatePassword",accountController.updatePasswordGet)
router.put("/updatePasswordput",accountController.updatePasswordput)

router.get("/search",userController.searchGet);
router.get("/pagination",userController.pagination)
router.get("/logout",authController.logout);

router.post("/review",accountController.reviewPost)







module.exports=router