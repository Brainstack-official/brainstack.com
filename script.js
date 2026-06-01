
# script.js

```javascript
// SEARCH FEATURE

const searchInput = document.getElementById("searchInput");

const cards = document.querySelectorAll(".resource-card");

searchInput.addEventListener("keyup", () => {

  const value = searchInput.value.toLowerCase();

  cards.forEach((card) => {

    const keywords = card.dataset.search.toLowerCase();

    if(keywords.includes(value)){
      card.style.display = "block";
    }
    else{
      card.style.display = "none";
    }

  });

});


// SMOOTH APPEAR ANIMATION

const observer = new IntersectionObserver((entries) => {

  entries.forEach((entry) => {

    if(entry.isIntersecting){
      entry.target.classList.add("show");
    }

  });

});


cards.forEach((card) => {
  observer.observe(card);
});







const resources = [
{
title:"Mechanical engineering complete guide",
keywords:["Mechanical engineering","Engineering","engineering"],
url:"engineering-hub/Mechanical_Engineering_Guide.pdf"
},

{

}
];
