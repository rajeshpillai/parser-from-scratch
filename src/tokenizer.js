/**
 * Tokenizer Spec
 */
const Spec = [
  [/^\/\/.*/, null],     // single line comment
  [/^\/\*[\s\S]*?\*\//, null], // multi-line comment
  [/^\s+/, null],        // whitespace
  
  
  // Symbol, delimiters
  [/^;/, ';'],           // semicolon
  [/^\{/, '{'],           // {
  [/^\}/, '}'],           // {
  [/^\(/, '('],           
  [/^\)/, ')'],           

  // Math operators: +, -, *, / 
  [/^[+\-]/, 'ADDITIVE_OPERATOR'],
  [/^[*\/]/, 'MULTIPLICATIVE_OPERATOR'],
  
  [/^\d+/, 'NUMBER'],    // number

  [/"[^"]*"/, 'STRING'], // double quoted string
  [/'[^']*'/, 'STRING'], // single quoted string

];

class Tokenizer {
  init (string) {
    this._string = string;
    this._cursor = 0;
  }

  hasMoreTokens() {
    return this._cursor < this._string.length;
  }

  isEOF() {
    return this._cursor === this._string.length;
  }

  // Returns the next token 
  getNextToken() {
    if (!this.hasMoreTokens()) {
      return null;
    }
    const string = this._string.slice(this._cursor);

    for (const [regexp, tokenType] of Spec) {
      const tokenValue = this._match(regexp, string); 
      
      // Couldn't match the rule
      if (tokenValue == null) {
        continue;
      }

      // Should skip token, e.g. whitespace.
      if (tokenType == null) {
        return this.getNextToken();
      }

      return {
        type: tokenType,
        value: tokenValue
      }
    }

    throw new SyntaxError(`Unexpected token: "${string[0]}"`);
  }

  _match(regexp, string) {
    const matched = regexp.exec(string);
    if (matched == null) { 
      return null;
    }
    this._cursor += matched[0].length;
    return matched[0]
  }
}

module.exports = {
  Tokenizer,
}