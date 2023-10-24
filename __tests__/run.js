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
  require('./relational-test.js'),
  require('./equality-test.js'),
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

      // if/esle
      if (x) {
        x = 0;
      } else {
        x += 1;
      }

      // only if 
      if (x) {
        x = 0;
      }

      // Shortcut
      if (x) x = 0;

      // Nested if
      if(x) if(y) {} else {};
      if(x) if(y) {} else {} else {};

      // Relational expression and equality
      if (x + 5 > 10)  {
        x = 10;
      } else {
        x += 1;
      }

      if (x + 5 >= 10)  {
        x = 10;
      } else {
        x += 1;
      }

      x + 5 > 10;  // (x + 5) > 10

      // Relational expression and equality
      x + 5 > 10 == true; // (x + 5) > 10 == true

      // x > 5 && y < 10; // (x > 5) && (y < 10)


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

