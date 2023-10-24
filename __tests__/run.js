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
  require('./logical-test.js'),
  require('./unary-test.js'),
  require('./while-test.js'),
  require('./do-while-test.js'),
  require('./for-test.js'),
];

const parser = new Parser();


// For manual test
function exec() {
  const program = `
      do {
        x -= 1;
      } while(x > 10);

      for (let i = 0; i < 10; i += 1) {
        x += i;
      }

      for (let i = 0, z = 0;  i < 10; i += 1) {
        x += i;
      }

      for (; ;) {
        x += i;
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

