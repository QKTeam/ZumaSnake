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
    private moveEvent: egret.TouchEvent;
    private interval: number;

    public constructor() {
        super();
        this.interval = 50 ;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.createGameScene, this);
    }

   
    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {

        var bg: egret.Shape = new egret.Shape();
		bg.graphics.beginFill(0xffffff);
		bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageWidth);
		bg.graphics.endFill();
		this.addChild(bg);


        this.snake = new Snake(100 ,100, 20, 20);
        this.addChild(this.snake);

        mouse.enable(this.stage);
        mouse.setMouseMoveEnabled(true);
        this.touchEnabled = true;
        this.addEventListener(mouse.MouseEvent.MOUSE_MOVE, this.move, this);
    }
    
    private move(e: egret.TouchEvent) {
        this.moveEvent = e;
        if (this.timer == null){
            this.timer = new egret.Timer(this.interval);
        this.timer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
        this.timer.start();
        }
    }
    private onTimer() {
        this.snake.Move(this.moveEvent, this.interval);
    }

    
}


