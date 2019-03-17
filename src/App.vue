<template>
  <main id="app">
    <canvas ref="canvas" id="canvas" v-on:click="onClick" width="640" height="640"></canvas>
  </main>
</template>

<script>
const { generateBoard, generateSolution } = require('../lib/rullo');

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
      }
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

    this.current = Array.from({length: this.height}).map(i => Array.from({length: this.width}).fill(true));
    this.locked = Array.from({length: this.height}).map(i => Array.from({length: this.width}).fill(false));
    this.renderGrid();
  },

  methods: {
    renderGrid () {
      let context = this.provider.context;
      let size = this.size = context.canvas.clientWidth / (this.width + 2);
      context.clearRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);

      const sum = (a,b) => a+b;

      let rowTargetSums = this.board.map((r,y) => r.map((i,x) => this.solution[y][x] ? i : 0).reduce(sum));
      let rowCurrentSums = this.board.map((r,y) => r.map((i,x) => this.current[y][x] ? i : 0).reduce(sum))
      //let rowCurrentSums = this.board.map(r => r.reduce(sum));

      let columnTargetSums = this.board[0].map((c,x) => this.board.map((r,y) => this.solution[y][x] ? r[x] : 0).reduce(sum));
      let columnCurrentSums = this.board[0].map((c,x) => this.board.map((r,y) => this.current[y][x] ? r[x] : 0).reduce(sum));
      // let columnCurrentSums = this.board[0].map((c,x) => this.board.map(r => r[x]).reduce(sum));

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
        context.fillText(columnTargetSums[x], size + size * x + size / 4, size / 4, size / 4, size / 4);
        context.fillText(columnCurrentSums[x], size + size * x + size * 3 / 4, size * 3 / 4, size / 4, size / 4);

        context.fillStyle = 'white';
        context.fillText(columnTargetSums[x], size + size * x + size / 4, size * (this.width  + 1) + size / 4, size / 4, size / 4);
        context.fillText(columnCurrentSums[x], size + size * x + size * 3 / 4, size * (this.width  + 1) + size * 3 / 4, size / 4, size / 4);
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
        context.fillText(rowTargetSums[y], size / 4, size + size * y + size / 4, size / 4, size / 4);
        context.fillText(rowCurrentSums[y], size * 3 / 4, size + size * y + size * 3 / 4, size / 4, size / 4);

        context.fillStyle = 'white';
        context.fillText(rowTargetSums[y], size * (this.width  + 1) + size / 4, size + size * y + size / 4, size / 4, size / 4);
        context.fillText(rowCurrentSums[y], size * (this.width  + 1) + size * 3 / 4, size + size * y + size * 3 / 4, size / 4, size / 4);
      }

      context.lineWidth = 4;
      let w = 4;
      context.font = `${size / 2}px Roboto`
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          context.fillStyle = this.current[y][x] && !(this.hover.x === x && this.hover.y === y) ? '#df144c' : '#404350'; // red rect
          context.fillRect(size + x*size + w, size + y*size + w, size - w*2, size - w*2);

          if (this.locked[y][x]) {
            context.strokeStyle = 'yellow'; // grey border
          } else if (this.hover.x === x && this.hover.y === y) {
            context.strokeStyle = 'red'; // grey border
          } else {
            context.strokeStyle = '#404350';
          }

          context.strokeRect(size + x*size + w, size + y*size + w, size - w*2, size - w*2);
          context.fillStyle = '#fff'
          context.fillText(this.board[y][x], size + x*size + (size / 2), size + y*size + (size / 2), size, size);
        }
      }
    },

    onMouseMove (e) {
      let context = this.provider.context;
      let size = this.size;
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
      let context = this.provider.context;
      let size = this.size;
      let x = Math.floor((e.clientX - context.canvas.offsetLeft) / this.size) - 1;
      let y = Math.floor((e.clientY - context.canvas.offsetTop) / this.size) - 1;

      if (x < 0 || y < 0) {
        return;
      }

      if (this.shift) {
        this.locked[y][x] = !this.locked[y][x];
      } else if (!this.locked[y][x]) {
        this.current[y][x] = !this.current[y][x];
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
