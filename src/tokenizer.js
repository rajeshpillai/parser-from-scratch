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
  [/^,/, ','],           

  // ---------------------------------------- 
  // Keywords 
  [/^\blet\b/, 'let'],   // let keyword
  [/^\bif\b/, 'if'],     // if keyword
  [/^\belse\b/, 'else'], // else keyword
  [/^\btrue\b/, 'true'], // true keyword
  [/^\bfalse\b/, 'false'], // false keyword
  [/^\bnull\b/, 'null'], // null keyword
  
  // ----------------------------------------
  // NUmber should be above Identifiers
  [/^\d+/, 'NUMBER'],    // number

  // ----------------------------------------
  // Identifiers
  [/^\w+/, 'IDENTIFIER'],

  // ----------------------------------------
  // Euality operators: ==, != 
  [/^[=!]=/, 'EQUALITY_OPERATOR'],


  // ----------------------------------------
  // Asignment operators: = , *=, /=, +=, -= 

  [/^=/, 'SIMPLE_ASSIGN'],
  [/^[\*\/\+\-]=/,'COMPLEX_ASSIGN'],

  // ----------------------------------------
  // Relational operators: >, >=, <, <= 
  [/^[><]=?/, 'RELATIONAL_OPERATOR'],

  // ----------------------------------------
  // Logical operators: &&, || 

  [/^&&/, 'LOGICAL_AND'], 
  [/^\|\|/, 'LOGICAL_OR'],

  // Math operators: +, -, *, / 
  [/^[+\-]/, 'ADDITIVE_OPERATOR'],
  [/^[*\/]/, 'MULTIPLICATIVE_OPERATOR'],
  
  

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