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
    private food: Food;
    private color: Color;
    private radius = 20;

    public constructor() {
        super();
        this.interval = 200 ;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.createGameScene, this);
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


        this.snake = new Snake(100 ,100, 20, 50);
        this.addChild(this.snake);

        mouse.enable(this.stage);
        mouse.setMouseMoveEnabled(true);
        this.touchEnabled = true;
        this.addEventListener(mouse.MouseEvent.MOUSE_MOVE, this.move, this);
        //this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchAccelerate, this);
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchAccelerate, this);
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.endTouchAccelerate, this);
    }
    
    private move(e: egret.TouchEvent) {
        this.moveEvent = e;
        if (this.timer == null){
            this.timer = new egret.Timer(this.interval);
            this.timer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
            this.timer.start();
        }
    }

    

    private onEat() {
        this.removeChild(this.food);
        this.snake.afterEat(this.food.colornum);
        this.randomFood();
    }

    private onTimer() {
        if(this.hit(this.snake.head,this.food))
            this.onEat();
        this.snake.Move(this.moveEvent, this.interval);
    }
    private randomFood() {
        var tmpx = Math.random() * (this.stage.stageWidth - this.radius * 2);
        var tmpy = Math.random() * (this.stage.stageHeight - this.radius * 2);
        this.food = new Food(tmpx,tmpy,this.radius);
        this.addChild(this.food);
    }
    private hit(a, b) {
        return (new egret.Rectangle(a.x + this.snake.x,a.y + this.snake.y,a.width,a.height))
            .intersects(new egret.Rectangle(b.x,b.y,b.width,b.height));
    }

    private onTouchAccelerate(e: egret.TouchEvent) {
        this.interval = 80;
        this.timer.removeEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
        this.timer = null;
        this.removeEventListener(mouse.MouseEvent.MOUSE_MOVE, this.move, this)
        this.moveEvent = e;
        if (this.timer == null){
            this.timer = new egret.Timer(this.interval);
            this.timer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
            this.timer.start();
        }
        //this.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchAccelerate, this);
        // if (this.TimerForAccelerate == null) {
            //this.TimerForAccelerate = new egret.Timer(5000,1);
            //this.TimerForAccelerate.addEventListener(egret.TimerEvent.TIMER_COMPLETE, function() {
                // this.interval = 200;
                // this.timer.removeEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
                // this.timer = null;
                
                
                // this.TimerForAccelerate.stop();
                // this.TimerForAccelerate = null;
            //}, this);
            //this.TimerForAccelerate.start();
        // }
    }

    private endTouchAccelerate() {
        this.interval = 200;
        this.timer.removeEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
        this.timer = null;
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchAccelerate, this);
        this.addEventListener(mouse.MouseEvent.MOUSE_MOVE, this.move, this);
    }

    // private SetAccelerateListener() {
        //this.TimerForAccelerateListener = new egret.Timer(10000,1);
       // this.TimerForAccelerateListener.addEventListener(egret.TimerEvent.TIMER_COMPLETE,function() {
            
       // }, this);
        //this.TimerForAccelerateListener.start();
    // }
}


