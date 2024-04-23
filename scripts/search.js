const searchForm = document.querySelector("form");
const searchTextInput = document.querySelector(".search-bar");
const searchFilterInputs = document.querySelectorAll(".filter-input")
const searchSubmit = document.querySelector(".search-button");

const resultTemplate = document.querySelector("template");
const resultContainer = document.querySelector(".search-results");
const resultPagination = document.querySelector(".result-pagination");

function createResultElement(hitData, parent) {
    const resultElement = resultTemplate.content.cloneNode(true);
    const titleLink = resultElement.querySelector("h1 > a");
    const para = resultElement.querySelector("p");
    titleLink.innerHTML = hitData.dc_title;
    para.innerHTML = hitData.dc_description ?? "<i>Geen omschrijving</i>";

    const documentLink = "https://pid.wooverheid.nl/?pid=" + hitData.dc_identifier;
    titleLink.setAttribute("href", documentLink);    

    parent.appendChild(resultElement);
}

function populateResults(hitData) {
    resultContainer.innerHTML = "";
    hitData.forEach(hit => createResultElement(hit, resultContainer))
}

function addPagination(results) {
    resultPagination.innerHTML = "";
    const page = results.parameters.page;
    const totalPages = results.total_pages;

    if (page > 1)
    {
        const previous = document.createElement("button");
        previous.textContent = "Vorige";
        previous.addEventListener("click", () => search(page - 1));
        resultPagination.appendChild(previous);
    }

    // Start is set to ensure that 10 buttons will be shown if possible
    // while keeping 5 buttons to the left of the current page number.
    const start = Math.max(page - 5, 1) - Math.max(page + 5 - results.total_pages, 0);
    const paginationLength = Math.min(totalPages, 10);
    for (let i = 0; i < paginationLength; i++) {
        const pageNum = start + i;

        const pageAnchor = document.createElement("button");
        pageAnchor.textContent = pageNum;

        if (pageNum === page) {
            pageAnchor.id ="current-page-pagination";
        } else {
            pageAnchor.addEventListener("click", () => search(pageNum));            
        }
        resultPagination.appendChild(pageAnchor);
    }

    if (page < totalPages)
    {
        const next = document.createElement("button");
        next.textContent = "Volgende";
        next.addEventListener("click", () => search(page + 1));
        resultPagination.appendChild(next);
    }
}

function setFilters() {
    const searchParams = new URLSearchParams(window.location.search);
    searchFilterInputs.forEach(input => {
        if (searchParams.has(input.name)) {
            const dataValue = searchParams.get(input.name);
            if (dataValue === "") {
                input.value = "";
            } else {
                input.value = dataValue;
                if (dataLists.includes(input.name)) {
                    const optionElement = document.querySelector(`option[data-value="${dataValue}"]`);
                    input.value = optionElement.value;
                }
            }
        }
        else {
            input.value = "";
        }
    });
}

const dataLists = [
    "publisher",
    "type"
];

function replaceListValuesFormData(formData) {
    for (const key of dataLists) {
        const value = formData.get(key);
        if (!value) {
            continue;
        }

        const optionElement = document.querySelector(`option[value="${value}"]`);
        if (!optionElement) {
            formData.delete(key);
            continue;
        }

        formData.set(key, optionElement.getAttribute("data-value"));
    }
}

function updatePage(resultsJson) {
    const results = JSON.parse(resultsJson);    
    populateResults(results.hits);
    addPagination(results);
    setFilters()
}

async function search(page = null, replace = false) {
    const formData = new FormData(searchForm);
    replaceListValuesFormData(formData);    

    if (page) {
        console.log(page)
        formData.set("page", page);
    }

    const queryString = new URLSearchParams(formData).toString();
    const file = await fetch("https://woogle.wooverheid.nl/search?" + queryString, {
        method: "get"
    });

    const resultsText = await file.text();

    if (replace) {
        history.replaceState(resultsText, "", "search.html?" + queryString);
    } else {
        history.pushState(resultsText, "", "search.html?" + queryString);
    }

    updatePage(resultsText)
}

window.addEventListener("popstate", (event) => {
    if (event.state) {
        updatePage(event.state);
    }
});

const listInputs = document.querySelectorAll("input[list]");
listInputs.forEach(input => {
    input.addEventListener('focus', () => input.select());
});

searchSubmit.addEventListener("click", () => search(1));
searchTextInput.addEventListener("keyup", event => {
    if (event.key === "Enter") {
        search(1);
    }
});

setFilters();
search(null, true);