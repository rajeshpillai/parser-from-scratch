/**
 * Letter parser: recursive descent implementation
 */

const { Tokenizer} = require('./tokenizer');

// ------------------------------------------------
// Default AST node factories
const DefaultFactory = {
  Program(body) {
    return {
      type: 'Program',
      body,
    }
  }, 

  EmptyStatement() {
    return {
      type: 'EmptyStatement'
    }
  },

  BlockStatement(body) {
    return {
      type: 'BlockStatement',
      body,
    }
  },
  
  ExpressionStatement(expression) {
    return {
      type: 'ExpressionStatement',
      expression,
    }
  },

  StringLiteral(value) {
    return {
      type: 'StringLiteral',
      value,
    }
  },

  NumericLiteral(value) {
    return {
      type: 'NumericLiteral',
      value,
    }
  }
}


// ------------------------------------------------
// S-expression AST node factories 
const SExpressionFactory = { 
  Program(body) {
    return ['begin', body];
  },

  EmptyStatement() {},

  BlockStatement(body) {
    return ['begin', body];
  },

  ExpressionStatement(expression) { 
    return expression;
  },

  StringLiteral(value) {
    return `"value"`; 
  },

  NumericLiteral(value) {
    return value;
  },

}

// TODO:  Make AST_MODE parameterized
const AST_MODE = 's-expression';  // 'default' or 's-expression'
const factory = AST_MODE === 'default' ? DefaultFactory : SExpressionFactory;

class Parser {
  constructor() {
    this._string = '';
    this._tokenizer = new Tokenizer();
  }

  parse(string) {
    this._string = string;
    this._tokenizer.init(string);

    // Prime the tokenizer to obtain the first
    // token which is our lookahead.  The lookahead is 
    // used for predictive parsing.

    this._lookahead = this._tokenizer.getNextToken();
    return this.Program();
  }

  /** main entry point.
   * 
   * Program
   *  : StatementList 
   */
  Program() {
    return factory.Program(this.StatementList());
  }

  /** 
   * StatementList
   *  : Statement
   *  | StatementList Statement -> Statement Statement Statement Statement
   *  ;
   */
  StatementList(stopLookahead = null) {
    const statementList = [this.Statement()];
    while (this._lookahead !== null && this._lookahead.type !== stopLookahead) {
      statementList.push(this.Statement());
    }
    return statementList;
  }

  /**
   *  Statement
   *    : ExpressionStatement 
   *    | BlockStatement
   *    | EmptyStatement
   *    ;
   */

  Statement() {
    switch(this._lookahead.type) {
      case ';':
        return this.EmptyStatement();
      case '{': return this.BlockStatement();
      default: return this.ExpressionStatement();
    }
  }

  /** 
   * EmptyStatement 
   * : ';'
   * ;
   */
  EmptyStatement() { 
    this._eat(';');
    return factory.EmptyStatement();
  }


  /**
   * BlockStatement
   *  : '{'  OptStatementList '}'
   *  ;
   */

  BlockStatement() {
    this._eat('{');
    const body = this._lookahead.type === '}' ? [] : this.StatementList('}'); 
    this._eat('}'); 

    return factory.BlockStatement(body);
  }


  /** 
   * ExpressionStatement
   *  : Expression ';' 
   *  ;
   */

  ExpressionStatement() {
    const expression = this.Expression(); 
    this._eat(';'); 
    return factory.ExpressionStatement(expression);
  }

  /**
   * Expression
   *  : Literal
   *  ;
   */

  Expression() { 
    return this.Literal();
  }

  /**
   * Literal
   *  : NumericLiteral
   *  | StringLiteral
   *  ;
   */

  Literal() {
    switch(this._lookahead.type) {
      case 'NUMBER':
        return factory.NumericLiteral(this._eat('NUMBER').value);
        //return this.NumericLiteral();
      case 'STRING':
        return factory.StringLiteral(this._eat('STRING').value);
        //return this.StringLiteral();
      default:
        throw new SyntaxError(`Unexpected token: "${this._lookahead.value}"`);
    }
  }

  /**
   * NumericLiteral 
   * : NUMBER
   * ;
   */
   
  NumericLiteral() {
    const token = this._eat('NUMBER');  // consume the token
    return {
      type: 'NumericLiteral',
      value: Number(token.value),
    };
  }

  /**
   * StringLiteral 
   *  : STRING
   *  ;
   */
    StringLiteral() {
      const token = this._eat('STRING');  // consume the token
      return {
        type: 'StringLiteral',
        value: token.value.slice(1, -1) // remove the quotes,
      };
    }

  _eat(tokenType) {
    const token = this._lookahead;
    if (token == null) {
      throw new SyntaxError(`Unexpected end of input, expected: "${tokenType}"`);
    }
    if (token.type !== tokenType) {
      throw new SyntaxError(`Unexpected token: "${token.value}, expected: ${tokenType}`);
    }

    this._lookahead = this._tokenizer.getNextToken();
    return token;
  }
}

module.exports = {
  Parser,
}