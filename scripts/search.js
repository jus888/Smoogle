function createResultElement(hitData, parent) {
    const resultElement = resultTemplate.content.cloneNode(true);
    const titleLink = resultElement.querySelector("h1 > a");
    const para = resultElement.querySelector("p");
    titleLink.innerHTML = hitData["dc_title"];
    para.innerHTML = hitData["dc_description"] ?? "<i>Geen omschrijving</i>";

    const documentLink = "https://pid.wooverheid.nl/?pid=" + hitData["dc_identifier"];
    titleLink.setAttribute("href", documentLink);    

    parent.appendChild(resultElement);
}

function populateResults(hitData) {
    resultContainer.innerHTML = "";
    hitData.forEach(hit => createResultElement(hit, resultContainer))
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

async function search() {
    const formData = new FormData(searchForm);
    replaceListValuesFormData(formData);

    const queryString = new URLSearchParams(formData).toString();
    const file = await fetch("https://woogle.wooverheid.nl/search?" + queryString, {
        method: "get"
    });

    const resultsText = await file.text();
    const results = JSON.parse(resultsText);
    populateResults(results["hits"]);
}

const searchForm = document.querySelector("form");
const searchTextInput = document.querySelector(".search-bar > input");
const searchSubmit = document.querySelector(".search-bar > button");

const resultTemplate = document.querySelector("template");
const resultContainer = document.querySelector(".search-results");

searchSubmit.addEventListener("click", search);
searchTextInput.addEventListener("keyup", event => {
    if (event.key === "Enter") {
        search();
    }
});

search();