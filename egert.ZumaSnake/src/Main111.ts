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
    private snake2: Snake;
    private food: Food[];
    private interval: number;
    private moveEvent: egret.TouchEvent;
    private timer: egret.Timer;
    private radius = 10;
    private foodnum = 233;
    public SnakeLength = 5;
    public foodadd = 232;

    public constructor() {
        super();
        this.interval = 120 ;
        this.food = [];
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.createGameScene, this);
    }

    
    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        let socket: SocketIOClient.Socket = io('http://127.0.0.1:2333/');
        let bg: egret.Shape = new egret.Shape();
        bg.graphics.beginFill(0xffccbc);
        bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageWidth);
        bg.graphics.endFill();
        this.addChild(bg);
        this.randomFood();

        this.snake = new Snake();
        this.snake.Create(100 ,100, this.radius, this.SnakeLength);
        this.addChild(this.snake);
        this.snake2 = new Snake();
        this.snake2.Create(500,400,this.radius,this.SnakeLength);
        this.snake2.BodyList[0].x = 100;
        this.snake2.BodyList[0].y = 100;
        for(var i=1;i<=this.snake2.BodyList.length-1;i++) {
            this.snake2.BodyList[i].x = this.snake2.BodyList[i-1].x + 15;
            this.snake2.BodyList[i].y = this.snake2.BodyList[i-1].y + 15;
        }
        this.addChild(this.snake2);

        mouse.enable(this.stage);
        mouse.setMouseMoveEnabled(true);
        this.touchEnabled = true;

        this.addEventListener(mouse.MouseEvent.MOUSE_MOVE, this.OnMove, this);
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.startTouchAccelerate, this);
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.endTouchAccelerate, this);

    }

    private randomFood() {
        for(let i = 0;i < this.foodnum;i++) {
            let foodpoint: Food = new Food();
            foodpoint.GetRandomFood(this.radius);
            this.food.push(foodpoint);
            this.addChild(this.food[i]);
        }
    }
    private addFood() {
        for(let i = this.food.length ;i < this.foodadd;i++) {
            let foodpoint: Food = new Food();
            foodpoint.GetRandomFood(this.radius);
            this.food.push(foodpoint);
            this.addChild(this.food[i]);
        }
    }

    private OnMove(e: egret.TouchEvent) {
        this.moveEvent = e;
        if (this.timer == null){
            this.timer = new egret.Timer(this.interval);
            if (!this.timer.hasEventListener(egret.TimerEvent.TIMER)){
                this.timer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
            }
            this.timer.start();
        }
        if (this.snake.BodyList.length <= 2) {
            this.endTouchAccelerate();
        }
    }

    private onEatFood(i) {
        let ncolor = this.food[i].color;
        this.removeChild(this.food[i]);
        if(this.snake.ColorCount[ncolor.Origin]) {
            this.snake.ColorCount[ncolor.Origin] += this.food[i].intake;
        }
        else {
            this.snake.ColorCount[ncolor.Origin] = this.food[i].intake;
        }
        if(this.snake.ColorCount[ncolor.Origin] >= 15) {
            this.snake.AfetEat(ncolor);
            this.snake.ColorCount[ncolor.Origin] -= 15;
        }
        this.food.splice(i,1);
    }

    private onTimer() {
        if(this.food.length<this.foodadd)
            this.addFood();
        for(var i = 0;i < this.food.length;i++) {
            if(this.hit(this.snake.Head, this.food[i])) {
                this.onEatFood(i);
                break;
            }
        }
        for(var i = 1;i<this.snake2.BodyList.length-1;i++){
            if(this.check(this.snake.Head,this.snake2.BodyList[i],this.snake2.BodyList[i-1],this.snake2.BodyList[i+1]).bool){
                // console.log(i,i+this.check(this.snake.Head,this.snake2.BodyList[i],this.snake2.BodyList[i-1],this.snake2.BodyList[i+1]).sob);
                let xiaobiao = i+this.check(this.snake.Head,this.snake2.BodyList[i],this.snake2.BodyList[i-1],this.snake2.BodyList[i+1]).sob;
                this.caozuo(xiaobiao,this.snake.Head);
             break;
            }
        }
        this.snake.Move(this.moveEvent, this.interval);
    }

    private caozuo(a:number,b:any){
        // console.log(this.snake.Head);
        if(this.snake.bool){
            this.snake2.BodyList.splice(a,0,this.snake.Head);
            this.snake.BodyList.splice(0,1);
            this.snake.bool = false;
            //判断能否能否消除
            let count = 0;
            let stamp = new Array();
            let booms = 0;
            for(var i = 1;i<a;i++) {
                if(this.snake2.BodyList[a-i].Color.Origin == this.snake2.BodyList[a].Color.Origin) 
                    count++;
                    stamp[0] = a - i;
            }
            for(var i = 1;i<=this.snake2.BodyList.length-a-1;i++) {
                if(this.snake2.BodyList[a+i].Color.Origin == this.snake2.BodyList[a].Color.Origin)
                    count++;
                    stamp[1] = a + i;
            }
            if(count>2){
                booms++;
                this.success(this.snake2.BodyList,stamp,booms);
            }
            console.log(this.snake2.BodyList.length,count);
            
        }
        
    }
    private success(body:any,stamps:any,booms:number){
        //先判断能不能连环爆炸
        let count = 0;
        // if(body[stamps[0]-1].Color.Origin == body[stamps[1]+1].Color.Origin) {
        //     count ++;
        // }
        for(var i = 1;i<=stamps[0];i++){
            if(body[stamps[0]-i].Color.Origin == body[stamps[1]+1].Color.Origin){
                count ++;
                stamps[0] = stamps[0] - i;
            }
            else
                break;
        }
        for(var i = 1;i<=body.length-stamps[0]-1;i++){
            if(body[stamps[1]+i].Color.Origin == body[stamps[0]-1].Color.Origin){
                count ++;
                stamps[1] = stamps[1] + i;
            }
            else
                break;
        }
        if(count>2){
            booms++;
            this.success(body,stamps,booms);
        }
        else
            return booms;
        
    }

    private check(a,m,b,c) {
        let dist = (a.x + 100 - m.x - this.snake2.x)*(a.x + 100 - m.x -this.snake2.x)+(a.y + 100 - m.y - this.snake2.y)*(a.y + 100 - m.y -this.snake2.y);
        let l1 = (a.x + 100 - b.x - this.snake2.x)*(a.x + 100 - b.x -this.snake2.x)+(a.y + 100 - b.y - this.snake2.y)*(a.y + 100 - b.y -this.snake2.y);
        let l2 = (a.x + 100 - c.x - this.snake2.x)*(a.x + 100 - c.x -this.snake2.x)+(a.y + 100 - c.y - this.snake2.y)*(a.y + 100 - c.y -this.snake2.y);
        let panduan = Math.min(l1,l2);
        let rfang = 4 * (this.radius + 4) * (this.radius + 4);
        let ans;
        ans = new Object();
        ans.bool = false;
        ans.sob =0;
        if(dist<rfang){
            if(l1<l2){
                ans.bool = true;
                ans.sob = 0;
                return ans;
            }
            else{
                ans.bool = true;
                ans.sob = 1;
                return ans;
            }
        }
        else
            ans.bool = false;
            return ans;
    }
    private hit(a, b) {
        return (new egret.Rectangle(a.x + this.snake.x - this.radius, a.y + this.snake.y - this.radius, a.width, a.height))
            .intersects(new egret.Rectangle(b.x,b.y,b.width,b.height));
    }

    private startTouchAccelerate() {
        if(this.snake.BodyList.length > 2){
            this.timer.delay = 70;
            this.interval = 70;
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
			
			if(this.snake.BodyList.length > 2 && this.snake.count%100 === 0) {
				var last_body = this.snake.BodyList[this.snake.BodyList.length - 1];
				this.snake.BodyList.splice(-1, 1);
				var animate: egret.Tween = egret.Tween.get(last_body);
				animate.to({scaleX: 0.01, scaleY: 0.01,alaph: 0}, 400, egret.Ease.circOut);
				var time = egret.setTimeout(function() {
					this.snake.removeChild(last_body);
				}, this, 500);
				this.BodytoFood(last_body, last_body.Color);
				this.snake.count = 0;
                this.snake.AccelerateTimer.reset();
                this.snake.AccelerateTimer.start();
			}
		}, this);
		this.snake.AccelerateTimer.start();
	}

    private stopAccelerate() {
		this.snake.AccelerateTimer.stop();
	}

    private BodytoFood(bodypoint: egret.Shape, bodycolor: Color) {
		let food: Food;
		for (var i = 0; i < 5; i++) {
			food = new Food();
			food.CreateAccelerate(bodypoint.x+this.snake.x, bodypoint.y+this.snake.y, this.radius, bodycolor);		
			this.addChild(food);
            this.setChildIndex(food,1);
            this.food.push(food);
			var animate: egret.Tween = egret.Tween.get(food);
			var randomAngle = Math.random()*(Math.PI);
            var randomLength = Math.random()*70;
			animate.to({
				x: this.snake.x+bodypoint.x + randomLength*Math.cos(randomAngle), 
				y: this.snake.y+bodypoint.y + randomLength*Math.sin(randomAngle)
			}, 500, egret.Ease.circOut);
		}
	}
}


