const handleButtonClick = (e) => {
  const calculator = document.querySelector(".calculator-container");
  if (!calculator || calculator.dataset.dying === "true") return;

  if (e.target.closest("button")) {
    const expression = document.querySelector(".current-expression");
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
      //Prohibits user from deleting the result after pressing =, unless cleared
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
          let str = expression.innerText.slice(0, -1);
          expression.innerText = str += buttonType;
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

function updateExpressionDisplay(buttonText) {
  const expressionDisplay = document.querySelector(".current-expression");
  if (!expressionDisplay) return;
  expressionDisplay.innerText += buttonText;
}

function resetCalculator(e) {
  e.stopPropagation();
  const expression = document.querySelector(".current-expression");
  if (!expression) return;
  const result = document.querySelector(".result");
  if (expression) expression.innerText = "";
  if (result) result.innerText = "0";
  document.querySelector(".calculator-container").dataset.equalsPressed =
    "false";
}

function deleteLastCharacter() {
  const currentExpression = document.querySelector(".current-expression");
  if (!currentExpression) return;
  if (
    currentExpression.innerText !== "" &&
    currentExpression.innerText.length > 0
  ) {
    currentExpression.innerText = currentExpression.innerText.slice(0, -1);
  }
}

function byeBye() {
  const calculator = document.querySelector(".calculator-container");
  calculator.dataset.dying = "true";
  const expression = document.querySelector(".current-expression");
  const result = document.querySelector(".result");
  expression.innerText = "Mr. Stark, I dont feel so good.";
  result.innerText = "oh no...";

  calculator.classList.toggle("oopsy-doopsy");
  window.setTimeout(() => {
    document.querySelector(".calculator-container").remove();
  }, 3000);
}

function performOperation(op, numArr) {
  let result = 0;
  console.log(numArr);
  switch (op) {
    case "+":
      result = numArr[0] + numArr[1];
      console.log(result);
      break;
    case "-":
      result = numArr[0] - numArr[1];
      console.log(result);

      break;
    case "÷":
      if (numArr[1] === 0) {
        byeBye();
        return null;
      }
      result = numArr[0] / numArr[1];
      console.log(result);
      break;
    case "×":
      result = numArr[0] * numArr[1];
      console.log(result);
      break;
  }
  return result;
}

function getOperands(opIdx, numbers) {
  const lhs = parseFloat(numbers.at(opIdx));
  const rhs = parseFloat(numbers.at(opIdx + 1));
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
  if (result === null) return null;

  //deletes the 2 numbers and op just evaluated and replaces with result
  arr2.splice(opIdx, 2, result);
  arr1.splice(opIdx, 1);

  console.log("arr2", arr2);
  console.log("arr1", arr1);
}

function calculateResult(e) {
  e.stopPropagation();
  let expressionElement = document.querySelector(".current-expression");
  let equation = expressionElement.innerText;
  const checkLastChar = equation.at(-1);
  if (
    !expressionElement ||
    !equation.length > 0 ||
    checkLastChar.match(/[×÷+-]/)
  )
    return;

  document
    .querySelector("#delete")
    .removeEventListener("click", deleteLastCharacter);
  const result = document.querySelector(".result");
  const numberList = equation.match(/[.\d.]+/g);
  console.log(numberList);
  const operatorList = equation.match(/[×÷+-]/g);
  const opListLength = operatorList.length; //Need a constant length to run loop because opList is being spliced
  let total = 0;

  for (let i = 0; i <= opListLength; i++) {
    if (operatorList.includes("÷") || operatorList.includes("×")) {
      total = evaluateNextOperation(operatorList, numberList, "÷", "×");
      if (total === null) return;
    } else if (operatorList.includes("+") || operatorList.includes("-")) {
      total = evaluateNextOperation(operatorList, numberList, "+", "-");
    }
  }

  const rounded =
    Math.round((Number(numberList.join("")) + Number.EPSILON) * 1000) / 1000;
  expressionElement.innerText = rounded;
  result.innerText = rounded;

  document.querySelector(".calculator-container").dataset.equalsPressed =
    "true";
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

  calculatorContainer.className = "calculator-container";
  calculatorContainer.dataset.equalsPressed = "false";
  calculatorDisplay.className = "display-container";
  expression.className = "current-expression";
  result.className = "result";
  result.innerText = "0";
  calculatorDisplay.append(expression, result);

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

  const buttonLayout = [
    ["DEL", "AC", "", ""],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "÷"],
    ["1", "2", "3", "+"],
    [".", "0", "=", "-"],
  ];

  buttonLayout.forEach((row) => {
    const buttonRow = document.createElement("div");
    buttonRow.className = "button-row";
    row.forEach((buttonLabel) => {
      if (buttonLabel === "") return;
      const button = document.createElement("button");
      button.id = symbols[buttonLabel];
      button.innerText = buttonLabel;
      if (buttonLabel.match(/[0-9]/)) {
        button.className = "digit-button";
      } else if (buttonLabel.match(/[×÷+-]/)) {
        button.className = "operator-button";
      } else if (buttonLabel === "=") {
        button.className = "equals-button";
        button.addEventListener("click", calculateResult);
      } else if (buttonLabel === "AC" || buttonLabel === "DEL") {
        if (buttonLabel === "AC") {
          button.className = "clear-button";
          button.addEventListener("click", resetCalculator);
        } else {
          button.className = "delete-button";
        }
      } else {
        button.className = "misc";
      }

      button.classList.add("is-pressed");
      buttonRow.appendChild(button);
    });
    buttonContainerFragment.appendChild(buttonRow);
  });

  buttonContainer.className = "button-container";
  buttonContainer.appendChild(buttonContainerFragment);
  buttonContainer.addEventListener("click", handleButtonClick);
  calculatorContainer.append(calculatorDisplay, buttonContainer);
  body.appendChild(calculatorContainer);
}

createCalculator();
