const handleButtonClick = (e) => {
  if (e.target.closest("button")) {
    const expression = document.querySelector(".current-expression");
    const calculator = document.querySelector(".calculator-container");
    const buttonType = e.target.innerText;
    const prohibitedStartingTypes = ["×", "÷", "+", "-", "0", "="];
    const prohibitedRepeatedOps = ["×", "÷", "+", "-"];
    let lastChar =
      expression.innerText.length > 0 ? expression.innerText.at(-1) : null;
    const isEqualPressed = calculator.dataset.equalsPressed === "true";

    //Prohibit starting an expression with any button types in badStartingTypes
    if (
      !prohibitedStartingTypes.includes(buttonType) ||
      expression.innerText.length > 0
    ) {
      if (isEqualPressed && buttonType.match(/[0-9]/)) {
        expression.innerText = "";
        calculator.dataset.equalsPressed = "false";
      } else if (isEqualPressed && buttonType.match(/[×÷+-]/)) {
        calculator.dataset.equalsPressed = "false";
      }
      // Only update the display with digits or .
      if (buttonType.match(/[0-9.×÷+-]/)) {
        // prevent the user from entering multiple ++ or --, +×, +- etc.
        if (
          prohibitedRepeatedOps.includes(buttonType) &&
          prohibitedRepeatedOps.includes(lastChar)
        ) {
          return;
        }
        if (buttonType === "." && lastChar === ".") return;

        const deleteButton = document.querySelector("#delete");
        deleteButton.addEventListener("click", deleteLastCharacter);
        updateExpressionDisplay(buttonType);
      }
    }
  }
};

function performOperation(op, numArr) {
  if (numArr[1] === "0") {
    document.querySelector(".calculator-container").remove();
    return null;
  }
  let result = 0;
  switch (op) {
    case "+":
      result = numArr[0] + numArr[1];
      break;
    case "-":
      result = numArr[0] - numArr[1];
      break;
    case "÷":
      result = numArr[0] / numArr[1];
      break;
    case "×":
      result = numArr[0] * numArr[1];
      break;
  }
  return result;
}

function getOperands(opIdx, numbers) {
  const lhs = Number(numbers.at(opIdx));
  const rhs = Number(numbers.at(opIdx + 1));
  return [lhs, rhs];
}

function evaluateNextOperation(arr1, arr2, op1, op2) {
  let opIdx = 0;
  let result = 0;
  if (arr1.indexOf(op1) === -1) {
    opIdx = arr1.indexOf(op2);
  } else if (arr1.indexOf(op2) === -1) {
    opIdx = arr1.indexOf(op1);
  } else if (arr1.indexOf(op1) < arr1.indexOf(op2)) {
    opIdx = arr1.indexOf(op1);
  } else {
    opIdx = arr1.indexOf(op2);
  }
  result = performOperation(arr1.at(opIdx), getOperands(opIdx, arr2));
  if (result === null) {
    return null;
  }
  arr2.splice(opIdx, 2, result);
  arr1.splice(opIdx, 1);
}

function calculateResult() {
  let expressionElement = document.querySelector(".current-expression");
  let equation = expressionElement.innerText;
  if (!equation.length > 0) {
    return;
  }
  document
    .querySelector("#delete")
    .removeEventListener("click", deleteLastCharacter);
  const result = document.querySelector(".result");
  const numberList = equation.match(/[\d]+/g);
  const operatorList = equation.split("").filter((element) => isNaN(element));
  const opListLength = operatorList.length; //Need a constant length to run loop because opList is being spliced
  let total = 0;

  for (let i = 0; i <= opListLength; i++) {
    if (operatorList.includes("÷") || operatorList.includes("×")) {
      total = evaluateNextOperation(operatorList, numberList, "÷", "×");
    } else if (operatorList.includes("+") || operatorList.includes("-")) {
      total = evaluateNextOperation(operatorList, numberList, "+", "-");
    }
  }
  if (total === null) {
    return;
  }
  const rounded =
    Math.round((Number(numberList.join("")) + Number.EPSILON) * 1000) / 1000;
  expressionElement.innerText = rounded;
  result.innerText = rounded;

  document.querySelector(".calculator-container").dataset.equalsPressed =
    "true";
}

function updateExpressionDisplay(buttonText) {
  const expressionDisplay = document.querySelector(".current-expression");
  expressionDisplay.innerText += buttonText;
}

function resetCalculator() {
  const expression = document.querySelector(".current-expression");
  const result = document.querySelector(".result");
  if (expression) expression.innerText = "";
  if (result) result.innerText = "0";
  document.querySelector(".calculator-container").dataset.equalsPressed =
    "false";
}

function deleteLastCharacter() {
  const currentExpression = document.querySelector(".current-expression");
  if (
    currentExpression.innerText !== "" &&
    currentExpression.innerText.length > 0
  ) {
    currentExpression.innerText = currentExpression.innerText.slice(0, -1);
  }
}

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

  const symbols = {
    "×": "multiplication",
    "÷": "division",
    "+": "addition",
    "-": "subtraction",
    "=": "equals",
    ".": "decimal",
    0: "zero",
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    DEL: "delete",
    AC: "all-clear",
  };

  // create the deletion button row
  const clearingButtons = ["DEL", "AC"];
  for (let i = 0; i < 2; i++) {
    const deletionButton = document.createElement("button");
    deletionButton.innerText = clearingButtons[i];
    deletionButton.className = "clear-button";
    deletionButton.id = symbols[clearingButtons[i]];
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
          button.id = symbols[operators[i]];
          return (button.innerText = operators[i]);
        }
        // this creates the digit pad [789, 456, 123]
        button.id = symbols[digitStart];
        return (button.innerText = digitStart++);
      });
    } else if (i === cols - 1) {
      // create the last row
      buttonArray.map((button, idx) => {
        // last column is reserved for the operators
        if (idx === 3) {
          button.id = symbols[operators[i]];
          return (button.innerText = operators[i]);
        }
        // assigns ["0", ".", "="] to the last row
        button.id = symbols[lastRow[idx]];
        return (button.innerText = lastRow[idx]);
      });
    }
    // each successive row starts 5 before (9-5 = 4, 6-5 = 1)
    // -6 because of digitStart++ (first row ends at 10)
    digitStart -= 6;
  }

  calculatorContainer.className = "calculator-container";
  calculatorContainer.dataset.equalsPressed = "false";
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
  buttonContainer.addEventListener("click", handleButtonClick);
  const equalsButton = Array.from(buttonContainer.lastChild.childNodes).filter(
    (button) => button.id === "equals"
  )[0];
  equalsButton.addEventListener("click", calculateResult);
  const allClear = clearRow.lastChild;
  allClear.addEventListener("click", resetCalculator);
  calculatorContainer.append(calculatorDisplay, buttonContainer);
  body.appendChild(calculatorContainer);
}

createCalculator();
