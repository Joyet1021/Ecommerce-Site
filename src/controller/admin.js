const{render}=require('ejs')
const productModel=require('./../../Models/productdetails')
const categoryModel=require('./../../Models/categories')
const signupModel=require('./../../Models/signupmodel')

exports.adminhomeGet=(req,res)=>{
    res.render('admin/adminhome')
}

exports.addproductGet=(req,res)=>{
    res.render('admin/addproduct')
}



// Set up multer storage


// ...

// Update your route to use multer middleware for image upload
exports.addproductPost = async (req, res) => {
    try {
        
        const { productName, description, category, price, quantity, discount } = req.body;

        const image=req.file.filename

        const newSchema = new productModel({
            image,
            productName,
            category,
            description,
            price,
            quantity,
            discount,
             // Store the image buffer in the 'image' field
        });

        // Additional validation based on your requirements
        if (!productName || !description || !category || !price || !quantity || !discount) {
            console.log("Error: Missing required fields");
            return res.render('admin/addproduct', { error: "Missing required fields" });
        } else {
            await newSchema.save();
            res.redirect('/admin/adminhome');
        }
    } catch (error) {
        console.error("Error in adding the product to the database", error);
        res.status(500).send('Internal Server Error');
    }
};

exports.productsGet=async(req,res)=>{
    try{
        const productDetails=await productModel.find()

        res.render("admin/products",{productDetails})
    }catch(err){
        console.log('error to send product to products page',err)
    }
    
}

exports.editproductGet=async(req,res)=>{
    try{
        const data=req.params.id;
        const productDetails=await productModel.findById(data)
        console.log("editproductget");
        res.render('admin/editproduct',{productDetails});
        
    }catch(err){
        console.log('error in getting details of a product for editing')
    }
    // res.render("admin/editproduct")
}

exports.editproductPost=async(req,res)=>{
    try{
        
        const data=req.params.id;
        
        const{productName,price,category,discount,description,stock}=req.body
        

        const product=productModel.find({_id:data})
        const productimage=product.image
        const image=req.file?req.file.filename : productimage
        const productDetail=await productModel.updateOne({_id:data},{$set:{
            productName,
            price,
            category,
            discount,
            description,
            stock,
            image
    }})
    const productDetails=await productModel.find()
    
    
    res.render("admin/products",{productDetails})
    

    }catch(error){
        console.log('Error in updating the product');
    }
}

exports.deleteproduct=async(req,res)=>{
    try{
        
        const id=req.params.id
        await productModel.deleteOne({_id: req.params.id});
        
        const productDetails=await productModel.find()
        console.log(productDetails);

        res.render("admin/products",{productDetails})
    }catch{
        console.log('Product not found')
    }

}
exports.categoriesGet=async(req,res)=>{
    try{
        const categoryList=await categoryModel.find()
        
        res.render("admin/categories",{categoryList})
    }catch(error){
        console.log('Error in getting all categories')
    }
    
}
exports.addCategory = async (req, res) => {
    try {
        const { categoryName, subCategory } = req.body;

        
        const newCategory = new categoryModel({
            categoryName,
            subCategory:[subCategory]
        });

        await newCategory.save();
        const categoryList = await categoryModel.find();

        console.log('Added category successfully');
        res.render("admin/categories", { categoryList });
    } catch (error) {
        console.log('Error in adding category', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteCategory=async(req,res)=>{
    try{
        const id = req.params.id;
        await categoryModel.deleteOne({_id:id})

        const  categoryList =await categoryModel.find();
        res.render('admin/categories',{categoryList})
        
    }catch(error){
        console.log('Error in deleting Category', error);
    }
}
exports.subCategory=async(req,res)=>{
    try{

    }catch{

    }
}

exports.userslistGet = async (req, res) => {
    try {
      // Fetch all user details from the signupModel
      const userData = await signupModel.find().where('role').equals('user');
  
      // Filter the user details to include only users (assuming the 'role' property is present in your schema)
    //   const userData = userDetails.filter(user => user.role === "user");
  
      // Render the 'admin/userslist' view with the filtered user data
      res.render('admin/userslist', { userData });
    } catch (error) {
      // Handle errors (you might want to send an error response or log the error)
      console.error('Error fetching user data:', error.message);
      res.status(500).send('Internal Server Error');
    }
  };

exports.deleteuser=async(req,res)=>{
    try{
        const  id = req.params.id;
        await  signupModel.deleteOne({ _id : id })

        const  userData = await signupModel.find().where('role').equals('user')

        res.render('admin/userlist',{userData})
    }catch{

    }
}
