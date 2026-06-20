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


async function viewPDF(resourceName, pdfUrl) {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if(user){

        await supabase
        .from("pdf_views")
        .insert([
            {
                user_id: user.id,
                resource_name: resourceName,
                resource_url: pdfUrl
            }
        ]);

    }

    window.open(pdfUrl, "_blank");
}


async function saveBookmark(resourceName,pdfUrl){

    const {
        data:{ user }
    } = await supabase.auth.getUser();

    if(!user){

        alert("Please Login");

        return;
    }

    await supabase
    .from("bookmarks")
    .insert([
        {
            user_id:user.id,
            resource_name:resourceName,
            resource_url:pdfUrl
        }
    ]);

    alert("Bookmark Saved");
}


