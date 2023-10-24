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
   * Program
   *  : StatementList 
   */
  Program() {
    return {
      type: 'Program',
      body: this.StatementList(),
    }
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
   *    | VariableStatemnt
   *    ;
   */

  Statement() {
    switch(this._lookahead.type) {
      case ';':
        return this.EmptyStatement();
      case 'if':
        return this.IfStatement();
      case '{': 
        return this.BlockStatement();
      case 'let': 
        return this.VariableStatement();
      default: 
        return this.ExpressionStatement();
    }
  }
  /** IfStatement
   *  : 'if' '(' Expression ')' Statement
   *  | 'if' '(' Expression ')' Statement 'else' Statement
   */
  IfStatement() {
    this._eat('if');
    this._eat('(');
    const test = this.Expression();
    this._eat(')');
    const consequent = this.Statement();
    const alternate = this._lookahead != null && this._lookahead.type === 'else' ? this._parseElse() : null;
    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate,
    }
  }

  _parseElse() {
    this._eat('else');
    return this.Statement();
  }

  /** 
   * VariableStatement
   *  : 'let' VariableDeclarationList ';' 
   *  ; 
   */
  VariableStatement() {
    this._eat('let');
    const declarations = this.VariableDeclarationList();
    this._eat(';');
    return {
      type: 'VariableStatement',
      declarations,
    }
  }
  /** 
   * VariableDeclarationList 
   *  : VariableDeclaration 
   *  | VariableDeclarationList ',' VariableDeclaration -> VariableDeclaration VariableDeclaration VariableDeclaration
   */
  VariableDeclarationList() { 
    const declarations = [this.VariableDeclaration()];
    while(this._lookahead.type === ',') {
      this._eat(',');
      declarations.push(this.VariableDeclaration());
    }
    return declarations;
  }

  /** VariableDeclaration 
   * : Identifier OptVariableInitializer
   * ;
   */
  VariableDeclaration() {
    const identifier = this.Identifier();
    const init = this._lookahead.type !== ';' && this._lookahead.type !== ',' 
      ? this.VariableInitializer()
      : null;
    return {
      type: 'VariableDeclaration',
      id: identifier,
      init,
    }
  }

  /** VariableInitializer
   * : SIMPLE_ASSIGN AssignmentExpression
   * ;
   * 
   */
  VariableInitializer() {
    this._eat('SIMPLE_ASSIGN');
    return this.AssignmentExpression();
  }

  /** 
   * EmptyStatement 
   * : ';'
   * ;
   */
  EmptyStatement() { 
    this._eat(';');
    return {
      type: 'EmptyStatement',
    }
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

    return {
      type: 'BlockStatement', 
      body
    }
  }


  /** 
   * ExpressionStatement
   *  : Expression ';' 
   *  ;
   */

  ExpressionStatement() {
    const expression = this.Expression(); 
    this._eat(';'); 
    return {
      type: 'ExpressionStatement',
      expression,
    }
  }

  /**
   * Expression
   *  : Literal
   *  ;
   */

  Expression() { 
    return this.AssignmentExpression();
  }

  /** 
   * AssignmentExpression
   *  : LogicalORExpression 
   *  | LeftHandSideExpression AssignmentOpertor AssignmentExpression 
   */

  // Assignment can be chained, x = y = 42
  AssignmentExpression() {
    const left = this.LogicalORExpression();
    if (!this._isAssignmentOperator(this._lookahead.type)) {
      return left;
    }
    return {
      type: 'AssignmentExpression',
      operator: this.AssignmentOperator().value,
      left: this._checkValidAssignmentTarget(left), 
      right: this.AssignmentExpression(),  // right recursion
    }
  }

  /** 
   * LeftHandSideExpression 
   * : Identifier 
   * ;
   */
  LeftHandSideExpression() { 
    return this.Identifier();
  }

  /** 
   * Identifier 
   * : IDENTIFIER
   * ;
   */
  Identifier() {
    const name = this._eat('IDENTIFIER').value;
    return {
      type: 'Identifier',
      name,
    }
  }

  /** 
   * Extra check whether it's a valid assignment target 
   */
  _checkValidAssignmentTarget(node) { 
    if (node.type === 'Identifier') {
      return node;
    }
    throw new SyntaxError(`Invalid left-hand side in assignment expression`);
  }

  /** 
   * Whether the token is an assignment operator
   */
  _isAssignmentOperator(tokenType) {
    return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN';
  }

  /**  
   * AssignmentOperator 
   * : SIMPLE_ASSIGN
   * | COMPLEX_ASSIGN
   */
  AssignmentOperator() { 
    if (this._lookahead.type === 'SIMPLE_ASSIGN') {
      return this._eat('SIMPLE_ASSIGN');
    }
    return this._eat('COMPLEX_ASSIGN');
  }

  /** Logical OR expressio 
   *    x || y 
   * 
   * LogicalORExpression 
   *  : LogicalANDExpression LOGICAL_OR LogicalORExpression 
   *  | LogicalANDExpression 
   *  ;
   */
  LogicalORExpression() {
    return this._LogicalExpression('LogicalANDExpression', 'LOGICAL_OR');
  }

  /** Logical AND expression 
   *  x && y 
   * LogicalANDExpression
   *  : EqualityExpression LOGICAL_AND LogicalANDExpression 
   *  | EqualityExpression 
   *  ;
   */
  LogicalANDExpression() {
    return this._LogicalExpression('EqualityExpression', 'LOGICAL_AND');
  }


  /** EQUALITY_OPERATOR: ==, != 
   *    x == y 
   *    x != y
   * 
   *  EqualityExpression 
   *  : RelationalExpression EQUALITY_OPERATOR RelationalExpression
   *  | RelationalExpression
  */
  EqualityExpression() {
    return this._BinaryExpression('RelationalExpression', 'EQUALITY_OPERATOR');
  }

  /** Relational Operator: >, >=, <, <=  
   * 
   *    x > y
   *    x >= y
   *    x < y
   *    x <= y
   *  
   * RelationalExpression
   * : AdditiveExpression 
   * | AdditiveExpression RELATIONAL_OPERATOR AdditiveExpression
   * 
  */
  RelationalExpression() {
    return this._BinaryExpression('AdditiveExpression', 'RELATIONAL_OPERATOR');
  }


  /** 
   * AdditiveExpression 
   *  : MultiplicativeExpression
   *  | AdditiveExpression ADDITIVE_OPERATOR MultiplicativeExpression -> MultiplicativeExpression ADDITIVE_OPERATOR MultiplicativeExpression
   */
  AdditiveExpression() {
    return this._BinaryExpression('MultiplicativeExpression', 'ADDITIVE_OPERATOR')
  }

  /** 
   * MultiplicativeExpression 
   *  : PrimaryExpression
   *  | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression -> PrimaryExpression MULTIPLICATIVE_OPERATOR MultiplicativeExpression
   */
   MultiplicativeExpression() {
    return this._BinaryExpression('PrimaryExpression', 'MULTIPLICATIVE_OPERATOR')
   }

   /** Generic helper for LogicalExpression nodes */
  _LogicalExpression(builderName, operatorToken) {
    let left = this[builderName]();
    while(this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value;
      const right = this[builderName]();
      left = {
        type: 'LogicalExpression',
        operator,
        left,
        right,
      };
    }
    return left;
  }

  /** 
   * Generic binary expression
   */

  _BinaryExpression(builderName, operatorToken) {
    let left = this[builderName]();
    while(this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value;
      const right = this[builderName]();
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }
    return left;
  }

  /** 
   * PrimaryExpression
   *  : Literal
   *  | ParenthesizedExpression
   *  | LeftHandSideExpression
   *  ;
   */
  PrimaryExpression() {
    if (this._isLiteral(this._lookahead.type)) { 
      return this.Literal();
    }
    switch(this._lookahead.type) {
      case '(': 
        return this.ParenthesizedExpression(); 
      default: 
        return this.LeftHandSideExpression();
    }
  }

  /** 
   * Whether the token is a literal
   */
   _isLiteral(tokenType) {
    return (
      tokenType === 'NUMBER' || 
      tokenType === 'STRING' ||
      tokenType === 'true' || 
      tokenType === 'false' ||
      tokenType === 'null'
    );
  }

  /** 
   * ParenthesizedExpression
   *  : '(' Expression ')'
   *  
   */
  ParenthesizedExpression() {
    this._eat('(');
    const expression = this.Expression();
    this._eat(')');

    // In the AST we don't see open parenthesis but will see the correct precedence by returning expression
    return expression;
  }

  /**
   * Literal
   *  : NumericLiteral
   *  | StringLiteral
   *  | BooleanLiteral
   *  | NullLiteral
   *  ;
   */

  Literal() {
    switch(this._lookahead.type) {
      case 'NUMBER':
        return this.NumericLiteral();
      case 'STRING':
        return this.StringLiteral();
      case 'true':
        return this.BooleanLiteral(true);
      case 'false':
        return this.BooleanLiteral(false);
      case 'null':
        return this.NullLiteral(false);
      default:
        throw new SyntaxError(`Unexpected token: "${this._lookahead.value}"`);
    }
  }

  /** BooleanLiteral
   *    : 'true' 
   *    | 'false' 
   *    ;
   */
  BooleanLiteral(value) {
    this._eat(value ? 'true' : 'false');  // consume the token
    return {
      type: 'BooleanLiteral',
      value,
    };
  }

  /** NullLiteral
   *   : 'null'
   *  ;
   */
  NullLiteral() {
    this._eat('null');  // consume the token
    return {
      type: 'NullLiteral',
      value: null,
    };
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
      throw new SyntaxError(`Unexpected token: ${token.value}, expected: ${tokenType}`);
    }

    this._lookahead = this._tokenizer.getNextToken();
    return token;
  }
}

module.exports = {
  Parser,
}