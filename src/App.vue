<template>
  <main id="app">
    <h1>Rullo</h1>
    <div style="display: flex; align-items: flex-end; height: 72px;">
      <div style="display: flex; flex-grow: 1;">
        <div id="eventSelector" style="margin: 16px 16px 16px 0px;">
          <select v-model="curEvent" @change="scramble">
            <option>1-9</option>
            <option>1-19</option>
            <option>2-4</option>
            <option>custom</option>
          </select>
        </div>
        <div id="sizeSelector" style="display: flex; align-items: center; margin: 16px;">
          <span>Size:</span>
          <input type="number" name="width" class="sizeInput" v-model="width" @change="scramble"/>
          <span>X</span>
          <input type="number" name="height" class="sizeInput" v-model="height" @change="scramble"/>
        </div>
      </div>
      <div style="margin: 0px 0px 12px; display: flex;">
      <button @click="scramble">{{solved ? 'New Game' : 'Reset'}}</button></div>
    </div>
    <canvas ref="canvas" id="canvas" :class="[solved ?  'solved' : '']" v-on:click="onClick" width="640" height="640"></canvas>
    <hr>
  </main>
</template>

<script>
const { Rullo, Events } = require('../lib/rullo');

window.Rullo = Rullo;

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
      curEvent: '1-9',
      width: 4,
      height: 4,
      rullo: undefined,
      solved: false,
      shift: false,
      hover: {
        x: undefined,
        y: undefined
      },
    };
  },

  watch: {
    width: function(val) {
      if (val < 4) {
        val = 4;
      }

      this.width = +val;
      this.height = +val;
    },
    height: function(val) {
      if (val < 4) {
        val = 4;
      }

      this.height = +val;
      this.width = +val;
    },
  },

  provide () {
    return {
      provider: this.provider
    };
  },

  mounted () {
    let canvas = this.$refs.canvas;
    this.provider.context = canvas.getContext('2d');
    canvas.height = canvas.getBoundingClientRect().height; // height has to be set first /shrug
    canvas.width = canvas.getBoundingClientRect().width;

    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    this.scramble();
  },

  methods: {
    scramble () {
      this.rullo = window.rullo = new Rullo(this.width, this.height, Events[this.curEvent]);

      this.renderGrid();
    },

    renderGrid () {
      this.solved = this.rullo ? this.rullo.solved() : false;
      let context = this.provider.context;
      let rect = context.canvas.getBoundingClientRect();
      let size = this.size = rect.width / (this.rullo.width + 2);
      context.clearRect(0, 0, rect.width, rect.height);

      context.textBaseline = 'middle';

      context.textAlign = 'center';
      context.lineWidth = 2;
      context.strokeStyle = '#171a29'; // grey border

      context.font = `${size * 3/8}px Roboto`
      // columnSums
      for (let x = 0; x < this.rullo.width; x++) {
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
          y: size * (this.rullo.width + 1)
        }, {
          x: size + x * size,
          y: size * (this.rullo.width + 1)
        }, {
          x: size + x * size,
          y: size * (this.rullo.width + 2)
        }], true);

        context.fillStyle = '#40435000'; // grey triangle
        drawTriangle(context, [{
          x: size + (x + 1) * size,
          y: 0
        }, {
          x: size + (x + 1) * size,
          y: size
        }, {
          x: size + x * size,
          y: size
        }], true);

        drawTriangle(context, [{
          x: size + (x + 1) * size,
          y: size * (this.rullo.width + 1)
        }, {
          x: size + (x + 1) * size,
          y: size * (this.rullo.width + 2)
        }, {
          x: size + x * size,
          y: size * (this.rullo.width + 2)
        }], true);

        context.fillStyle = 'white';
        context.fillText(this.rullo.columnTargetSums[x], size + size * x + size / 4, size / 4, size / 4, size / 4);
        context.fillText(this.rullo.columnCurrentSums[x], size + size * x + size * 3 / 4, size * 3 / 4, size / 4, size / 4);

        context.fillStyle = 'white';
        context.fillText(this.rullo.columnTargetSums[x], size + size * x + size / 4, size * (this.rullo.width  + 1) + size / 4, size / 4, size / 4);
        context.fillText(this.rullo.columnCurrentSums[x], size + size * x + size * 3 / 4, size * (this.rullo.width  + 1) + size * 3 / 4, size / 4, size / 4);
      }

      // rowSums
      for (let y = 0; y < this.rullo.height; y++) {
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
          x: size * (this.rullo.width + 1),
          y: size + (y + 1) * size
        }, {
          x: size * (this.rullo.width + 1),
          y: size + y * size
        }, {
          x: size * (this.rullo.width + 2),
          y: size + y * size
        }], true);

        context.fillStyle = '#40435000'; // grey triangle
        drawTriangle(context, [{
          x: 0,
          y: size + (y + 1) * size
        }, {
          x: size,
          y: size + (y + 1) * size
        }, {
          x: size,
          y: size + y * size
        }], true);

        drawTriangle(context, [{
          x: size * (this.rullo.width + 1),
          y: size + (y + 1) * size
        }, {
          x: size * (this.rullo.width + 2),
          y: size + (y + 1) * size
        }, {
          x: size * (this.rullo.width + 2),
          y: size + y * size
        }], true);

        context.fillStyle = 'white';
        context.fillText(this.rullo.rowTargetSums[y], size / 4, size + size * y + size / 4, size / 4, size / 4);
        context.fillText(this.rullo.rowCurrentSums[y], size * 3 / 4, size + size * y + size * 3 / 4, size / 4, size / 4);

        context.fillStyle = 'white';
        context.fillText(this.rullo.rowTargetSums[y], size * (this.rullo.width  + 1) + size / 4, size + size * y + size / 4, size / 4, size / 4);
        context.fillText(this.rullo.rowCurrentSums[y], size * (this.rullo.width  + 1) + size * 3 / 4, size + size * y + size * 3 / 4, size / 4, size / 4);
      }

      for (let x = 0; x < this.rullo.width; x++) {
        if (this.rullo.columnTargetSums[x] === this.rullo.columnCurrentSums[x]) {
          context.strokeStyle = '#fbe79e';
          context.strokeRect(size + size * x, 0, size, size);
          context.strokeRect(size + size * x, size * (this.rullo.width + 1), size, size);
        }
      }

      for (let y = 0; y < this.rullo.height; y++) {
        if (this.rullo.rowTargetSums[y] === this.rullo.rowCurrentSums[y]) {
          context.strokeStyle = '#fbe79e';
          context.strokeRect(0, size + size * y, size, size);
          context.strokeRect(size * (this.rullo.height + 1), size + size * y, size, size);
        }
      }

      context.lineWidth = 4;
      //let w = 4;
      context.font = `${size / 2}px Roboto`
      for (let y = 0; y < this.rullo.height; y++) {
        for (let x = 0; x < this.rullo.width; x++) {
          let border = false;
          // context.fillStyle = this.rullo.current[y][x] && !(this.hover.x === x && this.hover.y === y) ? '#df144c' : '#404350'; // red rect
          context.fillStyle = this.rullo.current[y][x] ? '#df144c' : '#404350';
          if (this.rullo.locked[y][x]) {
            border = true;
            context.strokeStyle = this.rullo.current[y][x] ? '#fbe79e' : lightenDarkenColor('#fbe79e', -100); // gold border
          } else if (!this.rullo.solved() && this.hover.x === x && this.hover.y === y) {
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
          context.fillStyle = this.rullo.current[y][x] ? '#fff' : lightenDarkenColor('#ffffff', -120);
          context.fillText(this.rullo.board[y][x], size + x*size + (size / 2), size + y*size + (size / 2), size, size);
        }
      }
    },

    getMouseCoords (e) {
      return {
        x: Math.floor((e.clientX - this.provider.context.canvas.offsetLeft) / this.size) - 1,
        y: Math.floor((e.clientY - this.provider.context.canvas.offsetTop) / this.size) - 1
      };
    },

    onMouseMove (e) {
      let {x, y} = this.getMouseCoords(e);
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
      if (this.rullo.solved()) {
        return;
      }

      let {x, y} = this.getMouseCoords(e);

      // columns
      if ((y < 0 || y === this.rullo.height) && (x >= 0 && x <= this.rullo.width - 1) && this.rullo.columnTargetSums[x] === this.rullo.columnCurrentSums[x]) {
        if (this.rullo.locked.map(i => i[x]).reduce(sum) < this.rullo.height) {
          for (let i = 0; i < this.rullo.height; i++) {
            this.rullo.locked[i][x] = 1;
          }
        } else {
          for (let i = 0; i < this.rullo.height; i++) {
            this.rullo.locked[i][x] = 0;
          }
        }
      }

      if ((x < 0 || x === this.rullo.width) && (y >= 0 && y <= this.rullo.height - 1) && this.rullo.rowTargetSums[y] === this.rullo.rowCurrentSums[y]) {
        if (this.rullo.locked[y].reduce(sum) < this.rullo.width) {
          for (let i = 0; i < this.rullo.width; i++) {
            this.rullo.locked[y][i] = 1;
          }
        } else {
          for (let i = 0; i < this.rullo.height; i++) {
            this.rullo.locked[y][i] = 0;
          }
        }
      }

      if (x > -1 && y > -1 && x < this.rullo.width && y < this.rullo.height) {
        if (this.shift) {
          this.rullo.locked[y][x] = !this.rullo.locked[y][x];
        } else if (!this.rullo.locked[y][x]) {
          this.rullo.current[y][x] = !this.rullo.current[y][x];
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
