const submit=document.querySelector(".submit");
const message=document.querySelector(".message");

submit.addEventListener("click",async(e)=>{
    try{
        e.preventDefault();
        const addbannerForm=document.getElementById("add_banner");
        const form=new FormData(addbannerForm);
        
        const bannerName=document.getElementsByName("bannerName")[0].value;
        const bannerHeading=document.getElementsByName("bannerHeading")[0].value;
        const offerPrice=document.getElementsByName("offerPrice")[0].value;
        const startDate=document.getElementsByName("startDate")[0].value;
        const endDate=document.getElementsByName("endDate")[0].value;
        
        // const img=document.getElementById('banner_image').files[0];
        // form.append('bannerImage',img);
        
        if(!bannerName||!bannerHeading||!offerPrice||!startDate||!endDate){
                message.textContent= "All fields are required";
                setTimeout(()=>{
                        message.innerHTML="";
                    },1000);
                }else{
                    const response=await fetch("/admin/addbannerPost",{
                        header :{
                            "content-Type" : "multipart/form-data"
                        },
                        method:'POST',
                        body:form
                    });
                    
                   
            if (!response.ok) {
                throw new Error("Error adding banner: " + response.statusText);
            }

            const result = await response.json();

            if (result.success==true) {
                message.innerHTML = "Banner successfully added";
                message.classList.add("success");
                setTimeout(() => {
                    window.location.href = "/admin/bannerlist";
                }, 500);
            } else {
                message.innerHTML = result.error || "Unknown error";
            }
        }
    } catch (error) {
        console.error('Error adding product:', error);
    }
});
