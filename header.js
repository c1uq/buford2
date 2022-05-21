
/*
	*Buford2 header (not sure if I'm using the right word there, but the global functions and stuff)
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
					bu2_debug_log("PRINT", isNaN(e) ? `Variable` : `Number`, isNaN(e) ? e.character : e);
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
	let parenStacks = [0, 0, 0]; //create stacks for [bu2_const_parenthesis '()', bracket '[]', brace '{}']

	let coefficients = []; //array for coefficients
	let coefficientBuild = ""; //builder for coefficients
	for (i=0; i<string.length; i++) { //loop through term string
		if (parenStacks[0] === 0 && parenStacks[1] === 0 && parenStacks[2] === 0) { //if there are no openbu2_const_parenthesis
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
			} else if (bu2_const_variables.includes(string[i])) { //if the char is a variable
				if (coefficientBuild !== "") {
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
			super(...slicedArray);
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
				let exponent;
				exponentArray.map(function (e, i) {
					if (exponent instanceof bu2_MathematicalConstant) { //if it is a constant

					}
				})
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
	
	constructor (string) { //-------------------------------------------constructor
		if (typeof string === "string") { //if expected input:
			bu2_debug_groupC(`TermArray Constructor ("${string}")`); //debug
			
			super(bu2_toMachine_sliceAtTerms(string), bu2_CoefficientArray);
			
			bu2_debug_groupEnd(); //debug
		} else super(string); //acception handling for length input
	} //constructor
}




//-------------------------------------------------------------------------------------------coefficient array
class bu2_CoefficientArray extends bu2_OperationArray { 
	type = "CoefficientArray";
	
	constructor (string) { //-------------------------------------------constructor
		if (typeof string === "string") { //if expected input:
			bu2_debug_groupC(`CoefficientArray Constructor ("${string}")`); //debug
			
			super(bu2_toMachine_sliceAtCoefficients(string));
			
			bu2_debug_groupEnd(); //debug
		} else super(string); //acception handling for length input
	} //constructor
}




//==========================================================================================================
//-----------------------------------------------------------------------------------------------simplification
//==========================================================================================================
function bu2_simplify_coefSimplifyLight(coefArray) {
	let constant = 1;
	let variables = [];
	let operationArrays = [];

	coefArray.forEach(e => {
		if (!isNaN(e)) constant *= e; //if constant
		else if (e instanceof bu2_MathematicalVariable) { //if variable
			
		}
	})

	return new bu2_CoefficientArray([]);
}



//==========================================================================================================
//----------------------------------------------------------------------------------------------------general
//==========================================================================================================

function bu2_classifyElement(value) {
	if (!isNaN(value)) return "constant";
	else if (value instanceof bu2_MathematicalVariable) return "variable";
	else if (value instanceof bu2_ExpressionArray) return "expression array";
	else if (value instanceof bu2_TermArray) return "term array";
	else if (value instanceof bu2_CoefficientArray) return "coefficient array";
	else if (value instanceof bu2_ExponentArray) return "exponent array";
}


//==========================================================================================================
//----------------------------------------------------------------------------------------------------the end!
//==========================================================================================================

console.log("Buford2 header sucessfully loaded");
