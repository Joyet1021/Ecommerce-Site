const express=require('express')
const router=express.Router()


const userController=require("../controller/user")

router.get("/signup",userController.usersignupGet)
router.post("/sendotp",userController.usersignupPost)

router.get("/sendotp/:num",userController.sendotpget)
router.post("/login/:num",userController.sendotpPost)
router.get("/resendotp/:num",userController.resendotp)

router.get("/login",userController.userloginGet)
router.post("/home",userController.userloginPost)

router.get("/forgot",userController.forgotpasswordGet)
router.post("/forgotpost",userController.forgotpasswordPost)

router.get("/forgototp/:mail",userController.forgototpGet)
// router.get("/resendemailotp/:mail",userController.resendemailotp)
router.post("/resetpassword/:mail",userController.forgototpPost)

router.get("/resetpasswordGet/:mail",userController.resetpasswordGet)
router.post("/resetlogin/:mail",userController.resetpasswordPost)



module.exports=router