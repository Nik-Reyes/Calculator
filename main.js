const handleButtonType = (e) => {
  if (e.target.closest("button")) {
    const buttonType = e.target.innerText;
    if (buttonType !== "AC" && buttonType !== "DEL") {
      updateExpressionDisplay(buttonType);
    }
    if (e.target.innerText === "AC") resetDisplay();
    if (e.target.innerText === "DEL") deleteLastEntry();
  }
};

function updateExpressionDisplay(buttonText) {
  const expressionDisplay = document.querySelector(".current-expression");
  console.log(expressionDisplay);
  expressionDisplay.innerText += buttonText;
}

function resetDisplay() {
  const initialState = ["", "0"];
  Array.from(document.querySelector(".display-container").childNodes).forEach(
    (partition, i) => {
      partition.innerText = initialState[i];
    }
  );
  console.log("hi");
}

function resetExpressionDisplay() {
  document.querySelector(".display-container .current-expression").innerText =
    "";
}

function deleteLastEntry() {
  const currentExpression = document
    .querySelector(".current-expression")
    .innerText.slice(0, -1);

  resetExpressionDisplay();
  updateExpressionDisplay(currentExpression);
}

// need to update display
// need to implement AC function
// need to implement DEL function
// need to update result
// need to calculate
// when parsing the numbers

function createCalculator(rows = 4, cols = 4) {
  // attach all elements to the fragment, and at the end, append the fragment to the
  // actual calculator container
  const body = document.querySelector("body");
  const calculatorContainer = document.createElement("div");
  const buttonContainer = document.createElement("section");
  const buttonContainerFragment = document.createDocumentFragment();
  const calculatorDisplay = document.createElement("div");
  const expression = document.createElement("div");
  const result = document.createElement("div");
  const buttonRow = document.createElement("div");
  const clearRow = document.createElement("section");
  buttonRow.className = "button-row";

  // create the deletion button row
  const clearingButtons = ["DEL", "AC"];
  for (let i = 0; i < 2; i++) {
    const deletionButton = document.createElement("button");
    deletionButton.innerText = clearingButtons[i];
    deletionButton.className = "clear-button";
    clearRow.appendChild(deletionButton);
  }

  // create the digits+operators
  for (let i = 0; i < cols; i++) {
    const digitButton = document.createElement("button");
    buttonRow.appendChild(digitButton);
  }

  // Create n rows and assign all buttons their respective innerText
  let digitStart = 7;
  const operators = ["×", "÷", "+", "-"];
  const lastRow = ["0", ".", "="];
  for (let i = 0; i < cols; i++) {
    // a row will be cloned 4 times
    buttonContainerFragment.appendChild(buttonRow.cloneNode(true));

    // "intercept" the current row inside the fragment, and assign innertext
    buttonArray = Array.from(buttonContainerFragment.childNodes[i].childNodes);

    // last row buttons are assigned innerText from array
    if (i < cols - 1) {
      buttonArray.map((button, idx) => {
        // the last column is reserved for the operators
        if (idx === 3) {
          return (button.innerText = operators[i]);
        }
        // this creates the digit pad [789, 456, 123]
        return (button.innerText = digitStart++);
      });
    } else if (i === cols - 1) {
      // create the last row
      buttonArray.map((button, idx) => {
        // last column is reserved for the operators
        if (idx === 3) {
          return (button.innerText = operators[i]);
        }
        // assigns ["0", ".", "="] to the last row
        return (button.innerText = lastRow[idx]);
      });
    }
    // each successive row starts 5 before (9-5 = 4, 6-5 = 1)
    // -6 because of digitStart++ (first row ends at 10)
    digitStart -= 6;
  }

  calculatorContainer.className = "calculator-container";
  calculatorDisplay.className = "display-container";
  expression.className = "current-expression";
  result.className = "result";
  result.innerText = "0";
  calculatorDisplay.append(expression, result);
  clearRow.className = "clear-button-container";
  buttonContainerFragment.insertBefore(
    clearRow,
    buttonContainerFragment.firstChild
  );
  buttonContainer.className = "button-container";
  buttonContainer.appendChild(buttonContainerFragment);
  buttonContainer.addEventListener("click", handleButtonType);
  calculatorContainer.append(calculatorDisplay, buttonContainer);
  body.appendChild(calculatorContainer);
}

createCalculator();
