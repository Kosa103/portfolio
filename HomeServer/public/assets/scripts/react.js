class Square extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }
  
  changeSquareSymbol() {
    if (this.props.symbol === 'X') {
      this.setState({value: 'X'});
      this.props.alter();
    } else {
      this.setState({value: 'O'});
      this.props.alter();
    }
  }

  render() {
    return (
      <button
        className="square"
        onClick={this.changeSquareSymbol.bind(this)}
      >
        {this.state.value}
      </button>
    );
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      symbol: "X"  
    }
  }
  
  changeSymbol() {
    if (this.state.symbol === 'X') {
      this.setState({symbol: 'O'});
    } else {
      this.setState({symbol: 'X'});
    }
  }
  
  renderSquare(i) {
    const symbol = this.state.symbol;
    const alter = this.changeSymbol.bind(this);
    return <Square symbol={symbol} alter={alter}/>;
  }

  render() {
    const status = 'CURRENT TEST STATE: LIFTING STATE UP';

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* TODO */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
