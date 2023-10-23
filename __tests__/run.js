const {Parser} = require('../src/parser');

const parser = new Parser();

// NOTE:  The program variable is overwritten in each test case.
// The last one is the active test program
let program = "";
program = `   42  `;       // This is number
program = `   "  42    " `;   // This is string token
program = '"42"';
program = `'42'`;  // Assignment: single quoted string

// Single line comment
program = `
  // Number
  42
 `;  

 // Multi line comment
program = `
  /* 
   Documentation comment:
  */
   42
 `;  


 //TODO:   Multiple expression test
program = `
/**
 Documentation comment:
*/
"hello";
// Number: 
 42;
`;  




const ast = parser.parse(program);

console.log(JSON.stringify(ast, null, 2));

