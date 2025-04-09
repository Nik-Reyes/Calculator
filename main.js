const handleButtonClick = (e) => {
  const calculator = document.querySelector(".calculator-container");
  if (
    elementExists(calculator) === false ||
    calculator.dataset.dying === "true"
  )
    return;

  const button = e.type === "click" ? e.target : e;
  if (button.closest("button")) {
    const currentButton = button.innerText;
    const isEqualPressed = calculator.dataset.equalsPressed === "true";

    if (isValid(currentButton, isEqualPressed, calculator) === false) {
      return;
    } else {
      updateExpressionElement(currentButton);
    }
  }
};

function isValid(currentButton, isEqualPressed, calculator) {
  const expressionElement = document.querySelector(".current-expression");
  if (elementExists(expressionElement) === false) return;
  let currentExpression = expressionElement.innerText;
  const newExpression = currentExpression + currentButton;
  const prohibitedStartingTypes = ["×", "÷", "+", "-", "="];
  let previousButton = expressionElement.innerText.at(-1) || null;

  // Prohibits operators as the first character
  if (
    currentExpression.length === 0 &&
    prohibitedStartingTypes.includes(currentButton)
  ) {
    return false;
  }

  // Allows only these button types
  if (!currentButton.match(/[0-9.×÷+-]/)) {
    return false;
  }

  // Prohibits repeated operators and allows user to change current operator w/o deleting
  if (
    currentButton.match(/[×÷+-]/) &&
    previousButton &&
    previousButton.match(/[×÷+-]/)
  ) {
    expressionElement.innerText =
      currentExpression.slice(0, -1) + currentButton;
    return false;
  }

  //Prohibits back-to-back decimals
  if (currentButton === ".") {
    if (previousButton === ".") {
      return false;
    }
    // Prohibits input like 12.3.56.5 || 12.3 + 12.3.56.5 || 12.3 + 10 + 12.3 + 12.3.56.5
    // Grab either the most recent string after an operator or test the current input
    const currentString = newExpression.match(/[×÷+-]/)
      ? newExpression.split(/[\+\×\-\÷]/).at(-1)
      : newExpression;

    const decimalsArray = currentString.match(/[\.]/g);
    const decimalCount = decimalsArray ? decimalsArray.length : 0;

    if (decimalCount > 1) {
      return false;
    }
    if (previousButton === null || !previousButton.match(/[0-9]/)) {
      expressionElement.innerText += "0";
    }
  }

  // Determines next action if equals is pressed
  if (isEqualPressed) {
    if (currentButton.match(/[0-9]/)) {
      expressionElement.innerText = "";
      calculator.dataset.equalsPressed = "false";
    } else if (currentButton.match(/[×÷+-]/)) {
      calculator.dataset.equalsPressed = "false";
    }
    const deleteElement = document.querySelector("#delete");
    if (elementExists(deleteElement) === false) return;
    deleteElement.addEventListener("click", deleteLastCharacter);
  }

  return true;
}

function elementExists(...args) {
  return args.every((element) => element !== null && element !== undefined);
}

function updateExpressionElement(buttonText) {
  const expressionElement = document.querySelector(".current-expression");
  if (elementExists(expressionElement) === false) {
    return;
  } else {
    expressionElement.innerText += buttonText;
  }
}

function resetCalculator(e) {
  e.stopPropagation();
  const expressionElement = document.querySelector(".current-expression");
  const resultElement = document.querySelector(".result");
  if (elementExists(expressionElement, resultElement) === false) {
    return;
  } else {
    expressionElement.innerText = "";
    resultElement.innerText = "0";
    const calculator = document.querySelector(".calculator-container");
    if (elementExists(calculator) === false) return;
    calculator.dataset.equalsPressed = "false";
    // calculator.focus();
  }
}

function deleteLastCharacter() {
  const expressionElement = document.querySelector(".current-expression");
  const calculator = document.querySelector(".calculator-container");
  if (elementExists(expressionElement, calculator) === false) return;
  if (calculator.dataset.equalsPressed === "true") return;
  if (expressionElement.innerText.length > 0) {
    expressionElement.innerText = expressionElement.innerText.slice(0, -1);
  }
}

function byeBye() {
  const calculator = document.querySelector(".calculator-container");
  const expressionElement = document.querySelector(".current-expression");
  const resultElement = document.querySelector(".result");
  if (elementExists(calculator, expressionElement, resultElement) === false)
    return;
  calculator.dataset.dying = "true";
  expressionElement.innerText = "Mr. Stark, I dont feel so";
  resultElement.innerText = "oh no...";

  calculator.classList.toggle("oopsy-doopsy");
  window.setTimeout(() => {
    calculator.remove();
  }, 2900);
}

