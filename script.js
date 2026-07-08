console.log("SCRIPT.JS LOADED");

// ===============================
// Fade Animation
// ===============================

const observer = new IntersectionObserver((entries)=>{

entries.forEach((entry)=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},{
threshold:0.15
});

document.querySelectorAll(

".resource-card,.feature,.journey-card,.community-card,.stat,.floating-card"

).forEach((el)=>{

el.classList.add("fade-up");

observer.observe(el);

});


// =========================
// PAGE LOADER
// =========================

window.addEventListener("load", () => {

    setTimeout(() => {

        const loader = document.getElementById("loader");

        if (loader) {

            loader.style.opacity = "0";
            loader.style.visibility = "hidden";

            setTimeout(() => {
                loader.style.display = "none";
            }, 400);

        }

    }, 1000); // 1 second

});
