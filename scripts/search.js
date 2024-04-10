const jsonInput = document.querySelector("#json-file");
const resultContainer = document.querySelector(".result-container");

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

jsonInput.addEventListener("change", () => {
    const file = jsonInput.files[0];
    const resultsText = file.text();
    resultsText.then(text => {
        const results = JSON.parse(text);
        populateResults(results["hits"]);
    });
});