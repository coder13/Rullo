const rnd = (x) => Math.floor(Math.random() * x);
const sum = (a, b) => a + b;

//const sumRows = (board) => board.map(r => r.reduce(sum));
const sumColumns = (board) => board[0].map((c,x) => board.map(r => r[x]).reduce(sum));

const Events = {};

Events['1-9'] = () => rnd(9) + 1;
Events['1-19'] = () => rnd(19) + 1;
Events['2-4'] = () => rnd(3) + 2;

export { Events };

const generateBoard = function (w, h, genFunc) {
  let b = [];
  for (let y = 0; y < h; y++) {
    b[y] = [];
    for (let x = 0; x < w; x++) {
      b[y][x] = genFunc ? genFunc() : rnd(9);
    }
  }

  return b;
}

const generateSolution = function (w, h) {
  let n = w*h - Math.round(w * h * 2/3);
  let sol = [];
  for (let y = 0; y < h; y++) {
    let row = Array.from({length: w}).fill(1);
    row[rnd(w)] = 0;
    sol.push(row);
    n--;
  }

  let columns = sumColumns(sol);
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

export class Rullo {
  constructor(w, h, genFunc) {
    this.width = w;
    this.height = h;
    this.board = generateBoard(w, h, genFunc);
    this.solution = generateSolution(w, h);
    this.current = Array.from({length: this.height}).map(() => Array.from({length: this.width}).fill(true));
    this.locked = Array.from({length: this.height}).map(() => Array.from({length: this.width}).fill(false));
    this.history = [];
  }

  get rowTargetSums () {
    return this.board.map((r,y) => r.map((i,x) => this.solution[y][x] ? i : 0).reduce(sum));
  }

  get rowCurrentSums () {
    return this.board.map((r,y) => r.map((i,x) => this.current[y][x] ? i : 0).reduce(sum))
  }

  get columnTargetSums () {
    return this.board[0].map((c,x) => this.board.map((r,y) => this.solution[y][x] ? r[x] : 0).reduce(sum));
  }

  get columnCurrentSums () {
    return this.board[0].map((c,x) => this.board.map((r,y) => this.current[y][x] ? r[x] : 0).reduce(sum));
  }

  solved () {
    return this.rowTargetSums.every((i,index) => i === this.rowCurrentSums[index]) && this.columnTargetSums.every((i,index) => i === this.columnCurrentSums[index])
  }

  preformAction (action) {
    if (action.type === 'toggle') {
      this.toggle(action.x, action.y)
    } else if (action.type === 'lock') {
      this.lock(action.x, action.y)
    }
  }

  toggle (x, y) {

  }

  lock (x, y) {

  }

  static fromState(state) {
    let r = new Rullo(state.width, state.height);
    r.board = state.board;
    r.solution = state.solution;
    r.current = state.current;
    r.locked = state.locked;
    r.history = state.history;
    return r;
  }
}
