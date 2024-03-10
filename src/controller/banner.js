const bannerModel=require("./../../Models/bannermodel")
const fs=require( "fs");
exports.bannerlistGet=async(req,res)=>{
    try{
      const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
        const bannerData=await bannerModel.find();
        res.render('admin/bannerlist',{bannerData})
    }catch(error){
    console.error('Error fetching user data:', error.message);
    res.status(500).send('Internal Server Error');
  }
}
   
exports.addbannerGet=async(req,res)=>{
  try{
    const adminId = req.session.admin ? req.session.admin._id : null;
        if (!adminId) {
            return res.redirect('/user/login');
        }
    res.render('admin/addbanner');
  }catch(error){
    console.error('Error fetching addbanner page:', error.message);
    res.status(500).send('Internal Server Error');
  }
}

exports.addbannerPost=async(req,res)=>{
  try{
    
    if(!req.file){
      return res.status(203).json({success:false,message:"Please provide a image"});
    }
    
    const image=req.file.filename
    const {bannerName,bannerHeading,offerPrice,startDate,endDate}=req.body;

    const newSchema=new bannerModel({
      bannerName,
      bannerHeading,
      offerPrice,
      startDate,
      endDate,
      bannerImage:image
    });
     await newSchema.save()
     res.status(203).json({success:true,message:'Banner added Successfully'})
  }catch(error) {
    console.error("Error in adding the banner to the database", error);
    res.status(500).send('Internal Server Error');
  }
}

exports.editbannerGet=async(req,res)=>{
  try{
    let id = req.query.id;
    const bannerData=await  bannerModel.findById(id)
    res.render('admin/editbanner',{bannerData});
  }catch (error) {
    console.error('Error fetching banner:', error);
    res.status(404).json({success:false});
  }
}

exports.editbannerPost=async(req,res)=>{
  try{
    
    const id=req.query.id;
    const {bannerName,bannerHeading,offerPrice,startDate,endDate}=req.body;

    const banner=await bannerModel.findOne({_id:id});

    const bannerDetail={
      bannerName,
      bannerHeading,
      offerPrice,
      startDate,
      endDate,
      bannerImage:banner.bannerImage
    }
    if(req.file){
      const img=banner.bannerImage;
      const imagePath='./public/'+'uploads/'+img;
      if(fs.existsSync(imagePath)){
        fs.unlinkSync(imagePath)
      }
      const bannerImage=req.file.filename;
      bannerDetail.bannerImage=bannerImage;
    }
    await bannerModel.updateOne({_id:id},bannerDetail);
    res.redirect("/admin/bannerlist")
  } catch (error) {
    console.log('Error in updating the banner:', error);
    res.status(500).send('Error in updating the banner');
}
}

exports.deletebanner=async(req,res)=>{
  try{
    const id=req.query.id;
    const banner=await bannerModel.findOne({_id:id})
    const img=banner.bannerImage;
    const imagePath='./public/'+'uploads/'+img;
    if(fs.existsSync(imagePath)){
      fs.unlinkSync(imagePath);
    }
    await bannerModel.deleteOne({_id:id});
    res.status(203).json({ success: true,  message: "Banner Deleted Successfully" })
  }catch(error){
    console.log('Error in deleting banner', error);
    res.status(500).send('Internal Server Error');
}
}