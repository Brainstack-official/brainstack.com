console.log("BRAINSTACK CORE SCRIPT LOADED");

// =====================================================
// 1. PAGE LOADER INITIALIZATION
// =====================================================
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
    }, 1000); // 1-second delay
});

// =====================================================
// 2. INTERSECTION OBSERVER (FADE-UP ANIMATIONS)
// =====================================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.15
});

document.querySelectorAll(
    ".resource-card, .feature, .journey-card, .community-card, .stat, .floating-card"
).forEach((el) => {
    el.classList.add("fade-up");
    observer.observe(el);
});

// =====================================================
// 3. GLOBAL MONETIZED SEARCH SYSTEM
// =====================================================
async function searchResources() {
    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("searchResults");

    // Exit silently if the current page doesn't have a search bar
    if (!searchInput || !resultsContainer) return;

    let resources = [];

    // Fetch master resource file from the absolute root directory
    try {
        const response = await fetch("/resources.json");
        if (!response.ok) {
            throw new Error(`Server returned status code: ${response.status}`);
        }
        resources = await response.json();
    } catch (error) {
        console.error("Critical: Could not load global resources.json dataset", error);
        return;
    }

    // Input monitoring event loop
    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase().trim();
        resultsContainer.innerHTML = "";

        if (query === "") {
            resultsContainer.style.display = "none";
            return;
        }

        // Filter out up to 8 matched array indices
        const matches = resources
            .filter(resource =>
                resource.title.toLowerCase().includes(query) ||
                resource.category.toLowerCase().includes(query)
            )
            .slice(0, 8);

        if (matches.length === 0) {
            resultsContainer.style.display = "none";
            return;
        }

        // Build dynamic result nodes
        matches.forEach(resource => {
            const item = document.createElement("div");
            item.className = "search-result";

            // Sanitize and force absolute path mapping lines on URLs
            let finalUrl = resource.url.trim();
            if (!finalUrl.startsWith("/") && !finalUrl.startsWith("http")) {
                finalUrl = "/" + finalUrl;
            }

            // SMART AD ROUTER: Intercept direct PDF strings and route through view-pdf wrapper
            if (finalUrl.toLowerCase().endsWith('.pdf')) {
                finalUrl = `/view-pdf.html?file=${encodeURIComponent(finalUrl)}`;
            }

            item.innerHTML = `
                <a href="${finalUrl}">
                    <strong>${resource.title}</strong><br>
                    <small>${resource.category}</small>
                </a>
            `;
            resultsContainer.appendChild(item);
        });

        resultsContainer.style.display = "block";
    });

    // Close dropdown instantly when clicking clear of the input module
    document.addEventListener("click", function (e) {
        if (!e.target.closest(".search-container")) {
            resultsContainer.style.display = "none";
        }
    });
}

// Fire up the search mechanics
searchResources();
