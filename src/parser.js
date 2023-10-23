/**
 * Letter parser: recursive descent implementation
 */

const { Tokenizer} = require('./tokenizer');


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
   */
  Program() {
    return {
      type: 'Program',
      body: this.Literal(),
    }
  }

  /**
   * Literal
   *  : NumericLiteral
   * | StringLiteral
   */

  Literal() {
    switch(this._lookahead.type) {
      case 'NUMBER':
        return this.NumericLiteral();
      case 'STRING':
        return this.StringLiteral();
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
      throw new SyntaxError(`Unexpected token: "${token.value}, expected: "${tokenType}"`);
    }

    this._lookahead = this._tokenizer.getNextToken();
    return token;
  }
}

module.exports = {
  Parser,
}