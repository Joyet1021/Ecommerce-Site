const submit = document.querySelector(".submit");
const errMsg = document.querySelector(".errorMsg");

submit.addEventListener("click", async (e) => {
    try {
        e.preventDefault(); // Prevent the default form submission behavior
        
        const addproductForm = document.getElementById("form_add");
        const form = new FormData(addproductForm);

        const productName = document.getElementsByName("productName")[0].value.trim();
        const price = document.getElementsByName("price")[0].value.trim();
        const quantity = document.getElementsByName("quantity")[0].value.trim();
        const category = document.getElementsByName("category")[0].value.trim();
        const subCategory = document.getElementsByName("subcategory")[0].value.trim();
        const deliverydate = document.getElementsByName("deliverydate")[0].value.trim();
        const description = document.getElementsByName("description")[0].value.trim();
        const productImage=document.getElementsByName("productImage")[0].value;
 
        


        if (!productName ||productName==""|| !price || !quantity || !category || !subCategory || !deliverydate|| !description||!productImage) {
            errMsg.innerHTML = "Please fill out all fields";
            setTimeout(() => {
                errMsg.innerHTML = "";
            }, 2000);
        } else {
            const response = await fetch("/admin/addproductpost", {
                method: "POST",
                body: form
            });

            if (!response.ok) {
                throw new Error("Error adding product: " + response.statusText);
            }

            const result = await response.json();

            if (result.success) {
                errMsg.innerHTML = "Product successfully added";
                errMsg.classList.add("success");
                setTimeout(() => {
                    window.location.href = "/admin/adminhome";
                }, 500);
            } else {
                errMsg.innerHTML = result.error || "Unknown error";
            }
        }
    } catch (error) {
        console.error('Error adding product:', error);
    }
});
