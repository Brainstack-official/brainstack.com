
script.js

```javascript
// SMOOTH APPEAR ANIMATION

const observer = new IntersectionObserver((entries) => {

  entries.forEach((entry) => {

    if(entry.isIntersecting){
      entry.target.classList.add("show");
    }

  });

});

const cards = document.querySelectorAll(".resource-card");

cards.forEach((card) => {
  observer.observe(card);
});
