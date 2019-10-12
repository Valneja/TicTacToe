import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={i}
      />
    );
  }

  render() {
    const rows = [];

    for (let i = 0; i < 3; i++) {
      const squares = [];
      for(let j = 0; j < 3; j++) {
        squares.push(this.renderSquare((i*3)+j));
      }
      rows.push(<div className="board-row" key={i}>{squares}</div>);
    }
    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastPosition: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      ascending: true,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length-1];
    const squares = current.squares.slice();

    if ( calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        lastPosition: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  changeSort() {
    this.setState({
      ascending: !this.state.ascending,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const sort = this.state.ascending ? 'Ascending' : 'Descending'

    const moves = history.map((step, move) => {
      const col = step.lastPosition % 3 + 1;
      const row = Math.ceil((step.lastPosition + 1) / 3);
      const desc = move ?
      'Go to move #' + move + '(' + col + ',' + row + ')' :
      'Go to game start';
      const boldDesc = <b>{desc}</b>;
      let finalDesc = desc;
      if (this.state.stepNumber === move) {
        finalDesc = boldDesc;
      }
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{finalDesc}</button>
        </li>
      );
    });
    const reversedMoves = moves.slice().reverse();
    let movesToShow;
    if (this.state.ascending) {
      movesToShow = moves;
    } else {
      movesToShow = reversedMoves;
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares = {current.squares}
            onClick={(i) => this.handleClick(i)}
          />

        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.changeSort()}>{sort}</button>
          <ol>{movesToShow}</ol>
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

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
