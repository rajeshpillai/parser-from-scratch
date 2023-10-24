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
  require('./function-declaration-test.js'),
  require('./member-test.js'),
];

const parser = new Parser();


// For manual test
function exec() {
  const program = `
    let s = "Hello, World!";
    let i = 0;
    while (i < s.length) {
      s[i];  // computed property
      //console.log(i, s[i])  // functio call not yet implemented
      i += 1;
    }

    a.b.c['d'];
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

