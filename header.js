
/*
	*Buford2 private functions
*/

//==========================================================================================================
//-------------------------------------------------------------------------------------------------------debug
//==========================================================================================================

var bu2_debug_doDebug = true;

function bu2_debug_log(func, descriptor, message) {
	if (bu2_debug_doDebug) console.log("%cDEBUG|%c|" + func + "|%c|" + descriptor + ":", "color: #ff0000", "color:#079127", "color:#2c9c90", message);
}

function bu2_debug_group(func) {
	if (bu2_debug_doDebug) console.group("%cDEBUG|%c|" + func, "color: #ff0000", "color:#2c9c90");
}
function bu2_debug_groupC(func) {
	if (bu2_debug_doDebug) console.groupCollapsed("%cDEBUG|%c|" + func, "color: #ff0000", "color:#2c9c90");
}
function bu2_debug_groupEnd() {
	if (bu2_debug_doDebug) console.groupEnd();
}
function bu2_debug_printMatrix(matrix) {
	if (bu2_debug_doDebug) {
		bu2_debug_groupC(matrix.type);
		matrix.map((e, i) => {
			if (Array.isArray(e))
				bu2_debug_printMatrix(e);
			else {
				//bu2_debug_groupC(isNaN(e) ? ` ${e.character} (Variable)` : ` ${e} (Number)`); bu2_debug_groupEnd();
				bu2_debug_log("PRINT", e.type === "MathematicalVariable" ? `Variable` : `Number`, e.type === "MathematicalVariable" ? e.character : e.val);
			}
		});
		bu2_debug_groupEnd();
	}
}



//==========================================================================================================
//-----------------------------------------------------------------------------------------------string slicing
//==========================================================================================================

const bu2_const_variables = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
const bu2_const_numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'];
const bu2_const_parenthesis = ['(', '[', '{', ')', ']', '}'];
const bu2_const_operators = ['=', '<', '>', '+', '-', '*', '/', '^', '#'];





//--------------------------------------------------------------------------------check parenthesis
function bu2_toMachine_checkParenthesis(parenStacks, char) {
	if (char === '(') {
		parenStacks[0] += 1;
	}
	else if (char === '[') {
		parenStacks[1] += 1;
	}
	else if (char === '{') {
		parenStacks[2] += 1;
	}
	
	//check for closing parens
	else if (char === ')') {
		parenStacks[0] -= 1;
	}
	else if (char === ']') {
		parenStacks[1] -= 1;
	}
	else if (char === '}') {
		parenStacks[2] -= 1;
	}
	return parenStacks
}





//--------------------------------------------------------------------------------------slice at expressions
function bu2_toMachine_sliceAtExpressions(string) { 
	let expressionArray = []; //an array for the spliced terms
	let operations = [];
	
	let expressionBuild = ""; //create a string for concatinating chars to 
	for (i=0; i<string.length; i++) { //start slice loop
		if (string[i] === '=') { //if the character is a '='
			expressionArray.push(expressionBuild);
			expressionBuild = "";
			operations.push(string[i]);
		} else if (string[i] === '<') { //if the character is a '<'
			expressionArray.push(expressionBuild);
			expressionBuild = "";
			operations.push(string[i]);
		} else if (string[i] === '>') { //if the character is a '>'
			expressionArray.push(expressionBuild);
			expressionBuild = "";
			operations.push(string[i]);
		} else { //if the character is neither
			expressionBuild += string[i]; //keep building the term
		}
	} //slice loop
	expressionArray.push(expressionBuild);
	
	//bu2_debug_log("sliceAtExpressions", "out", [expressionArray.slice(), operations.slice()]);
	return [expressionArray, operations];
}





//-----------------------------------------------------------------------------------------------slice at terms
function bu2_toMachine_sliceAtTerms(string) { //splice the string where there is a '+'(exclusive) or '-'(inclusive)
	let termArray = []; //an array for the spliced terms
	let parenStacks = [0, 0, 0]; //create stacks for [parenthesis '()', bracket '[]', brace '{}']
	
	let termBuild = ""; //create a string for concatinating chars to 
	for (i=0; i<string.length; i++) { //start slice loop
		if (parenStacks[0] === 0 && parenStacks[1] === 0 && parenStacks[2] === 0) { //if there are no open parenthesis
			if (string[i] === '+') { //if the character is a '+'
				//push the term and empty the builder
				termArray.push(termBuild);
				termBuild = "";
			} else if (string[i] === '-') { //if the character is a '-'
				//push the term and empty the builder
				termArray.push(termBuild);
				termBuild = "-"; //add negative
			} else { //if the character is neither
				termBuild += string[i]; //keep building the term
			}
		} //end paren check
		
		else { //if the parens arn't closed
			termBuild += string[i]; //keep building the term
		}
		
		parenStacks = bu2_toMachine_checkParenthesis(parenStacks, string[i]); //keep paren stack up to date
	} //end splice loop
	termArray.push(termBuild);
	
	//bu2_debug_log("sliceAtTerms", "out", termArray.slice());
	return termArray;
} //end sliceAtTerms





