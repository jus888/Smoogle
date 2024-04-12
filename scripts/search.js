function createResultElement(hitData, parent) {
    const resultElement = resultTemplate.content.cloneNode(true);
    const title = resultElement.querySelector("h1");
    const para = resultElement.querySelector("p");
    title.innerHTML = hitData["dc_title"];
    para.innerHTML = hitData["dc_description"] ?? "Geen omschrijving";

    parent.appendChild(resultElement);
}

function populateResults(hitData) {
    resultContainer.innerHTML = "";    
    hitData.forEach(hit => createResultElement(hit, resultContainer))
}

const searchForm = document.querySelector("form");
const searchSubmit = document.querySelector("form > button");

const resultTemplate = document.querySelector("template");
const resultContainer = document.querySelector(".search-results");

searchSubmit.addEventListener("click", async function () {
    const formData = new FormData(searchForm);
    const queryString = new URLSearchParams(formData).toString();
    const file = await fetch("https://woogle.wooverheid.nl/search?" + queryString, {
        method: "get"
    });

    const resultsText = await file.text();
    const results = JSON.parse(resultsText);
    populateResults(results["hits"]);
});