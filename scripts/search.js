const searchForm = document.querySelector("form");
const searchTextInput = document.querySelector(".search-bar > input");
const searchSubmit = document.querySelector(".search-bar > button");

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

async function search(page = 1) {
    const formData = new FormData(searchForm);
    formData.set("page", page);
    replaceListValuesFormData(formData);

    const queryString = new URLSearchParams(formData).toString();
    const file = await fetch("https://woogle.wooverheid.nl/search?" + queryString, {
        method: "get"
    });

    const resultsText = await file.text();
    const results = JSON.parse(resultsText);
    populateResults(results.hits);
    addPagination(results);
}

const listInputs = document.querySelectorAll("input[list]");
listInputs.forEach(input => {
    input.addEventListener('focus', () => input.select());
});

searchSubmit.addEventListener("click", () => search());
searchTextInput.addEventListener("keyup", event => {
    if (event.key === "Enter") {
        search();
    }
});

search();