/**
 * Letter parser: recursive descent implementation
 */

class Parser {
  parse(string) {
    this._string = string;
    return this.Program();
  }

  /** main entry point.
   * 
   */
  Program() {
    return this.NumericLiteral();
  }

  NumericLiteral() {
    return {
      type: 'NumericLiteral',
      value: Number(this._string),
    };
  }
}

module.exports = {
  Parser,
}