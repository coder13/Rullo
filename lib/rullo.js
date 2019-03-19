const rnd = (x) => Math.floor(Math.random() * x);
const sum = (a, b) => a + b;

const sumRows = (board) => board.map((r,y) => r.map((i,x) => i).reduce(sum));
const sumColumns = (board) => board[0].map((c,x) => board.map((r,y) => r[x]).reduce(sum));

const Events = {};

Events['1-9'] = () => rnd(9) + 1;
Events['1-19'] = () => rnd(19) + 1;
Events['2-4'] = () => rnd(3) + 2;

export { Events };

export function generateBoard (w, h, genFunc) {
  let b = [];
  for (let y = 0; y < h; y++) {
    b[y] = [];
    for (let x = 0; x < w; x++) {
      b[y][x] = genFunc ? genFunc() : rnd(9);
    }
  }

  return b;
}

export function generateSolution (w, h) {
  let n = w*h - Math.round(w * h * 2/3);
  console.log(w, h, w*h-n);
  let sol = [];
  for (let y = 0; y < h; y++) {
    let row = Array.from({length: w}).fill(1);
    row[rnd(w)] = 0;
    sol.push(row);
    n--;
  }

  let columns = sumColumns(sol);
  console.log(columns);
  for (let x = 0; x < w; x++) {
    if (columns[x] === h) {
      let y = rnd(h);
      sol[y][x] = 0;
      n--;
    }
  }

  let indexX, indexY;
  for (; n > 0; n--) {
    do {
      indexX = rnd(w);
      indexY = rnd(h);
    } while (!sol[indexY][indexX])
    sol[indexY][indexX] = 0;
  }

  return sol;
}
