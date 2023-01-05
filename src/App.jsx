import { useState, useEffect } from "react";
import Board from "./components/Board";
import Bar from "./components/Bar";
import { toast } from "react-hot-toast";
import Piece from "./components/Piece";
import "./App.css";
import { initialState } from "./logic";

// https://salamdonya.com/fun/how-to-play-backgammon

function App() {
  const [dice, setDice] = useState([]);
  const [board, setBoard] = useState(initialState);
  const [turn, setTurn] = useState(1);
  const [blackOut, setBlackOut] = useState([]);
  const [whiteOut, setWhiteOut] = useState([]);

  const [player, setPlayer] = useState({
    selectedBars: [],
    availableMoves: [],
  });

  // roll dice function, it will generate two random numbers between 1 and 6
  function rollDice() {
    if (dice.length > 0) return toast.error("You can't roll the dice!");
    const first = Math.floor(Math.random() * 6) + 1;
    const second = Math.floor(Math.random() * 6) + 1;
    let dices = [first, second];
    if (first == second) {
      dices.push(first);
      dices.push(second);
    }

    setDice(dices);
    // check if player can play their dice
    let color = "white";
    if (turn == -1) color = "black";
    if (color == "white" && whiteOut.length > 0) {
      convertPlacement(color, dices);
    } else if (color == "black" && blackOut.length > 0) {
      convertPlacement(color);
    }
  }

  function convertPlacement(color, dices) {
    console.log(dices);
    let converted = [];
    if (color == "white") {
      let indexes = [6, 7, 8, 9, 10, 11];
      indexes.forEach((ind) => {
        if (ind == 12 - dices[0]) {
          converted.push(ind);
        } else if (ind == 12 - dices[1]) {
          converted.push(ind);
        }
      });
    } else if (color == "black") {
      let indexes = [18, 19, 20, 21, 22, 23];
      indexes.forEach((ind) => {
        if (ind == 24 - dices[0]) {
          converted.push(ind);
        } else if (ind == 24 - dices[1]) {
          converted.push(ind);
        }
      });
    }
    const res = getAvailableForOut(converted, color);
    if (res != undefined) {
      let temp = { ...player };
      temp.availableMoves = res;
      if (turn == 1) {
        temp.selectedBars.push(11);
      } else {
        temp.selectedBars.push(23);
      }
      setPlayer(temp);
    } else {
      toast.error("You can't play");
    }
  }

  function getAvailableForOut(places, color) {
    let available = [];
    console.log(places);
    console.log(available);
    places.forEach((place) => {
      if (board[place].top() == color || board[place].top() == undefined) {
        available.push(place);
      } else if (board[place].length() == 1) {
        available.push(place);
      }
    });
    console.log(available);
    if (available.length == 0) {
      setDice([]);
      return undefined;
    } else {
      return available;
    }
  }

  function calculateAvailableMoves() {
    const from = player.selectedBars[0];
    let dest1;
    let dest2;
    let dest3;

    if ((from <= 11 && turn == 1) || (from > 11 && turn == -1)) {
      dest1 = from - dice[0];
      dest2 = from - dice[1];
      dest3 = from - (dice[0] + dice[1]);
      // change row for white
      if (turn == 1) {
        if (dest1 < 0) {
          dest1 = -dest1 + 11;
        }
        if (dest2 < 0) {
          dest2 = -dest2 + 11;
        }
        if (dest3 < 0) {
          dest3 = -dest3 + 11;
        }
      } // change row for black
      else {
        if (dest1 < 12) {
          dest1 = 11 - dest1;
        }

        if (dest2 < 12) {
          dest2 = 11 - dest2;
        }

        if (dest3 < 12) {
          dest3 = 11 - dest3;
        }
      }
    } else if ((from <= 11 && turn == -1) || (from > 11 && turn == 1)) {
      dest1 = from + dice[0];
      dest2 = from + dice[1];
      dest3 = from + (dice[0] + dice[1]);
    }

    const destinations = [dest1, dest2, dest3];
    const available = [];
    let color = "white";
    if (turn == -1) color = "black";

    destinations.forEach((dest) => {
      if (!isNaN(dest)) {
        if (board[dest].top() == color || board[dest].top() == undefined) {
          available.push(dest);
        } else if (board[dest].length() == 1) {
          available.push(dest);
        }
      }
    });
    let temp = { ...player };
    temp.availableMoves = available;
    setPlayer(temp);
  }

  function movement(isComing) {
    const from = player.selectedBars[0]; // 11
    const to = player.selectedBars[1]; // 3
    const moves = player.availableMoves; // [2, 3]
    let color = "white";
    if (turn == -1) color = "black";
    console.log(moves);
    console.log(player);

    // check if from and to are the same, check if the destination is available for the player
    if (from == to) {
      toast("Canceled");
    } else if (!moves.includes(to)) {
      toast.error("You can't do this");
    } else {
      // update the board
      if (board[to].length() == 1) {
        if (color == "white" && board[to].top() == "black") {
          blackOut.push(board[to].pop());
          console.log("blackOut: ");
          console.log(blackOut);
        } else if (color == "black" && board[to].top() == "white") {
          whiteOut.push(board[to].pop());
          console.log("whiteOut: ");
          console.log(whiteOut);
        }
      }
      if (isComing) {
        board[to].push(color);
      } else {
        board[to].push(board[from].pop());
      }

      // ********************************

      // update player
      let p = { ...player };

      p.availableMoves.pop();
      const index = p.availableMoves.indexOf(to);
      if (index > -1) {
        p.availableMoves.splice(index, 1);
      }
      setPlayer(p);

      // ********************************

      // update dice
      let d = [...dice];
      let diceNum;
      if ((from <= 11 && turn == 1) || (from > 11 && turn == -1)) {
        diceNum = from - to;
        if (isComing) {
          diceNum += 1;
        }
        if (diceNum < 0) {
          diceNum = to - (11 - from);
        } else if (diceNum > 6) {
          diceNum = from - (11 - to);
        }
      } else if ((from <= 11 && turn == -1) || (from > 11 && turn == 1)) {
        diceNum = to - from;
      }
      const din = d.indexOf(diceNum);
      if (din > -1) {
        d.splice(din, 1);
      }
      setDice(d);
      if (d.length == 0) {
        setTurn((prev) => prev * -1);
      }
    }

    let temp = { ...player };
    temp.selectedBars = [];
    setPlayer(temp);
  }

  // select bar function, it will select the bar player clicked on
  function select(index) {
    if (whiteOut.length > 0 && turn == 1) {
      let temp = { ...player };
      temp.selectedBars.push(index);
      setPlayer(temp);
      movement(true);
    } else if (blackOut.length > 0 && turn == -1) {
      let temp = { ...player };
      temp.selectedBars.push(index);
      setPlayer(temp);
      movement(true);
    } else {
      // check if dice has been rolled
      if (dice.length == 0) return toast.error("You must roll the dice first!");

      // check for the right player
      if (
        (turn == 1 &&
          board[index].top() == "black" &&
          player.selectedBars.length == 0) ||
        (turn == -1 &&
          board[index].top() == "white" &&
          player.selectedBars.length == 0)
      )
        return toast.error("It's not your turn!");

      // check if the first selected bar is empty
      if (board[index].top() === undefined && player.selectedBars.length == 0)
        return toast.error("There Is No Piece In This Place");

      let temp = { ...player };
      temp.selectedBars.push(index);
      setPlayer(temp);

      if (player.selectedBars.length == 1) calculateAvailableMoves();

      if (player.selectedBars.length == 2) movement(false);
    }
  }

  function showDice() {
    let str = "Dice Numbers:";
    let d1 = "";
    let d2 = "";
    if (dice[0] != undefined) {
      d1 = dice[0].toString();
    }
    if (dice[1] != undefined) {
      d2 = dice[1].toString();
    }

    if (d1 != "") {
      str = `${str} ${d1}`;
    }
    if (d2 != "") {
      if (str.indexOf(" ") >= 0) {
        str = `${str} ,`;
      }
      str = `${str} ${d2}`;
    }
    return str;
  }

  return (
    <>
      <Board>
        {board.map((bar, barIdx) => (
          <Bar
            isTopRow={barIdx > 11}
            onClick={() => select(barIdx)}
            key={barIdx}
          >
            {bar.convertToArray().map((piece, pieceIdx) => (
              <Piece key={`${barIdx}-${pieceIdx}`} color={piece} />
            ))}
          </Bar>
        ))}
      </Board>
      <button onClick={rollDice}>🎲 Roll dice 🎲</button>
      <div className="dice">{dice.length > 0 ? showDice() : ""}</div>
    </>
  );
}

export default App;
