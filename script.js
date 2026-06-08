import { createClient }
from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://waeeeyktjujpvpcprhbv.supabase.co",
  "sb_publishable_4HE-L3GRIkDq4wSIaxWyJw_vtngeHdj"
);

// Route protection
const {
  data: { session }
} = await supabase.auth.getSession();

if (!session) {
  window.location.href = "login.html";
}

// Show profile photo if it exists
const userPhoto = document.getElementById("userPhoto");

if (session && userPhoto) {
  userPhoto.src =
    session.user.user_metadata.avatar_url ||
    session.user.user_metadata.picture ||
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
}

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
