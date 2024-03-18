const categoryModel=require('../../Models/categories')

// Controller function to render the list of categories
exports.categoriesGet=async(req,res)=>{
    try{
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
        const categoryList=await categoryModel.find()
        
        res.render("admin/categories",{categoryList})
    }catch(error){
        console.log('Error in getting all categories')
        res.status(404).json({success:false,message:"Error In Fetching Data"});
    }
    
}
// Controller function to add a new category or subcategory
exports.addCategory = async (req, res) => {
    try {
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
        const { categoryName, subCategory } = req.body;
        const subcategory = subCategory.split(',').map(sub => sub.trim());

        const existingCategory = await categoryModel.findOne({ categoryName: categoryName });

        if (existingCategory) {
            const subCategoriesToAdd = subcategory.filter(sub => !existingCategory.subCategory.includes(sub));
            if (subCategoriesToAdd.length > 0) {
                await categoryModel.findOneAndUpdate(
                    { categoryName: categoryName },
                    { $push: { subCategory: { $each: subCategoriesToAdd } } },
                    { new: true, upsert: true }
                );
                res.status(203).json({ success: true, message: "Sub Category Added Successfully!" });
            } else {
                res.status(200).json({ success: false, message: "Sub Category already exists" });
            }
        } else {
            const newCategory = new categoryModel({
                categoryName,
                subCategory: subcategory
            });

            await newCategory.save();

            res.status(201).json({ success: true, message: 'Category has been created!' });
        }

    } catch (error) {
        console.log('Error in adding category', error);
        res.status(500).send('Internal Server Error');
    }
};


// Controller function to delete a category
exports.deleteCategory=async(req,res)=>{
    try{
        const id = req.query.id;
        await categoryModel.deleteOne({_id:id})
        res.status(203).json({success:true,message:"Category Deleted Successfully"})
        
    }catch(error){
        console.log('Error in deleting category', error);
        res.status(500).send('Internal Server Error');
    }
}

// Controller function to render the subcategory page
exports.subCategory=async(req,res)=>{
    try{
        const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
        const categoryName=req.params.name
        const category=await categoryModel.findOne({categoryName:categoryName})
        res.render("admin/subcategory",{category})

    } catch (error) {
        console.log('Error in fetching Subcategory', error);
        res.status(500).send('Internal Server Error');
    }
}

// Controller function to delete a subcategory
exports.deletesubCategory=async(req,res)=>{
   try{
    const{subcategoryId,categoryName}=req.query
    await categoryModel.findOneAndUpdate(
        { categoryName: categoryName },
        { $pull: { subCategory: subcategoryId } }, 
        { new: true }
    );
    res.status(203).json({success:true,message: "Sub Category Removed from the list!"});
   }catch(error){
       console.log('Error in removing Sub Category', error);
       res.status(400).json({success:false,message:'Something went wrong!'});
   }
}