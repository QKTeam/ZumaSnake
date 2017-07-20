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
    private food: Food[];
    private interval: number;
    private moveEvent: egret.TouchEvent;
    private timer: egret.Timer;
    private radius = 20;
    private foodnum = 40;
    public SnakeLength = 5;

    public constructor() {
        super();
        this.interval = 150 ;
        this.food = [];
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.createGameScene, this);
    }

    
    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {

        let socket: SocketIOClient.Socket = io();
        let bg: egret.Shape = new egret.Shape();
        bg.graphics.beginFill(0xffccbc);
        bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageWidth);
        bg.graphics.endFill();
        this.addChild(bg);
        this.randomFood();

        this.snake = new Snake();
        this.snake.Create(100 ,100, this.radius, this.SnakeLength);
        this.addChild(this.snake);

        mouse.enable(this.stage);
        mouse.setMouseMoveEnabled(true);
        this.touchEnabled = true;
        this.addEventListener(mouse.MouseEvent.MOUSE_MOVE, this.move, this);
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
            this.snake.ColorCount[ncolor.Origin] ++;
        }
        else {
            this.snake.ColorCount[ncolor.Origin] = 1;
        }
        this.food.splice(i,1);
    }

    private onTimer() {
        for(var i = 0;i < this.food.length;i++) {
            if(this.hit(this.snake.Head, this.food[i])) {
                this.onEatFood(i);
                break;
            }
        }
    }

    private hit(a, b) {
        return (new egret.Rectangle(a.x + this.snake.x - this.radius, a.y + this.snake.y - this.radius, a.width, a.height))
            .intersects(new egret.Rectangle(b.x,b.y,b.width,b.height));
    }
}


