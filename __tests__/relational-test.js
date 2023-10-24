// Relative expression has low precedence than additive but high precedence than equality
module.exports = (test) => {
  test(`x > 0;`, {
    type: 'Program',
    body: [{
      type: 'ExpressionStatement',
      expression: {
        type: 'BinaryExpression',
        operator: '>',
        left: {
          type: 'Identifier',
          name: 'x',
        },
        right: {
          type: 'NumericLiteral',
          value: 0,
        },
      },
    }],
  });
}