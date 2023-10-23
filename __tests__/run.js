const assert = require('assert');
const {Parser} = require('../src/parser');

const tests = [
  require('./literals-test.js'),
  require('./statement-list-test.js'),
];

const parser = new Parser();

// NOTE:  The program variable is overwritten in each test case.
// The last one is the active test program
let program = "";


// For manual test
function exec() {
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
}


// Test function 

function test (program, expected) {
  const ast = parser.parse(program);
  assert.deepEqual(ast, expected);
}

// Manual test
// exec();

// Run all test 
tests.forEach(testRun => testRun(test));
console.log('All tests passed!');

