class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '' || this.currentOperand === '-') {
            this.currentOperand = '0';
        }
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error') this.clear();
        
        // Prevent multiple decimals
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Replace initial zero, except if we are appending a decimal point
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') return;
        if (this.currentOperand === '0' && this.previousOperand === '') return;
        
        // Quick operation switch if no new current operand has been entered
        if (this.currentOperand === '') {
            if (this.previousOperand !== '') {
                this.operation = operation;
            }
            return;
        }
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        // Handle Percentage directly as an immediate transformation
        if (operation === '%') {
            const current = parseFloat(this.currentOperand);
            if (isNaN(current)) return;
            this.currentOperand = (current / 100).toString();
            return; // Don't set state as moving to previous; it's an immediate evaluation
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−': // using unicode minus from index.html
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Avoid floating point precision issues
        computation = Math.round(computation * 10000000000) / 10000000000;
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        if (number === 'Error') return 'Error';
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
        
        // Scale down text if it's too long
        if (this.currentOperandTextElement.innerText.length > 10) {
            this.currentOperandTextElement.style.fontSize = '1.8rem';
        } else {
            this.currentOperandTextElement.style.fontSize = '2.5rem';
        }
    }
}

// DOM Setup
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);
calculator.updateDisplay(); // Init with '0'

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
        
        // Slight interaction feedback (blur input focus)
        button.blur();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
        button.blur();
    });
});

equalsButton.addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
    equalsButton.blur();
});

allClearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
    allClearButton.blur();
});

deleteButton.addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
    deleteButton.blur();
});

// Keyboard Support
document.addEventListener('keydown', e => {
    if (e.key >= 0 && e.key <= 9) {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault(); // prevent form submit / button click focus issues
        calculator.compute();
        calculator.updateDisplay();
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '%') {
        let op = e.key;
        if (op === '*') op = '×';
        if (op === '/') op = '÷';
        if (op === '-') op = '−'; // Use our specific minus char if mapping

        calculator.chooseOperation(op);
        calculator.updateDisplay();
    }
});