//---------------------------------------------------------------------------------------slice at coefficients
function bu2_toMachine_sliceAtCoefficients(string) { //splice the term into it's factors
	let parenStacks = [0, 0, 0]; //create stacks for [parenthesis '()', bracket '[]', brace '{}']

	let coefficients = []; //array for coefficients
	let coefficientBuild = ""; //builder for coefficients
	for (i=0; i<string.length; i++) { //loop through term string
		if (parenStacks[0] === 0 && parenStacks[1] === 0 && parenStacks[2] === 0) { //if there are no open parenthesis
			if ( //if implied multiplication with parenthesis
				bu2_const_parenthesis.includes(string[i]) && //the current character is parenthesis
				!(bu2_const_operators.includes(string[i-1])) && //there is no operator in front of the paren
				!(coefficientBuild === "") //there is a term to be pushed
			) { 
				coefficients.push(coefficientBuild);
				coefficientBuild = "(";
			} else if (string[i] === '*') { //if its a multiplication
				coefficients.push(coefficientBuild);
				coefficientBuild = "";
			} else if (string[i] === '/') { //if it's division
				coefficients.push(coefficientBuild);
				coefficientBuild = "/"; //converting division into multiplication
			} else if (string[i] === '-') { //if theres a subtraction
				coefficients.push(-1);
			} else if (bu2_const_variables.includes(string[i]) && !(bu2_const_operators.includes(string[i-1]))) { //if the char is a variable and theres no operator in front
				if (coefficientBuild !== "") { //if the build isn't empty
					coefficients.push(coefficientBuild);
				}
				coefficientBuild = string[i];
			} else if (bu2_const_numbers.includes(string[i])) { //if it's a number
				if (bu2_const_variables.includes(coefficientBuild)) { //if the term builder is a variable
					coefficients.push(coefficientBuild); //push it because the next will be a new term
					coefficientBuild = "";
				}
				coefficientBuild += string[i];
			} else { //if its none of those
				coefficientBuild += string[i];
			}
			
		}//paren check

		else { //ifbu2_const_parenthesis is open
			coefficientBuild += string[i];
		}
	
		parenStacks = bu2_toMachine_checkParenthesis(parenStacks, string[i]); //keep the paren stack up to date
	} //end term loop
	if (coefficientBuild !== "") { //if it there are leftovers
		coefficients.push(coefficientBuild);
	}
	
	//bu2_debug_log("sliceAtCoefficients", "out", coefficients.slice());
	return coefficients;
}//sliceAtCoefficients





//------------------------------------------------------------------slice at exponents
function bu2_toMachine_sliceAtExponents(string) {
	let parenStacks = [0, 0, 0]; //create stacks for [bu2_const_parenthesis '()', bracket '[]', brace '{}']
	
	let reciprocal = false;
	
	let exponents = [];
	let exponentBuild = "";
	for (i=0; i<string.length; i++) {
		if (parenStacks[0] === 0 && parenStacks[1] === 0 && parenStacks[2] === 0) { //if there are no openbu2_const_parenthesis
			if (string[i] === '^') {
				exponents.push(exponentBuild);
				exponentBuild = "";
			} else if (string[i] === '/') { //if theres a little divide action
				return ["(" + string.slice(1) + ")", -1]
			} else {
				exponentBuild += string[i];
			}
		} else { //if there is still an open parenthesis set
			exponentBuild += string[i];
		}
		
		parenStacks = bu2_toMachine_checkParenthesis(parenStacks, string[i]); //keep paren stack up to date
	} //loop
	exponents.push(exponentBuild);
	
	//bu2_debug_log("sliceAtExponents", "out", exponents.slice());
	return exponents;
} //sliceAtExponents


