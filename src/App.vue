<template>
  <main id="app">
    <canvas ref="canvas" id="canvas" v-on:click="onClick" width="640" height="640"></canvas>
  </main>
</template>

<script>
const { generateBoard, generateSolution } = require('../lib/rullo');

const lightenDarkenColor = function (col, amt) {
  let usePound = false;

  if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
  }

  let num = parseInt(col, 16);
  let r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if  (r < 0) r = 0;

  let b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) b = 255;
  else if  (b < 0) b = 0;

  let g = (num & 0x0000FF) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}
const sum = (a,b) => a + b;

export default {
  name: 'app',
  data () {
    return {
      provider: {
        context: null
      },
      width: 5,
      height: 5,
      board: [],
      solution: [],
      current: [],
      locked: [],
      shift: false,
      hover: {
        x: undefined,
        y: undefined
      },
      rowTargetSums: [],
      rowCurrentSums: [],
      columnTargetSums: [],
      columnCurrentSums: [],
    };
  },

  provide () {
    return {
      provider: this.provider
    };
  },

  mounted () {
    this.provider.context = this.$refs.canvas.getContext('2d');
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    this.board = generateBoard(this.width, this.height);
    this.solution = generateSolution(this.width, this.height);

    this.current = Array.from({length: this.height}).map(() => Array.from({length: this.width}).fill(true));
    this.locked = Array.from({length: this.height}).map(() => Array.from({length: this.width}).fill(false));
    this.renderGrid();
  },

  methods: {
    calcSums () {
      this.rowTargetSums = this.board.map((r,y) => r.map((i,x) => this.solution[y][x] ? i : 0).reduce(sum));
      this.rowCurrentSums = this.board.map((r,y) => r.map((i,x) => this.current[y][x] ? i : 0).reduce(sum))

      this.columnTargetSums = this.board[0].map((c,x) => this.board.map((r,y) => this.solution[y][x] ? r[x] : 0).reduce(sum));
      this.columnCurrentSums = this.board[0].map((c,x) => this.board.map((r,y) => this.current[y][x] ? r[x] : 0).reduce(sum));
    },

    renderGrid () {
      this.calcSums();

      let context = this.provider.context;
      let size = this.size = context.canvas.clientWidth / (this.width + 2);
      context.clearRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);

      context.textBaseline = 'middle';

      context.textAlign = 'center';
      context.lineWidth = 2;
      context.strokeStyle = '#171a29'; // grey border

      context.font = `${size * 3/8}px Roboto`
      // columnSums
      for (let x = 0; x < this.width; x++) {
        context.strokeStyle = '#404350'; // grey border
        context.fillStyle = '#171a29'; // black triangle
        drawTriangle(context, [{
          x: size + (x + 1) * size,
          y: 0
        }, {
          x: size + x * size,
          y: 0
        }, {
          x: size + x * size,
          y: size
        }], true);

        drawTriangle(context, [{
          x: size + (x + 1) * size,
          y: size * (this.width + 1)
        }, {
          x: size + x * size,
          y: size * (this.width + 1)
        }, {
          x: size + x * size,
          y: size * (this.width + 2)
        }], true);

        context.fillStyle = '#404350'; // grey triangle
        drawTriangle(context, [{
          x: size + (x + 1) * size,
          y: 0
        }, {
          x: size + (x + 1) * size,
          y: size
        }, {
          x: size + x * size,
          y: size
        }]);

        drawTriangle(context, [{
          x: size + (x + 1) * size,
          y: size * (this.width + 1)
        }, {
          x: size + (x + 1) * size,
          y: size * (this.width + 2)
        }, {
          x: size + x * size,
          y: size * (this.width + 2)
        }]);

        context.fillStyle = 'white';
        context.fillText(this.columnTargetSums[x], size + size * x + size / 4, size / 4, size / 4, size / 4);
        context.fillText(this.columnCurrentSums[x], size + size * x + size * 3 / 4, size * 3 / 4, size / 4, size / 4);

        context.fillStyle = 'white';
        context.fillText(this.columnTargetSums[x], size + size * x + size / 4, size * (this.width  + 1) + size / 4, size / 4, size / 4);
        context.fillText(this.columnCurrentSums[x], size + size * x + size * 3 / 4, size * (this.width  + 1) + size * 3 / 4, size / 4, size / 4);
      }

      // rowSums
      for (let y = 0; y < this.height; y++) {
        context.strokeStyle = '#404350'; // grey border
        context.fillStyle = '#171a29'; // black triangle
        drawTriangle(context, [{
          x: 0,
          y: size + (y + 1) * size
        }, {
          x: 0,
          y: size + y * size
        }, {
          x: size,
          y: size + y * size
        }], true);

        // context.strokeRect(0, size + y * size, size, size);

        drawTriangle(context, [{
          x: size * (this.width + 1),
          y: size + (y + 1) * size
        }, {
          x: size * (this.width + 1),
          y: size + y * size
        }, {
          x: size * (this.width + 2),
          y: size + y * size
        }], true);

        context.fillStyle = '#404350'; // grey triangle
        drawTriangle(context, [{
          x: 0,
          y: size + (y + 1) * size
        }, {
          x: size,
          y: size + (y + 1) * size
        }, {
          x: size,
          y: size + y * size
        }]);

        drawTriangle(context, [{
          x: size * (this.width + 1),
          y: size + (y + 1) * size
        }, {
          x: size * (this.width + 2),
          y: size + (y + 1) * size
        }, {
          x: size * (this.width + 2),
          y: size + y * size
        }]);

        context.fillStyle = 'white';
        context.fillText(this.rowTargetSums[y], size / 4, size + size * y + size / 4, size / 4, size / 4);
        context.fillText(this.rowCurrentSums[y], size * 3 / 4, size + size * y + size * 3 / 4, size / 4, size / 4);

        context.fillStyle = 'white';
        context.fillText(this.rowTargetSums[y], size * (this.width  + 1) + size / 4, size + size * y + size / 4, size / 4, size / 4);
        context.fillText(this.rowCurrentSums[y], size * (this.width  + 1) + size * 3 / 4, size + size * y + size * 3 / 4, size / 4, size / 4);
      }

      for (let x = 0; x < this.width; x++) {
        if (this.columnTargetSums[x] === this.columnCurrentSums[x]) {
          context.strokeStyle = '#fbe79e';
          context.strokeRect(size + size * x, 0, size, size);
          context.strokeRect(size + size * x, size * (this.width + 1), size, size);
        }
      }

      for (let y = 0; y < this.height; y++) {
        if (this.rowTargetSums[y] === this.rowCurrentSums[y]) {
          context.strokeStyle = '#fbe79e';
          context.strokeRect(0, size + size * y, size, size);
          context.strokeRect(size * (this.height + 1), size + size * y, size, size);
        }
      }

      context.lineWidth = 4;
      //let w = 4;
      context.font = `${size / 2}px Roboto`
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          let border = false;
          // context.fillStyle = this.current[y][x] && !(this.hover.x === x && this.hover.y === y) ? '#df144c' : '#404350'; // red rect
          context.fillStyle = this.current[y][x] ? '#df144c' : '#404350';
          if (this.locked[y][x]) {
            border = true;
            context.strokeStyle = this.current[y][x] ? '#fbe79e' : lightenDarkenColor('#fbe79e', -100); // gold border
          } else if (this.hover.x === x && this.hover.y === y) {
            border = true;
            context.fillStyle = lightenDarkenColor(context.fillStyle, -20);
            context.strokeStyle = lightenDarkenColor('#404350', -20); // grey border
          }

          context.beginPath();
          context.arc(size + x*size + (size / 2), size + y*size + (size / 2), size/2.8, 0, 360);
          context.fill();
          if (border) context.stroke();
          //context.fillRect(size + x*size + w, size + y*size + w, size - w*2, size - w*2);
          //if (border) context.strokeRect(size + x*size + w, size + y*size + w, size - w*2, size - w*2);
          context.fillStyle = '#fff'
          context.fillText(this.board[y][x], size + x*size + (size / 2), size + y*size + (size / 2), size, size);
        }
      }
    },

    onMouseMove (e) {
      let context = this.provider.context;
      let x = Math.floor((e.clientX - context.canvas.offsetLeft) / this.size) - 1;
      let y = Math.floor((e.clientY - context.canvas.offsetTop) / this.size) - 1;
      this.hover = {x, y};

      this.renderGrid();
    },

    onKeyDown (e) {
      let keyCode = e.keyCode || e.which;

      this.shift = e.shiftKey;

      if (keyCode == 32) { // prevent normal handling of space key
        if (e.stopPropagation) {
          e.stopPropagation();
        }
        e.preventDefault();
      }
    },

    onKeyUp (e) {
      let keyCode = e.keyCode || e.which;

      this.shift = e.shiftKey;

      if (keyCode == 32) { // prevent normal handling of space key
        if (e.stopPropagation) {
          e.stopPropagation();
        }
        e.preventDefault();
      }
    },

    onClick (e) {
      this.calcSums();

      let context = this.provider.context;
      let x = Math.floor((e.clientX - context.canvas.offsetLeft) / this.size) - 1;
      let y = Math.floor((e.clientY - context.canvas.offsetTop) / this.size) - 1;

      // columns
      if (this.shift) {
        if ((y < 0 || y === this.height) && (x > 0 || x <= this.width) && this.columnTargetSums[x] === this.columnCurrentSums[x]) {
          if (this.locked.map(i => i[x]).reduce(sum) < this.height) {
            for (let i = 0; i < this.height; i++) {
              this.locked[i][x] = 1;
            }
          } else {
            for (let i = 0; i < this.height; i++) {
              this.locked[i][x] = 0;
            }
          }
        }

        if ((x < 0 || x === this.width) && (y > 0 || y <= this.height) && this.rowTargetSums[y] === this.rowCurrentSums[y]) {
          if (this.locked[y].reduce(sum) < this.width) {
            for (let i = 0; i < this.width; i++) {
              this.locked[y][i] = 1;
            }
          } else {
            for (let i = 0; i < this.height; i++) {
              this.locked[y][i] = 0;
            }
          }
        }
      }

      if (x > -1 && y > -1 && x < this.width && y < this.height) {
        if (this.shift) {
          this.locked[y][x] = !this.locked[y][x];
        } else if (!this.locked[y][x]) {
          this.current[y][x] = !this.current[y][x];
        }
      }

      this.renderGrid();
    }
  }
}

function drawTriangle(context, points, border) {
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  context.lineTo(points[1].x, points[1].y);
  context.lineTo(points[2].x, points[2].y);
  context.fill();

  if (border) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    context.lineTo(points[1].x, points[1].y);
    context.lineTo(points[2].x, points[2].y);
    context.closePath();
    context.stroke();
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:400,500,700,900');

:root {
  background: #171a29;
  color: rgba(10, 5, 0, 0.75);
  shade: rgba(0, 0, 0, 0.12);
  shade-light: rgba(0, 0, 0, 0.05);
}

#app {
  margin: 32px auto 64px;
  max-width: 640px;
}

#canvas {
  width: 100%;
}
</style>
