const mongoose=require('mongoose')

const schema={
    couponCode: { type : String , required : true },
    minimumPurchase: {type : Number},
    discountPercentage: {type :Number,required:true},
    startDate: {type : Date},
    endDate:{type : Date}
}
const CouponSchema =new mongoose.Schema(schema)
const couponModel=mongoose.model("Coupondatas",CouponSchema);

module.exports=couponModel;