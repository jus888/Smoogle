function createResultElement(resultData) {
    const resultElement = document.createElement("div");
    resultElement.classList.add("result");
    resultElement.innerHTML = resultData["dc_title"];
    return resultElement;
}

function populateResults(hitData) {
    const resultElements = hitData.map(createResultElement);
    resultContainer.innerHTML = "";
    resultElements.forEach(element => {
        resultContainer.appendChild(element);
    });
}

const searchForm = document.querySelector("form");
const searchSubmit = document.querySelector("form > button");
const resultContainer = document.querySelector(".result-container");

searchSubmit.addEventListener("click", async function () {
    const formData = new FormData(searchForm);
    const queryString = new URLSearchParams(formData).toString();
    const file = await fetch("https://woogle.wooverheid.nl/search?" + queryString, {
        method: "get"
    })

    const resultsText = await file.text();
    const results = JSON.parse(resultsText);
    populateResults(results["hits"]);
});