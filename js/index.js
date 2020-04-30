Vue.config.devtools = true;
var app = new Vue({
    el: '#app',
    data: {
      origin: [0, 0],
      cards: 0,
      steps: 0,
      cardConfig: [],
      cardOptions: [],
      triSize: 30,
      stepConfig: [],
      rules: [],
      repeat: 1
    },
    mounted() {
      if (localStorage.cardConfig) {
        cardConfig = JSON.parse(localStorage.getItem('cardConfig'));
        this.cardConfig = cardConfig;
      }
      if (localStorage.cards) {
        this.cards = parseInt(localStorage.cards, 10);
      }
      if (localStorage.steps) {
        this.steps = parseInt(localStorage.steps, 10);
      }
      if (localStorage.triSize) {
        this.triSize = parseInt(localStorage.triSize, 10);
      }
      if (localStorage.getItem('rules')) {
        try {
          this.rules = JSON.parse(localStorage.getItem('rules'));
        } catch(e) {
          localStorage.removeItem('rules');
        }
      }
      if (localStorage.repeat) {
        this.repeat = parseInt(localStorage.repeat, 10);
      }
      if (localStorage.getItem('cardOptions')) {
        try {
          this.cardOptions = JSON.parse(localStorage.getItem('cardOptions'));
        } catch(e) {
          localStorage.removeItem('cardOptions');
        }
      }
    },
    methods: {
      saveConfig(){
        localStorage.cards = this.cards;
        localStorage.steps = this.steps;
        localStorage.cardConfig = JSON.stringify(this.cardConfig);
        localStorage.triSize = this.triSize;
        localStorage.rules = JSON.stringify(this.rules);
        localStorage.repeat = this.repeat;
        localStorage.cardOptions = JSON.stringify(this.cardOptions);
      },
      resetAll(){
        this.origin = [0, 0];
        this.cards = 0;
        this.steps = 0;
        this.cardConfig = [];
        this.triSize = 30;
        this.stepConfig = [];
        this.rules = [];
        this.repeat = 1;
        this.saveConfig()
      },
      drawTri(vueCanvas, pos, card, color, up, left, size){
        longSide = size;
        shortSide = size / 1.5;
        startX = this.origin[0] + ((card-1) * shortSide) + (1 *(card-1));
        startY = this.origin[1] - ((pos) * longSide);
        vueCanvas.beginPath();
        if (up == true){
          vueCanvas.moveTo(startX, startY);
          if(left == true){
            vueCanvas.lineTo(startX, startY - longSide);
          }else{
            vueCanvas.lineTo(startX+shortSide, startY - longSide);
          }
          vueCanvas.lineTo(startX + shortSide, startY);
        }else{
          vueCanvas.moveTo(startX, startY - longSide);
          if(left == true){
            vueCanvas.lineTo(startX, startY);
          }else{
            vueCanvas.lineTo(startX + shortSide, startY);
          }
          vueCanvas.lineTo(startX + shortSide, startY - longSide);
        }
        vueCanvas.lineWidth = 2;
        vueCanvas.strokeStyle = "black";
        vueCanvas.stroke();
        vueCanvas.closePath();
        vueCanvas.fillStyle = color;
        vueCanvas.fill();
      },
      clearCanvas(){
        var canvas = document.getElementById("canvas");
        vueCanvas = canvas.getContext("2d");
        vueCanvas.clearRect(0, 0, canvas.width, canvas.height);
      },
      drawBox(){
        // draw box
        Lmargin = 25
        Tmargin = 10
        width = this.triSize/1.5 * this.cards + (1 * this.cards)+1;
        height = (this.triSize * this.repeat * this.steps) + 3;
        var canvas = document.getElementById("canvas");
        canvas.height = height + 50;
        canvas.width = width + 50;
        this.origin = [Lmargin+1, height+Tmargin-2];
        vueCanvas = canvas.getContext("2d");
        vueCanvas.strokeStyle = "black";
        vueCanvas.strokeRect(Lmargin, Tmargin, width, height);
        vueCanvas.stroke();
        
        // draw step text
        vueCanvas.font = "15px Arial";
        for(var i = 0; i < this.steps*this.repeat; i++) {
          vueCanvas.fillText(i+1, 2, height-(i*this.triSize));
        };

        // draw card text
        vueCanvas.font = "13px Arial";
        for(var i = 0; i < this.cards; i++ ) {
          vueCanvas.fillText(i+1, i*this.triSize/1.5+i+Lmargin+2, height+Tmargin+20);
        };
        return vueCanvas;
      },
      drawStep(vueCanvas){
        cardColorIdx = [];
        for(var i=0; i<this.cards; i++){
          cardColorIdx.push(0);
        }
        // init 0 step
        initCardLeft = []
        for (var i=0; i<this.cards; i++){
          if(this.cardConfig[i].initType=="z"){
            left = true;
          }else{
            left = false;
          }
          //this.drawTri(vueCanvas, 0, i+1, this.cardConfig[i].color[cardColorIdx[i]%4], up, left, this.triSize);
          initCardLeft[i] = !left;
        }
        // draw steps
        for (var r = 0; r < this.repeat; r++){
          for (var i = 0; i < this.steps; i++){
            for (var j = 0; j < this.cards; j++){
              currentLeft = !(initCardLeft[j]^this.stepConfig[i][j]);
              this.drawTri(vueCanvas, (r*this.steps)+i, j+1, this.cardConfig[j].color[cardColorIdx[j]%4], true, currentLeft, this.triSize);
              if(this.stepConfig[i][j] == true){
                cardColorIdx[j] += 1;
              }else{
                cardColorIdx[j] -= 1;
              }
              if(cardColorIdx[j]<0){
                cardColorIdx[j] = 4 + cardColorIdx[j]
              }
              this.drawTri(vueCanvas, (r*this.steps)+i, j+1, this.cardConfig[j].color[cardColorIdx[j]%4], false, !currentLeft, this.triSize);
            }
          }
        }
      },
      resetStep(){
        this.stepConfig = [];
        for (var i = 0; i < this.steps; i++) {
          this.stepConfig[i] = [];
          for (var j = 0; j < this.cards; j++) {
            this.stepConfig[i][j] = true;
          }
        }
      },
      resetCardStep(){
        this.cardConfig = [];
        for (var i = 0; i < this.cards; i++){
          this.cardConfig[i] = {
            "initType": "s",
            "color": ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]
          };
        }
        this.cardOptions = [];
        for (var i = 0; i < this.cards; i++){
          this.cardOptions[i] = { value: i, text: '卡片'+(i+1) };
        }
        this.resetStep();
      },
      addRule(){
        this.rules.push({
          cards: [],
          stepFrom: 0,
          stepTo: 0
        })
      },
      removeRule(index){
        this.rules.splice(index, 1);
      },
      evalRules(){
        for (var i = 0; i < this.rules.length; i++){
          card = this.rules[i].card;
          for(var j = this.rules[i].stepFrom; j<=this.rules[i].stepTo; j++){
            for(var k = 0; k<=this.rules[i].cards.length; k++){
              this.stepConfig[j][this.rules[i].cards[k]] = false;
            }
          }
        }
      },
      drawAll(){
        console.log(this.cardConfig);
        console.log(this.stepConfig);
        console.log(this.rules);
        this.resetStep();
        this.evalRules();
        this.clearCanvas();
        var vueCanvas = this.drawBox();
        this.drawStep(vueCanvas);
        this.saveConfig();
      }
    }
  })