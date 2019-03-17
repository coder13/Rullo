const rnd = (x) => Math.floor(Math.random() * x);

export function generateBoard (w, h) {
  let b = [];
  for (let y = 0; y < h; y++) {
    b[y] = [];
    for (let x = 0; x < w; x++) {
      b[y][x] = rnd(9)+1;
    }
  }

  return b;
}

export function generateSolution (w, h) {
  let n = 15; //w * h * 2/3;
  console.log(w, h, n)
  let b = [];
  for (let y = 0; y < h; y++) {
    let row = Array.from({length: w}).fill(1);
    row[rnd(w)] = 0;
    b.push(row);
  }
  let indexX, indexY;
  for (let i = 0; i < n - h*2; i++) {
    do {
      indexX = rnd(w);
      indexY = rnd(h);
    } while (!b[indexY][indexX])
    b[indexY][indexX] = 0;
  }
  return b;
}
