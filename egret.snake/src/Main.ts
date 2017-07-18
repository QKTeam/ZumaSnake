//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView: LoadingUI;
    private snake: Snake;
    private timer: egret.Timer;
    private TimerForAccelerate: egret.Timer;
    private TimerForAccelerateListener: egret.Timer;
    private moveEvent: egret.TouchEvent;
    private interval: number;
    private food: Food[];
    private bigfood: BigFood[];
    private color: Color;
    private radius = 20;
    private foodnum = 40;
    private foodcolor: ColorCount[];
    private foodAccumulate = 3;

    public constructor() {
        super();
        this.interval = 150 ;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.createGameScene, this);
        this.food = [];
        this.foodcolor = [];
        this.bigfood = [];
    }

   
    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {

        var bg: egret.Shape = new egret.Shape();
		bg.graphics.beginFill(0xffccbc);
		bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageWidth);
		bg.graphics.endFill();
		this.addChild(bg);
        this.randomFood();


        this.snake = new Snake(100 ,100, 20, 10);
        this.addChild(this.snake);

        mouse.enable(this.stage);
        mouse.setMouseMoveEnabled(true);
        this.touchEnabled = true;
        this.addEventListener(mouse.MouseEvent.MOUSE_MOVE, this.move, this);
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.startTouchAccelerate, this)
        //this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchAccelerate, this);
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.endTouchAccelerate, this);
    }
    
    private move(e: egret.TouchEvent) {
        this.moveEvent = e;
        if (this.timer == null){
            this.timer = new egret.Timer(this.interval);
            if (!this.timer.hasEventListener(egret.TimerEvent.TIMER)){
                this.timer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
            }
            this.timer.start();
        }
        if (this.snake.body.length <= 2) {
            this.endTouchAccelerate();
        }
    }

    

    private onEatFood(i) {
        var judge = 0;
        var ncolor = this.food[i].colornum;
        var ncount = 1;
        var foodcount: ColorCount = new ColorCount(ncolor, ncount);
        this.removeChild(this.food[i]);
        console.log(ncolor);
        
        for(var j = 0;j < this.foodcolor.length;j++) {
            if(this.foodcolor[j].color == ncolor) {
                this.foodcolor[j].count ++;
                judge = 1;
                break;
            }
            else {
                judge = 0;
            }
        }
        if(judge == 0) {
            this.foodcolor.push(foodcount);
        }
        for(var j = 0;j < this.foodcolor.length;j++) {
            if(this.foodcolor[j].count >= this.foodAccumulate) {
                this.foodcolor[j].count -= this.foodAccumulate;
                this.snake.afterEat(this.foodcolor[j].color);
            }
        }
        this.food.splice(i,1);
    }
    private onEatBig(i) {
        this.removeChild(this.bigfood[i]);
        this.snake.afterEat(this.bigfood[i].colornum);
        console.log(this.bigfood[i].colornum);
        // this.bigfood[i] = null;
        this.bigfood.slice(i, 1);
        // this.randomBig();
        
    }
    
    private onTimer() {
        for(var i = 0;i < this.food.length;i++) {
            if(this.hit(this.snake.head,this.food[i])) {
                this.onEatFood(i);
                break;
            }
        }
        for(var i = 0;i < this.bigfood.length;i++) {
            if(this.hit(this.snake.head,this.bigfood[i])) {
                this.onEatBig(i);
                break;
            }
        }
        this.snake.Move(this.moveEvent, this.interval);
    }
    private randomFood() {
        for(var i = 0;i < this.foodnum;i++) {
            var foodpoint: Food = new Food();
            foodpoint.init(tmpx,tmpy,this.radius);
            var tmpx = Math.random() * (this.stage.stageWidth - this.radius * 2);
            var tmpy = Math.random() * (this.stage.stageHeight - this.radius * 2);
            this.food.push(foodpoint);
            this.addChild(this.food[i]);
        }
    }
    private hit(a, b) {
        return (new egret.Rectangle(a.x + this.snake.x - this.radius, a.y + this.snake.y - this.radius, a.width, a.height))
            .intersects(new egret.Rectangle(b.x,b.y,b.width,b.height));
    }

    private startTouchAccelerate() {
        if(this.snake.body.length > 2){
            this.timer.delay = 80;
            this.interval = 80;
            this.startAccelerate();
        }
    }
    private endTouchAccelerate() {
        this.timer.delay = 150;
        this.interval = 150;
        this.stopAccelerate();
    }

    private startAccelerate() {
		this.snake.AccelerateTimer = new egret.Timer(30);
		this.snake.AccelerateTimer.addEventListener(egret.TimerEvent.TIMER, function() {
			this.snake.count++;
			
			if(this.snake.body.length > 2 && this.snake.count%100 === 0) {
				var last_body = this.snake.body[this.snake.body.length - 1];
				this.snake.body.splice(-1, 1);
				var animate: egret.Tween = egret.Tween.get(last_body);
				animate.to({scaleX: 0.01, scaleY: 0.01}, 500, egret.Ease.circOut);
				var time = egret.setTimeout(function() {
					this.snake.removeChild(last_body);
				}, this, 500);
				this.BodytoFood(last_body, last_body.Color);
				this.snake.count = 0;
			}
		}, this);
		this.snake.AccelerateTimer.start();
	}

	private stopAccelerate() {
		this.snake.AccelerateTimer.stop();
	}

	private BodytoFood(bodypoint: egret.Shape, bodycolor: number) {
		var food: Food[] = [];
		for (var i = 0; i < 5; i++) {
			food[i] = new Food();
			food[i].Accelerate(bodypoint.x+this.snake.x, bodypoint.y+this.snake.y, this.radius, bodycolor);		
			this.addChild(food[i]);
            this.setChildIndex(food[i],1);
            this.food.push(food[i]);
			var animate: egret.Tween = egret.Tween.get(food[i]);
			var randomAngle = Math.random()*(Math.PI + 1);
			animate.to({
				x: this.snake.x+bodypoint.x + 50*Math.cos(randomAngle), 
				y: this.snake.y+bodypoint.y + 50*Math.sin(randomAngle)
			}, 500, egret.Ease.circOut);
		}
	}
}


