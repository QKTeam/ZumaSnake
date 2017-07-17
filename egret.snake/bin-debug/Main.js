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
var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        _this.radius = 20;
        _this.interval = 5;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.createGameScene, _this);
        return _this;
    }
    /**
     * 创建游戏场景
     * Create a game scene
     */
    Main.prototype.createGameScene = function () {
        var bg = new egret.Shape();
        bg.graphics.beginFill(0xffffff);
        bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageWidth);
        bg.graphics.endFill();
        this.addChild(bg);
        this.randomFood();
        this.snake = new Snake(100, 100, 20, 20);
        this.addChild(this.snake);
        mouse.enable(this.stage);
        mouse.setMouseMoveEnabled(true);
        this.touchEnabled = true;
        this.addEventListener(mouse.MouseEvent.MOUSE_MOVE, this.move, this);
    };
    Main.prototype.move = function (e) {
        this.moveEvent = e;
        if (this.timer == null) {
            this.timer = new egret.Timer(this.interval);
            this.timer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
            this.timer.start();
        }
    };
    Main.prototype.onEat = function () {
        this.removeChild(this.food);
        this.snake.afterEat(this.food.colornum);
        this.randomFood();
    };
    Main.prototype.onTimer = function () {
        if (this.hit(this.snake.head, this.food))
            this.onEat();
        this.snake.Move(this.moveEvent, this.interval);
    };
    Main.prototype.randomFood = function () {
        var tmpx = Math.random() * (this.stage.stageWidth - this.radius * 2);
        var tmpy = Math.random() * (this.stage.stageHeight - this.radius * 2);
        this.food = new Food(tmpx, tmpy, this.radius);
        this.addChild(this.food);
    };
    Main.prototype.hit = function (a, b) {
        return (new egret.Rectangle(a.x + this.snake.x, a.y + this.snake.y, a.width, a.height))
            .intersects(new egret.Rectangle(b.x, b.y, b.width, b.height));
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
//# sourceMappingURL=Main.js.map