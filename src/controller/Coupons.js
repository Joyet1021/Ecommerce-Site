const couponModel=require('./../../Models/couponmodel')

exports.couponlistGet = async(req, res) => {
    try{
    let coupon=await couponModel.find()

    res.render('admin/couponlist',{coupon});
    }catch(error){
        console.log('Error in getting couponlist',error);
        res.status(500).json({success:false})
    }
};


exports.addCouponGet=async(req,res)=>{
    try{
    res.render("admin/addcoupon")
    }catch(error){
        console.log('Error in add  Coupon page ', error);
        res.status(500).json({"Error": "Internal server error"});
    }
}
   

exports.addCouponPost = async (req, res) => {
    try {  
        const { couponCode, minimumPurchase, discountPercentage, startDate, endDate } = req.body;

        
        const newCoupon = new couponModel({
            couponCode,
            minimumPurchase,
            discountPercentage,
            startDate,
            endDate
        });

        await newCoupon.save();
        res.status(203).json({success:true,message:"Coupon Added Successfully"})
        
    } catch (error) {
        console.error('Error in adding coupon', error);
        res.status(500).send('Internal Server Error')
        
    }
};

exports.editCouponGet=async(req,res)=>{
    try{
        const id=req.query.id;
        const couponDetails=await couponModel.findOne({_id : id});
        console.log(couponDetails);
        res.render('admin/editcoupon',{couponDetails:couponDetails})
    }catch(error){
        console.log('Error in Edit Coupon Page', error);
        res.status(404).json({success:false});
    }
}

exports.editcouponPost=async(req,res)=>{
    try{
        const id=req.query.id;
        const {couponCode,minimumPurchase,discountPercentage,startDate,endDate}=req.body;
        const couponDetail=await couponModel.findOneAndUpdate(
            {_id:id},
            { 
                $set:{
                    couponCode,
                    minimumPurchase,
                    discountPercentage,
                    startDate,
                    endDate
                }
            }
        );
        res.redirect("/admin/couponlist");
    }catch(error){
    console.log('Error In Updating The Coupon Details',error);
    res.status(500).send('Internal Server Error');

    }
}

exports.deleteCoupon=async(req,res) =>{
    try{
        const id=req.query.id;
        await couponModel.deleteOne({_id:id})
        res.status(203).json({success:true,message:"Coupon Deleted Successfully"});
    } catch (error) {
        console.log('Error in deleting coupon', error);
        res.status(500).send('Internal Server Error');
    }
}