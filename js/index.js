var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      vueCanvas: null,
      origin: [0, 0],
      cards: 0,
      steps: 0,
      cardConfig: [],
      triSize: 30,
      stepConfig: [],
      rules: [],
      repeat: 1
    },
    mounted() {
      var canvas = document.getElementById("canvas");
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
      var ctx = canvas.getContext("2d");  
      this.vueCanvas = ctx;
      this.origin = [100, 500];
    },
    methods: {
      drawTri(pos, card, color, up, left, size){
        longSide = size;
        shortSide = size / 1.5;
        startX = this.origin[0] + ((card-1) * shortSide) + (1 *(card-1));
        startY = this.origin[1] - ((pos) * longSide);
        this.vueCanvas.beginPath();
        if (up == true){
          this.vueCanvas.moveTo(startX, startY);
          if(left == true){
            this.vueCanvas.lineTo(startX, startY - longSide);
          }else{
            this.vueCanvas.lineTo(startX+shortSide, startY - longSide);
          }
          this.vueCanvas.lineTo(startX + shortSide, startY);
        }else{
          this.vueCanvas.moveTo(startX, startY - longSide);
          if(left == true){
            this.vueCanvas.lineTo(startX, startY);
          }else{
            this.vueCanvas.lineTo(startX + shortSide, startY);
          }
          this.vueCanvas.lineTo(startX + shortSide, startY - longSide);
        }
        this.vueCanvas.lineWidth = 2;
        this.vueCanvas.strokeStyle = "black";
        this.vueCanvas.stroke();
        this.vueCanvas.closePath();
        this.vueCanvas.fillStyle = color;
        this.vueCanvas.fill();
      },
      clearCanvas(){
        var canvas = document.getElementById("canvas");
        this.vueCanvas.clearRect(0, 0, canvas.width, canvas.height);
      },
      drawBox(){
        // draw box
        Lmargin = 25
        Tmargin = 10
        width = this.triSize/1.5 * this.cards + (1 * this.cards)+1;
        height = (this.triSize * this.repeat * this.steps) + this.triSize + 3;
        var canvas = document.getElementById("canvas");
        canvas.height = height + 50;
        canvas.width = width + 50;
        this.origin = [Lmargin+1, height+Tmargin-2];
        this.vueCanvas = canvas.getContext("2d");
        this.vueCanvas.strokeStyle = "black";
        this.vueCanvas.strokeRect(Lmargin, Tmargin, width, height);
        this.vueCanvas.stroke();
        
        // draw step text
        this.vueCanvas.font = "15px Arial";
        for(var i = 0; i < this.steps*this.repeat; i++) {
          this.vueCanvas.fillText(i+1, 2, height-((i+1)*this.triSize));
        };

        // draw card text
        this.vueCanvas.font = "13px Arial";
        for(var i = 0; i < this.cards; i++ ) {
          this.vueCanvas.fillText(i+1, i*this.triSize/1.5+i+Lmargin+2, height+Tmargin+20);
        };
      },
      drawStep(){
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
          up = false
          this.drawTri(0, i+1, this.cardConfig[i].color[cardColorIdx[i]%4], up, left, this.triSize);
          initCardLeft[i] = !left;
        }
        // draw steps
        for (var r = 0; r < this.repeat; r++){
          for (var i = 0; i < this.steps; i++){
            for (var j = 0; j < this.cards; j++){
              currentLeft = !(initCardLeft[j]^this.stepConfig[i][j]);
              this.drawTri((r*this.steps)+i+1, j+1, this.cardConfig[j].color[cardColorIdx[j]%4], true, currentLeft, this.triSize);
              if(this.stepConfig[i][j] == true){
                cardColorIdx[j] += 1;
              }else{
                cardColorIdx[j] -= 1;
              }
              if(cardColorIdx[j]<0){
                cardColorIdx[j] = 4 + cardColorIdx[j]
              }
              this.drawTri((r*this.steps)+i+1, j+1, this.cardConfig[j].color[cardColorIdx[j]%4], false, !currentLeft, this.triSize);
            }
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
        this.stepConfig = [];
        for (var i = 0; i < this.steps; i++) {
          this.stepConfig[i] = [];
          for (var j = 0; j < this.cards; j++) {
            this.stepConfig[i][j] = true;
          }
        }
      },
      addRule(){
        this.rules.push({
          card: 0,
          from: 0,
          to: 0
        })
      },
      removeRule(index){
        this.rules.splice(index, 1);
      },
      evalRules(){
        for (var i = 0; i < this.rules.length; i++){
          card = this.rules[i].card;
          for(var j = this.rules[i].from; j <= this.rules[i].to; j++){
            this.stepConfig[j][card] = false;
          }
        }
      },
      drawAll(){
        console.log(this.cardConfig);
        console.log(this.stepConfig);
        console.log(this.rules);
        this.evalRules();
        this.clearCanvas();
        this.drawBox();
        this.drawStep();
      }
    }
  })