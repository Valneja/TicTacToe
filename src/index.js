import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
  const style = {
    color: 'black'
  };
  if (props.isWinningSquare) {
    style.color = 'green';
  }
  if (props.gameOver) {
    style.color = 'red';
  }
  return (
    <button
      className="square"
      onClick={props.onClick}
      style={style}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        isWinningSquare={this.props.isWinningSquare[i]}
        gameOver={this.props.gameOver}
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
        isWinningSquare: Array(9).fill(false),
        lastPosition: null,
        gameOver: false,
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
    const isWinningSquare = current.isWinningSquare.slice();
    let calculate = calculateWinner(squares);

    if (calculate['winner'] || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    calculate = calculateWinner(squares);
    if (calculate['winner'] && calculate['combination']) {
      isWinningSquare[calculate['combination'][0]] = true;
      isWinningSquare[calculate['combination'][1]] = true;
      isWinningSquare[calculate['combination'][2]] = true;
    }

    const isGameOver = this.checkIfGameOver(squares, calculate['winner']);

    this.setState({
      history: history.concat([{
        squares: squares,
        isWinningSquare: isWinningSquare,
        lastPosition: i,
        gameOver: isGameOver,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  checkIfGameOver(squares, winner) {
    if (winner) {
      return false;
    }
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        return false;
      }
    }
    return true;
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
    const {winner, combination} = calculateWinner(current.squares);
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
    if (current.gameOver) {
      status = "It's draw";
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares = {current.squares}
            isWinningSquare = {current.isWinningSquare}
            gameOver = {current.gameOver}
            onClick = {(i) => this.handleClick(i)}
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
      return {winner: squares[a], combination: [a,b,c]};
    }
  }
  return {winner: null, combination: null};
}
