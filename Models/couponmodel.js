const mongoose=require('mongoose')

const schema={
    couponCode: { type : String , required : true },
    minimumPurchase: {type : Number},
    discountPercentage: {type :Number,required:true},
    startDate: {type : Date,default:()=>new Date()},
    endDate:{type : Date}
}
const CouponSchema =new mongoose.Schema(schema)
CouponSchema.index({endDate:1},{expireAfterSeconds:0});
const couponModel=mongoose.model("Coupondatas",CouponSchema);

module.exports=couponModel;