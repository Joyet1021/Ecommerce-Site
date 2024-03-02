const submit = document.querySelector(".add_new_btn");
const message = document.querySelector(".error_msg");

submit.addEventListener("click", async (e) => {
    try {
        e.preventDefault(); // Prevent the default form submission behavior

        const addaddressForm = document.getElementById("adrress_form");
        const form = new FormData(addaddressForm);

        const firstname = document.getElementById("firstname").value;
        console.log(firstname,'asfadfas')
        const lastname = document.getElementsByName("lastname").value.trim();
        const mobilenum = document.getElementsByName("mobilenum").value.trim();
        const country = document.getElementsByName("country").value.trim();
        const state = document.getElementsByName("state").value.trim();
        const district = document.getElementsByName("district").value.trim();
        const zip = document.getElementsByName("zip").value.trim();
       console.log(zip,district,state,country,mobilenum,lastname,firstname,"Address Details");

        if (!firstname || !lastname || !mobilenum || !country || !state || !district || !zip ) {
            message.textContent = "Please fill out all fields";
            setTimeout(() => {
                message.innerHTML = "";
            }, 2000);
        } else {
            const response = await fetch("/user/newaddress", {
                method: "POST",
                body: form
            });

            if (!response.ok) {
                throw new Error("Error adding address: " + response.statusText);
            }

            const result = await response.json();

            if (result.success) {
                message.textContent = "Address successfully added";
                setTimeout(() => {
                    window.location.href = "/user/newaddress";
                }, 500);
            } else {
                message.textContent = result.error || "Unknown error";
            }
        }
    } catch (error) {
        console.error('Error adding address:', error);
    }
});