//==========================================================================================================
//--------------------------------------------------------------------------------------------convert to machine
//==========================================================================================================


//------------------------------------------------------------------mathematical variable
class bu2_MathematicalVariable {
	type="MathematicalVariable"
	exponent = 1;

	constructor(char) {
		this.index = bu2_const_variables.indexOf(char);
	}
	
	get character() {
		return bu2_const_variables[this.index];
	}
}



//----------------------------------------------------------------mathematical constant
class bu2_MathematicalConstant {
	type="MathematicalConstant"
	exponent = 1;

	constructor (num) {
		this.val = num;
	}
}




//---------------------------------------------------------------------------------operation array
class bu2_OperationArray extends Array {
	exponent = 1;

	constructor (slicedArray, nextClass) {
		if (slicedArray instanceof Array) { //expected input
			super(slicedArray.length);
			this.nextClass = nextClass;
			let calculatedArray = slicedArray.map(this.handleString, this);
			calculatedArray.forEach((e, i) => {
				this[i] = calculatedArray[i];
			});
		} else super(slicedArray); //length input
	}
	
	handleString (string) {
		if (!isNaN(string)) {//if it's a number:
			bu2_debug_groupC(`Number (${string})`); bu2_debug_groupEnd(); //debug
			return new bu2_MathematicalConstant(parseFloat(string)); 
		} else if (bu2_const_variables.includes(string)) { // if it's a variable:
			bu2_debug_groupC(`Variable (${string})`); bu2_debug_groupEnd(); //debug
			return new bu2_MathematicalVariable(string); 
		} else if (bu2_const_parenthesis.includes(string[0]) &&bu2_const_parenthesis.includes(string[string.length - 1])) { //if paren:
			return new bu2_TermArray(string.slice(1, string.length-1)); //create term object with string without parens
		} else if (this.nextClass != null) { // if there is a new class to progress to:
			return new this.nextClass(string); //create new object of next class
		} else { //exponents / error -->
			let exponentArray = bu2_toMachine_sliceAtExponents(string);
			if (exponentArray.length > 1) { //if exponent
				bu2_debug_groupC(`Exponent ("${string}")`);
				let newExponent = null;
				exponentArray.reverse().map(function (e, i) { //loop through array backwards
					e = bu2_OperationArray.prototype.handleString(e);
					console.log(newExponent, e);
					if (newExponent !== null) {
						e.exponent = newExponent;
					}
					newExponent = (
						e.type === "MathematicalConstant" && //is the value of e a number?
						!isNaN(e.exponent) //is the exponent of e a number?
					) ? Math.pow(e.val, e.exponent) : e ; //if so: execute those two, if not just return
				});

				bu2_debug_groupEnd();
				return (isNaN(newExponent)) ? newExponent : new bu2_MathematicalConstant(newExponent);
			} else { //buford don't have a damn clue anymore
				console.error(`The string: "${string}" was not recognized. Maybe check the documentation?`);
			}
		}
	}
}



//--------------------------------------------------------------------------------------------expression array
class bu2_ExpressionArray extends bu2_OperationArray { 
	type = "ExpressionArray";
	
	constructor (string) { //-------------------------------------------constructor
		bu2_debug_groupC(`ExpressionArray Constructor ("${string}")`); //debug
		let exprReturn = bu2_toMachine_sliceAtExpressions(string);
		super(exprReturn[0], bu2_TermArray);
		this.operators = exprReturn[1];
		bu2_debug_groupEnd(); //debug
	}
}




//----------------------------------------------------------------------------------------------term array
class bu2_TermArray extends bu2_OperationArray { 
	type = "TermArray";
	nextClass = bu2_CoefficientArray;
	
	constructor (arg1) { //-------------------------------------------constructor
		if (typeof arg1 === "string") { //if expected input:
			bu2_debug_groupC(`TermArray Constructor ("${arg1}")`); //debug
			
			super(bu2_toMachine_sliceAtTerms(arg1), bu2_CoefficientArray);
			
			bu2_debug_groupEnd(); //debug
		} else if (arg1 instanceof Array) { //if array was the given input
			arg1.map((e, i) => {this[i] = e;});
		} else super(arg1); //acception handling for length input
	} //constructor
}




//-------------------------------------------------------------------------------------------coefficient array
class bu2_CoefficientArray extends bu2_OperationArray { 
	type = "CoefficientArray";
	
