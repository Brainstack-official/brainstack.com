async function searchResources() {
    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("searchResults");

    if (!searchInput || !resultsContainer) return;

    let resources = [];

    // Always fetch directly from your root domain to prevent subdirectory alignment issues
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

    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase().trim();
        resultsContainer.innerHTML = "";

        if (query === "") {
            resultsContainer.style.display = "none";
            return;
        }

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

        matches.forEach(resource => {
            const item = document.createElement("div");
            item.className = "search-result";

            // Sanitize and force absolute path mapping lines on URLs
            let finalUrl = resource.url.trim();
            if (!finalUrl.startsWith("/") && !finalUrl.startsWith("http")) {
                finalUrl = "/" + finalUrl;
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

    // Hide results when clicking outside
    document.addEventListener("click", function (e) {
        if (!e.target.closest(".search-container")) {
            resultsContainer.style.display = "none";
        }
    });
}

searchResources();
