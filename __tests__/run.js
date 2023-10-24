const assert = require('assert');
const {Parser} = require('../src/parser');

const tests = [
  require('./literals-test.js'),
  require('./statement-list-test.js'),
  require('./block-test.js'),
  require('./empty-statement-test.js'),
  require('./math-test.js'),
  require('./assignment-test.js'),
  require('./variable-test.js'),
  require('./if-test.js'),
];

const parser = new Parser();


// For manual test
function exec() {
  const program = `
      let y;
      let a, b;
      let c, d = 10;
      let foo = bar = 10;   // let foo = (bar = 10);
      r = 10;
      
      let x = 42;
      if (x) {
        x = 0;
      } else {
        x += 1;
      }
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
exec();

// Run all test 
tests.forEach(testRun => testRun(test));
console.log('All tests passed!');

