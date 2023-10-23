module.exports = test => {
  test(`
    {
      42;
      "hello"; 
    }
  `, {
        "type": "Program",
        "body": [
          {
            "type": "BlockStatement",
            "body": [
              {
                "type": "ExpressionStatement",
                "expression": {
                  "type": "NumericLiteral",
                  "value": 42
                }
              },
              {
                "type": "ExpressionStatement",
                "expression": {
                  "type": "StringLiteral",
                  "value": "hello"
                }
              }
            ]
          }
        ]
      }
  );

  // Empty block test 
  test(`
    {}
  `, {
        "type": "Program",
        "body": [
          {
            "type": "BlockStatement",
            "body": []
          }
        ]
  })

  // Nested block test
  test(`
    {
      {
        42;
      }
    }
  `, {
        "type": "Program",
        "body": [
          {
            "type": "BlockStatement",
            "body": [
              {
                "type": "BlockStatement",
                "body": [
                  {
                    "type": "ExpressionStatement",
                    "expression": {
                      "type": "NumericLiteral",
                      "value": 42
                    }
                  }
                ]
              }
            ]
          }
        ]
  })  

}