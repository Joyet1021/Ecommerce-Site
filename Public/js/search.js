document.getElementById("search_btn")
.addEventListener("click", async function() {
    const searchInput = document.getElementById("search_input").value;
    try {console.log(searchInput);
        window.location.href=`/user/search?product=${searchInput}`
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
});
