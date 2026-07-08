async function searchResources() {

    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("searchResults");

    if (!searchInput || !resultsContainer) return;

    let resources = [];

    // Try current folder first
    try {
        let response = await fetch("./resources.json");

        if (!response.ok) {
            response = await fetch("../resources.json");
        }

        resources = await response.json();

    } catch (error) {
        console.error("Cannot load resources.json", error);
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

            item.innerHTML = `
                <a href="${resource.url}">
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
