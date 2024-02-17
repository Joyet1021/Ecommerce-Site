const submit=document.querySelector(".submit");
const message=document.querySelector(".message");

submit.addEventListener("click",async(e)=>{
    try{
        
        e.preventDefault();
        const addcouponForm=document.getElementById("add_coupon");
        let formData = new FormData(addcouponForm);

        const couponCode=document.getElementsByName("couponCode")[0].value.trim();
        const minimumPurchase=document.getElementsByName("minimumPurchase")[0].value.trim();
        const discountPercentage=document.getElementsByName("discountPercentage")[0].value.trim();
        const startDate=document.getElementsByName("startDate")[0].value;
        const endDate=document.getElementsByName("endDate")[0].value.trim();
        console.log(couponCode,minimumPurchase,discountPercentage,startDate,endDate);
        if(!couponCode||!minimumPurchase||!discountPercentage||!startDate||!endDate){
            message.textContent="Please fill out all fields";
            setTimeout(()=>{
                message.innerHTML="";
            },1000);
        }else{
            const response=await fetch("/admin/addcoupon",{
                method:"POST",
                headers:{
                 'Content-Type':"application/json"
                },
                body:JSON.stringify(Object.fromEntries(formData))
            });

            if(!response.ok){
                throw new Error("Error in adding Coupon:"+response.statusText)
            }
            const result=await response.json();

            if(result.success==true){
                message.innerHTML="Coupon added successfully";
                message.classList.add("success");
                setTimeout(()=>{
                    window.location.href="/admin/couponlist"
                },1000);
            }else{
                message.innerHTML=result.error||"Unknown error";
            }
        }

    }catch(error){
        console.log('error adding coupon',error);
    }
})