	constructor (arg1) { //-------------------------------------------constructor
		if (typeof arg1 === "string") { //if expected input:
			bu2_debug_groupC(`CoefficientArray Constructor ("${arg1}")`); //debug
			
			super(bu2_toMachine_sliceAtCoefficients(arg1));
			
			bu2_debug_groupEnd(); //debug
		} else super(arg1); //acception handling for length input
	} //constructor
}




//==========================================================================================================
//-----------------------------------------------------------------------------------------------simplification
//==========================================================================================================

//----------------------------------------------------------------------------------------------------------------------unpack nests
function bu2_simplify_unpackNests(operationArray) {
	return operationArray.map(function (e, i) {
		if (e instanceof Array) {
			if (e.length < 2) {
				
			} else {
				return bu2_simplify_unpackNests(e);
			}
		} else return e;
	});
}

//-------------------------------------------------------------------------------------------------------------------------add
function bu2_simplify_addExponents(acceptFloats, ...args) {

}

//--------------------------------------------------------------------------------------------------------------------------coefficientSimplifyLight
function bu2_simplify_coefficientSimplifyLight(coefArray) {
	let constant = 1;
	let variables = [];
	let opArrays = [];

	coefArray.map((factor) => {
		if (factor instanceof bu2_MathematicalConstant) {
			constant *= factor.val;
		} else if (factor instanceof bu2_MathematicalVariable) { //-------------------------variable
			let matchFound = false;
			for (i = 0; i < variables.length && !matchFound; i++) {//loop through the variables that are already processed
				if (variables[i].index === factor.index) { //if they are the same variable
					variables[i].exponent += factor.exponent;
					matchFound = true;
				}
			}
			if (!matchFound) variables.push(factor);
		} else if (factor instanceof bu2_OperationArray) { //-------------------------operation array
			bu2_simplify_sort(factor);
			let matchFound = false;
			for (i = 0; i < opArrays.length && !matchFound; i++) {//loop through the oparrays that are already processed
				if (bu2_compareOperationArrayNoExponentNoSort(opArrays[i], factor)) { //if they have the same contents
					opArrays[i].exponent += factor.exponent;
					matchFound = true;
				}
			}
			if (!matchFound) opArrays.push(factor);
		} else console.error(`The following value was not recognized:`, factor);
	});

	constant = new bu2_MathematicalConstant(constant);
	coefArray.splice(0, coefArray.length, constant, ...variables, ...opArrays);
	if (coefArray.length == 1) coefArray = coefArray[0];

	return coefArray;
}

//---------------------------------------------------------------------------------sort
function bu2_simplify_sort(opArray) { //sorts
	let constants = [];
	let variables = [];
	let operationArrays = [];
	opArray.forEach(e => {
		if (e instanceof bu2_MathematicalConstant) constants.push(e);
		else if (e instanceof bu2_MathematicalVariable) variables.push(e);
		else if (e instanceof bu2_OperationArray) operationArrays.push(e);
		else console.error("The following element was not recognized:", e);
	});
	operationArrays = operationArrays.map(e => bu2_simplify_sort(e));
	opArray.splice(0, opArray.length, ...constants.sort(), ...variables.sort(), ...operationArrays.sort());
	return opArray;
}

//==========================================================================================================
//----------------------------------------------------------------------------------------------------general
//==========================================================================================================

function bu2_classifyElement(value) {
	if (!isNaN(value)) return "INT";
	else if (value instanceof bu2_MathematicalConstant) return "MathematicalConstant";
	else if (value instanceof bu2_MathematicalVariable) return "MathematicalVariable";
	else if (value instanceof bu2_ExpressionArray) return "ExpressionArray";
	else if (value instanceof bu2_TermArray) return "TermArray";
	else if (value instanceof bu2_CoefficientArray) return "CoefficientArray";
	else if (value instanceof bu2_ExponentArray) return "ExponentArray";
	else return "idek";
}

function bu2_compareOperationArrayNoExponentNoSort(opArray1, opArray2) {
	let str1 = opArray1.map(e => JSON.stringify(e));
	let str2 = opArray2.map(e => JSON.stringify(e));
	
	str1 = str1.toString();
	str2 = str2.toString();

	return str1 === str2;
}

//==========================================================================================================
//----------------------------------------------------------------------------------------------------the end!
//==========================================================================================================

console.log("Buford2 header sucessfully loaded");
