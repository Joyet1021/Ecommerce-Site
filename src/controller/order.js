const cartModel=require("../../Models/cart");
const productModel=require("../../Models/productdetails")

exports.checkoutGet=async(req,res)=>{
    try{
        const userId = req.session.user._id;
        console.log(req.query,'kokoko');
        let total=0;
        let productId=0;
        let order=0;
        if(req.query.total){
            total=req.query.total
            const cart=await cartModel.findOne({userid:userId}).populate('productsid.productid');
            order=cart.productsid
            req.session.preorder=order;
        }else{
            const productId=req.query.productid;
            const size=req.query.size;
            const color=req.query.color;
            const qty=req.query.quantity;
            const productid=await productModel.findOne({_id:productId});
            order=[{productid,quantity:qty,size:size,color:color}]
            total=(order[0].productid.discount*qty);
            req.session.preorder=order;
            quantity=req.query.quantity;
            
            
        }
        console.log(order,'jinkaka');
      console.log(req.session.preorder,'loki');


        res.render('user/checkout',{order,total})

    }catch{

    }
}

