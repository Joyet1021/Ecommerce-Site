const submit = document.querySelector(".submit");
const message = document.querySelector(".message");

submit.addEventListener("click", async (e) => {
    try {
        e.preventDefault();
        

        const addcategoryForm = document.getElementById('addCategory');
        const form = new FormData(addcategoryForm);
console.log(form);
        const categoryName = document.getElementsByName('categoryName')[0].value;  // get the value of input field by its name attribute
        const subCategory = document.getElementsByName('subCategory')[0].value;  // get the value of input field by its name
console.log(categoryName);
        if (!categoryName || !subCategory) {
            message.textContent = "Please fill all fields";
            setTimeout(() => {
                message.textContent = "";
            }, 1000);
        } else {
            console.log('hii');
            // Disable the submit button to prevent multiple submissions

            const response = await fetch("/admin/addCategory", {
                method:"POST",
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify(Object.fromEntries(form))
            });

            if (!response.ok) {
                throw new Error("Error adding Category: " + response.statusText);
            }

            const result = await response.json();

            if (result.success) {
                message.textContent = "Category added successfully";
                message.classList.add("success");
                setTimeout(() => {
                    window.location.href = "/admin/categories";
                }, 500);
            } else {
                message.textContent = result.error || "Unknown error";
            }

            submit.disabled = false; // Enable the submit button after request completion
        }
    } catch (error) {
        console.error("Error adding category",error); // Log the error for debugging purposes
        message.textContent = "An error occurred. Please try again.";
        setTimeout(() => {
            message.textContent = "";
        }, 500);
    }
});
