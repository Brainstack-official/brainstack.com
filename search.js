async function searchResources() {

    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("searchResults");

    const response = await fetch("resources.json");
    const resources = await response.json();

    searchInput.addEventListener("input", function () {

        const query = this.value.toLowerCase().trim();

        resultsContainer.innerHTML = "";

        if (query === "") return;

        const matches = resources.filter(resource =>
            resource.title.toLowerCase().includes(query) ||
            resource.category.toLowerCase().includes(query)
        );

        matches.forEach(resource => {

            const item = document.createElement("div");

            item.className = "search-result";

            item.innerHTML = `
                <a href="${resource.url}" target="_blank">
                    <strong>${resource.title}</strong><br>
                    <small>${resource.category}</small>
                </a>
            `;

            resultsContainer.appendChild(item);
        });

    });

}

searchResources();