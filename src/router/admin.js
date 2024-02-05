const express=require('express')
const router=express.Router()
const adminController=require("../controller/admin")
const upload = require('../middlewares/multerMiddleware')


router.get("/adminhome",adminController.adminhomeGet)

router.get("/addproduct",adminController.addproductGet)
router.post("/addproductpost",upload.single("image"),adminController.addproductPost)

router.get("/products",adminController.productsGet)
router.get("/editproduct/:id",adminController.editproductGet)
router.post("/editproductpost/:id",upload.single("image"),adminController.editproductPost)
router.get("/deleteproduct/:id",adminController.deleteproduct)

router.get("/categories",adminController.categoriesGet)
router.post("/addcategory",adminController.addCategory)
router.get("/deletecategory/:id",adminController.deleteCategory)
router.get("/subCategory",adminController.subCategory)

router.get("/userslist",adminController.userslistGet)
router.get("/deleteuser/:id",adminController.deleteuser)




module.exports=router