function performOperation(op, numArr) {
  let result = 0;
  switch (op) {
    case "+":
      result = numArr[0] + numArr[1];
      break;
    case "-":
      result = numArr[0] - numArr[1];
      break;
    case "÷":
      if (numArr[1] === 0) {
        byeBye();
        return null;
      }
      result = numArr[0] / numArr[1];
      break;
    case "×":
      result = numArr[0] * numArr[1];
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
  let expressionResult = 0;
  if (arr1.indexOf(op1) === -1) {
    opIdx = arr1.indexOf(op2);
  } else if (arr1.indexOf(op2) === -1) {
    opIdx = arr1.indexOf(op1);
  } else if (arr1.indexOf(op1) < arr1.indexOf(op2)) {
    opIdx = arr1.indexOf(op1);
  } else {
    opIdx = arr1.indexOf(op2);
  }
  expressionResult = performOperation(arr1.at(opIdx), getOperands(opIdx, arr2));
  return expressionResult === null
    ? null
    : (arr2.splice(opIdx, 2, expressionResult), arr1.splice(opIdx, 1));
}

function calculateResult(e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }

  let expressionElement = document.querySelector(".current-expression");
  const resultElement = document.querySelector(".result");
  if (elementExists(expressionElement, resultElement) === false) return;

  let currentExpression = expressionElement.innerText;
  const checkLastChar = currentExpression.at(-1);
  if (currentExpression.length === 0 || checkLastChar.match(/[×÷+-]/)) return;

  const numberList = currentExpression.match(/[.\d.]+/g);
  const operatorList = currentExpression.match(/[×÷+-]/g);
  if (!operatorList) {
    resultElement.innerText = currentExpression;
    return;
  }
  if (numberList.length === 1 && operatorList) {
    return;
  }

  const calculator = document.querySelector(".calculator-container");
  if (elementExists(calculator) === false) return;
  calculator.dataset.equalsPressed = "true";

  const deleteElement = document.querySelector("#delete");
  if (elementExists(deleteElement) === false) return;
  deleteElement.removeEventListener("click", deleteLastCharacter);

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
    Math.round((Number(numberList[0]) + Number.EPSILON) * 1000) / 1000;
  expressionElement.innerText = rounded;
  resultElement.innerText = rounded;
}

function createCalculator(rows = 4, cols = 4) {
  const body = document.querySelector("body");
  const calculatorCasing = document.createElement("div");
  const calculatorContainer = document.createElement("div");
  const buttonContainer = document.createElement("section");
  const buttonContainerFragment = document.createDocumentFragment();
  const calculatorDisplay = document.createElement("div");
  const expression = document.createElement("div");
  const result = document.createElement("div");

  calculatorCasing.className = "calculator-casing";
  calculatorContainer.className = "calculator-container";
  // calculatorContainer.tabIndex = 0;
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
          button.addEventListener("click", deleteLastCharacter);
          button.className = "delete-button";
        }
      } else {
        button.className = "misc";
      }
      buttonRow.appendChild(button);
    });
    buttonContainerFragment.appendChild(buttonRow);
  });

  buttonContainer.className = "button-container";
  buttonContainer.appendChild(buttonContainerFragment);
  buttonContainer.addEventListener("click", handleButtonClick);
  calculatorContainer.append(calculatorDisplay, buttonContainer);
  calculatorCasing.appendChild(calculatorContainer);
  body.appendChild(calculatorCasing);

  window.addEventListener("keydown", (e) => {
    const keyObject = {
      button: (key) => {
        const keyMap = {
          "*": "×",
          "/": "÷",
        };
        const buttonArray = Array.from(buttonContainer.childNodes)
          .flatMap((row) => Array.from(row.childNodes))
          .filter(
            (button) =>
              button.id === symbols[key] || button.id === symbols[keyMap[key]]
          );
        return buttonArray[0];
      },
    };

    if (!e.repeat) {
      const key = e.key.toLowerCase();
      if (key === "backspace") {
        deleteLastCharacter();
      } else if (key === "=" || key === "enter") {
        e.preventDefault();
        calculateResult();
      } else if (!isNaN(key) || ["+", "-", "*", "/"].includes(key)) {
        handleButtonClick(keyObject.button(key));
      }
    }
  });
}

createCalculator();

document.addEventListener("focusin", (e) => {
  console.log("Focus changed to:", e.target);
});

window.addEventListener("keydown", (e) => {
  console.log("Key pressed:", e.key, "Active element:", document.activeElement);
  // rest of your handler
});
