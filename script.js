// SMOOTH APPEAR ANIMATION
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

// OBSERVE RESOURCE CARDS
const cards = document.querySelectorAll(".resource-card");

cards.forEach((card) => {
  observer.observe(card);
});
document.querySelectorAll(".pdf-link").forEach(link => {

  link.addEventListener("click", async () => {

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("downloads")
      .insert([
        {
          user_id: user.id,
          pdf_name: link.parentElement.querySelector("h3").innerText,
          pdf_link: link.href
        }
      ]);

  });

});
