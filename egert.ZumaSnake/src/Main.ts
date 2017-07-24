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
    private otherSnakes: {};
    private food: Food[];
    private interval: number;
    private moveEvent: egret.TouchEvent;
    private timer: egret.Timer;
    private radius = 10;
    private foodnum = 233;
    public SnakeLength = 50;
    public foodadd = 10;
    private socket: SocketIOClient.Socket;
    private GetMoveTimer: egret.Timer;
    private SnakeLineWidth = 4;
    public BackGround: egret.Sprite;
    private BackGroundWidth: number;
    private BcakGroundHeight: number;
    private LittleMap: LittleMap;
    private RankList: RankList;
    private RankListWidth: number;
    private RankListHeight: number;

    public constructor() {
        super();
        this.interval = 100 ;
        this.BackGroundWidth = 5000;
        this.BcakGroundHeight = 3000;
        this.RankListWidth = 300;
        this.RankListHeight = 400;
        this.food = [];
        this.otherSnakes = {};
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.createGameScene, this);
    }

    private GiveSnake(snake: Snake) {
        this.snake = snake;
    }

    private GiveStage() {
        return this;
    }
    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        this.stage.scaleMode = egret.StageScaleMode.FIXED_WIDTH;
        this.BackGround = new egret.Sprite();
        this.BackGround.width = this.BackGroundWidth;
        this.BackGround.height = this.BcakGroundHeight;

        

        this.socket = io('http://' + window.location.hostname + ':2222/');
        let bg: egret.Shape = new egret.Shape();
        bg.graphics.beginFill(0xffccbc);
        bg.graphics.drawRect(0, 0, this.BackGround.width, this.BackGround.height);
        bg.graphics.endFill();
        this.BackGround.addChild(bg);


        // let snake = this.snake;
        let stage = this;

        this.socket.emit('join');
        this.socket.on('create', function(NewSnake) {
            var SnakeInfo = JSON.parse(NewSnake);
            GiveSnakeToStage(SnakeInfo);
            stage.BackGround.x = - (stage.snake.Head.x + stage.snake.x) + stage.stage.stageWidth/2;
            stage.BackGround.y = - (stage.snake.Head.y + stage.snake.y) + stage.stage.stageHeight/2;
            stage.addChild(stage.BackGround);
            stage.LittleMap = new LittleMap(stage.BackGround.width, stage.BackGround.height, 5, 0.1);
            stage.addChild(stage.LittleMap);
            stage.LittleMap.anchorOffsetX = stage.LittleMap.width;
            stage.LittleMap.x = stage.stage.stageWidth - 10;
            stage.LittleMap.y = 10;
            stage.setChildIndex(stage.LittleMap, -999);
            stage.RankList = new RankList(stage.RankListWidth, stage.RankListHeight);
            stage.addChild(stage.RankList);
            stage.RankList.x = 10;
            stage.RankList.y = 10;
            stage.setChildIndex(stage.RankList, -999);
        });
        
        function GiveSnakeToStage(SnakeInfo) {
            stage.snake = new Snake();
            stage.snake.Create(SnakeInfo);
            stage.BackGround.addChild(stage.snake);
        }
        this.socket.on('other_join', function(data) {
            let snake_info: any = JSON.parse(data);
            let Osnake: Snake = new Snake();
            Osnake.CreatOther(snake_info);
            stage.otherSnakes[snake_info.id] = Osnake;
            stage.BackGround.addChild(Osnake);
            stage.BackGround.setChildIndex(Osnake,1);      
        });

        this.socket.on('allfood', function(data) {
            let food_info: Array<any> = JSON.parse(data);
            food_info.forEach(food => {
                let newFood: Food = new Food();
                newFood.CreateFood(stage.radius, food.x, food.y, food.color, food.id, food.intake);
                stage.BackGround.addChild(newFood);
                stage.BackGround.setChildIndex(newFood, 1);
                stage.food.push(newFood);
            });
        });
        this.socket.on('other_eat', function(id, snake_id) {
            let food_info = stage.GetFoodByID(id);
            if (food_info != null){
                let ToX = stage.otherSnakes[snake_id].x + stage.otherSnakes[snake_id].Head.x;
                let ToY = stage.otherSnakes[snake_id].y + stage.otherSnakes[snake_id].Head.y;
                let animate = egret.Tween.get(food_info[1]);
                animate.to({x: ToX, y: ToY}, 100);
                egret.setTimeout(function () {
                    stage.BackGround.removeChild(food_info[1]);
                }, this, 100)
                stage.food.splice(food_info[0], 1);
            }
        });

        this.socket.on('other_snake', function(data) {
            let snakes: Array<any> = JSON.parse(data);
            snakes.forEach(snake => {
                let Osnake: Snake = new Snake();
                Osnake.CreatOther(snake);
                stage.otherSnakes[snake.id] = Osnake;
                stage.BackGround.addChild(Osnake);
                stage.BackGround.setChildIndex(Osnake,1);
            });  
        });

        this.socket.on('disconnect', function(id) {
            if(stage.otherSnakes[id] !== undefined){
                stage.otherSnakes[id].RemoveSnake();
                stage.LittleMap.RemovePoint(id, 80);
                var delay = setTimeout(function() {
                    stage.BackGround.removeChild(stage.otherSnakes[id]);
                    delete stage.otherSnakes[id];
                }, 300);
            }
        });

        this.socket.on('AnimateAddFood', function(data, islocal, id, bodyid) {
            let addfood: Array<any> = JSON.parse(data);
            if (islocal === "true") {
                var find = stage.GetBodyPointByID(bodyid, stage.snake);              
                if(find !== null){
                    var last_body = find[1];
                    stage.snake.BodyList.splice(find[0], 1);
                    var animate: egret.Tween = egret.Tween.get(last_body);
                    animate.to({scaleX: 0.01, scaleY: 0.01,alaph: 0}, 400, egret.Ease.circOut);
                    var time = egret.setTimeout(function() {
                        stage.snake.removeChild(last_body);
                    }, stage, 500);
                }
            }
            else {
                let findsnake = stage.otherSnakes[id];
                if(findsnake !== undefined){
                    var find = stage.GetBodyPointByID(bodyid, findsnake);
                    if (find !== null) {
                        var last_body = find[1];
                        findsnake.BodyList.splice(find[0], 1);
                        var animate: egret.Tween = egret.Tween.get(last_body);
                        animate.to({scaleX: 0.01, scaleY: 0.01,alaph: 0}, 400, egret.Ease.circOut);
                        var time = egret.setTimeout(function() {
                            findsnake.removeChild(last_body);
                        }, stage, 500);
                    }
                }
            }
            addfood.forEach(food => {
                if (!(food.x <= 0 || food.y <= 0 || food.x >= stage.BackGround.width || food.y >= stage.BackGround.height))
                stage.BodytoFood(food.fromX, food.fromY, food.x, food.y, food.intake, food.color, food.id);
            });
        });

        this.socket.on('move', function(data) {
            let snake_info: any = JSON.parse(data);
            let findsnake = stage.otherSnakes[snake_info.id];
            if(findsnake !== undefined){
                findsnake.OtherMove(snake_info, 80);
                let info = {
                    x: snake_info.body[0].x + findsnake.x,
                    y: snake_info.body[0].y + findsnake.y,
                    id: snake_info.id,
                    mine: false,
                }
                stage.LittleMap.addSnakeOrModify(info, 80);
            }
        });

        this.socket.on('own_add_point', function(data, food_id) {
            var color_info = JSON.parse(data);
            stage.snake.AfterEat(color_info, food_id);
        });

        this.socket.on('other_add_point', function(id, data, food_id) {
            var color_info = JSON.parse(data)
            let findsnake = stage.otherSnakes[id];
            if (findsnake !== undefined) {
                findsnake.AfterEat(color_info, food_id);
            }
        });

        this.socket.on('add_food_for_num', function(data){
            let infos = JSON.parse(data);
            infos.forEach(food => {
                let newFood: Food = new Food();
                newFood.CreateFood(stage.radius, food.x, food.y, food.color, food.id, food.intake);
                stage.BackGround.addChild(newFood);
                stage.BackGround.setChildIndex(newFood, 1);
                stage.food.push(newFood);
            });
        });


        this.GetMoveTimer = new egret.Timer(80);
        this.GetMoveTimer.addEventListener(egret.TimerEvent.TIMER, this.GetOtherMove, this);
        this.GetMoveTimer.start();

        mouse.enable(this.stage);
        mouse.setMouseMoveEnabled(true);
        this.BackGround.touchEnabled = true;

        this.BackGround.addEventListener(mouse.MouseEvent.MOUSE_MOVE, this.OnMove, this);
        this.BackGround.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.startTouchAccelerate, this);
        this.BackGround.addEventListener(egret.TouchEvent.TOUCH_END, this.endTouchAccelerate, this);
    }
    private GetOtherMove() {
        let move_info: Array<Object> = [];
        if (this.snake !== undefined){
            for (var i = 0; i < this.snake.BodyList.length; i++) {
                let single_object;
                let getcolor = new Color();
                single_object = {
                    id: this.snake.BodyList[i].id,
                    x: this.snake.BodyList[i].x,
                    y: this.snake.BodyList[i].y,
                    color: getcolor.OriginColor.indexOf(this.snake.BodyList[i].Color.Origin)
                }
                move_info.push(single_object);
            }
            this.socket.emit('move',JSON.stringify(move_info), this.snake.id);
            let info = {
                id: this.snake.id,
                x: this.snake.BodyList[0].x + this.snake.x,
                y: this.snake.BodyList[0].y + this.snake.y,
                mine: true
            }
            
            this.LittleMap.addSnakeOrModify(info, 80);

            let RankInfo= [
                {
                    playercode: this.snake.playercode,
                    length: this.snake.BodyList.length,
                    mine: true
                }
            ]
            for (var key in this.otherSnakes) {
                let singleInfo ;
                singleInfo = {
                    playercode: this.otherSnakes[key].playercode,
                    length: this.otherSnakes[key].BodyList.length,
                    mine: false
                };
                RankInfo.push(singleInfo);
            }
            this.RankList.Manager(RankInfo);
        }
    }
    private randomFood() {
        for(let i = 0;i < this.foodnum;i++) {
            let foodpoint: Food = new Food();
            foodpoint.GetRandomFood(this.radius);
            this.food.push(foodpoint);
            this.BackGround.addChild(this.food[i]);
        }
    }
    private addFood() {
        for(let i = this.food.length ;i < this.foodadd;i++) {
            let foodpoint: Food = new Food();
            foodpoint.GetRandomFood(this.radius);
            this.food.push(foodpoint);
            this.BackGround.addChild(this.food[i]);
        }
    }

    private OnMove(e: egret.TouchEvent) {
        if (this.snake !== undefined){
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
    }

    private onEatFood(i) {
        let ncolor = this.food[i].color;
        let foodRemove = this.food[i];
        let animate = egret.Tween.get(this.food[i]);
        animate.to({
            x: this.snake.x + this.snake.Head.x,
            y: this.snake.y + this.snake.Head.y
        }, 100);
        egret.setTimeout(function() {
             this.BackGround.removeChild(foodRemove);
        }, this, 100);
        let removeid: string;
        removeid = this.food[i].id;
        this.socket.emit('eatfood',removeid);
        if(this.snake.ColorCount[ncolor.Origin]) {
            this.snake.ColorCount[ncolor.Origin] += this.food[i].intake;
        }
        else {
            this.snake.ColorCount[ncolor.Origin] = this.food[i].intake;
        }
        if(this.snake.ColorCount[ncolor.Origin] >= 15) {
            var color_info = {
                Ocolor: this.food[i].color.Origin,
                Bcolor: this.food[i].color.Bright
            }
            this.socket.emit("afterEat",this.snake.id, JSON.stringify(color_info));
            this.snake.ColorCount[ncolor.Origin] -= 15;
        }
        this.food.splice(i,1);
    }

    private onTimer() {
        // if(this.food.length<this.foodadd)
        //     this.addFood();
        for(var i = 0;i < this.food.length;i++) {
            if(this.hit(this.snake.Head, this.food[i])) {
                this.onEatFood(i);
                break;
            }
        }
        let headX = this.snake.Head.x;
        let headY = this.snake.Head.y;
        let BGX = this.BackGround.x;
        let BGY = this.BackGround.y;
        let target = this.snake.Move(this.moveEvent, BGX, BGY, this.BackGroundWidth, this.BcakGroundHeight, this.interval);
        
        if (target !== null) {
            let animateBG = egret.Tween.get(this.BackGround);
                animateBG.to({
                    x: this.BackGround.x - (target.x - headX),
                    y: this.BackGround.y - (target.y - headY)
                }, this.interval);
        }
        
        // //蛇碰撞
        // for(var key in this.otherSnakes) {
        //     let flag = 0;
        //     for(var j = 0; j < this.otherSnakes[key].BodyList.length; j++) {
        //         let head = this.snake.Head;
        //         //蛇头
        //         if(j === 0) {
        //             continue;
        //         }
        //         else if(j > 0 && j < this.otherSnakes[key].BodyList.length - 1) {
        //             let Mbody = this.otherSnakes[key].BodyList[j];
        //             let Lbody = this.otherSnakes[key].BodyList[j-1];
        //             let Rbody = this.otherSnakes[key].BodyList[j+1];
        //             //返回插入位置
        //             if(this.snakeHitCheck(head, Mbody, Lbody, Rbody, key, j).bool) {
        //                 let insertPos = j + this.snakeHitCheck(head, Mbody, Lbody, Rbody, key, j).nvalue;
        //                 this.snakeInsert(insertPos, head, key);
        //                 flag = 1;
        //                 break;
        //             }
        //         }
        //         //蛇尾
        //         else if(j === this.otherSnakes[key].BodyList.length - 1) {
        //             this.snakeInsert(j, head, key);
        //             flag = 1;
        //         }
        //     }
        //     if(flag === 1) break;
        // }
    }

    /**
     * 蛇碰撞插入
     */
    private snakeInsert(pos: number, head: any, key: any) {
        this.otherSnakes[key].BodyList.splice(pos, 0, head);
        this.snake.BodyList.splice(0, 1);
        this.ZumaRemove(pos, key);
    }

    /**
     * 蛇身消除判断
     */
    private ZumaRemove(pos: number, key) {
        let count = 1;
        let stamp = 0;
        let FlagColor = this.otherSnakes[key].BodyList[pos].Color.Origin;
        for(var j = pos - 1; j > 1; j--) {
            if(this.otherSnakes[key].BodyList[j].Color.Origin === FlagColor) {
                count++;
                stamp = j;
            }
            else break;
        }
        for(var k = pos + 1; k < this.otherSnakes[key].BodyList.length; k++) {
            if(this.otherSnakes[key].BodyList[k].Color.Origin === FlagColor) {
                count++;
            }
            else break;
        }
        //消除三个以上相同颜色蛇身
        if(count > 2) {
            for(var j = stamp; j < stamp + count; j++) {
                this.BackGround.removeChild(this.otherSnakes[key].BodyList[j]);
            }
            this.otherSnakes[key].BodyList.splice(stamp, count);
            this.ZumaRemove(stamp, key);//递归消除
        }
        else return;//递归结束
    }

    private hit(a, b) {
        if ((a.x + this.snake.x - b.x)*(a.x + this.snake.x - b.x) + (a.y + this.snake.y - b.y)*(a.y + this.snake.y - b.y) < 10 * this.radius * this.radius){
            return true;
        }
        else {
            return false;
        }
        // return (new egret.Rectangle(a.x + this.snake.x - this.radius, a.y + this.snake.y - this.radius, a.width, a.height))
        //     .intersects(new egret.Rectangle(b.x,b.y,b.width,b.height));
    }

    /**
     * 蛇碰撞检查
     */
    private snakeHitCheck(a, M, L, R, key, j) {
        let rsquare = 4 * (this.radius + this.SnakeLineWidth) * (this.radius + this.SnakeLineWidth);
        let Mdx = (a.x + this.snake.x - M.x - this.otherSnakes[key].BodyList[j].x);
        let Mdy = (a.y + this.snake.y - M.y - this.otherSnakes[key].BodyList[j].y);
        let Mdist = Mdx*Mdx + Mdy*Mdy;
        let judge;
        judge = new Object();
        judge.bool = false;
        judge.nvalue = 0;
        
        //碰撞触发
        if(Mdist <= rsquare) {
            let Ldx = (a.x + this.snake.x - L.x - this.otherSnakes[key].BodyList[j].x);
            let Ldy = (a.y + this.snake.y - L.y - this.otherSnakes[key].BodyList[j].y);
            let Rdx = (a.x + this.snake.x - R.x - this.otherSnakes[key].BodyList[j].x);
            let Rdy = (a.y + this.snake.y - R.y - this.otherSnakes[key].BodyList[j].y);
            let Ldist = Ldx*Ldx + Ldy*Ldy;
            let Rdist = Rdx*Rdx + Rdy*Rdy;
            if(Ldist < Rdist) {
                judge.bool = true;
                judge.nvalue = 0;
            }
            else {
                judge.bool = true;
                judge.nvalue = 1;
            }
        }
        else {
            judge.bool = false;
        }
        return judge;
    }

    private startTouchAccelerate() {
        if (this.snake !== undefined){
            if(this.snake.BodyList.length > 2){
                this.timer.delay = 50;
                this.interval = 50;
                this.startAccelerate();
            }
        }
    }

    private endTouchAccelerate() {
        if (this.snake !== undefined){
            this.timer.delay = 100;
            this.interval = 100;
            this.stopAccelerate();
        }
    }

    private IfDropBody() {
        this.snake.count++;
        if(this.snake.BodyList.length <= 2) {
            // if (this.snake.AccelerateTimer !== null){
            //     this.snake.AccelerateTimer.stop();
            //     this.snake.AccelerateTimer.removeEventListener(egret.TimerEvent.TIMER, this.IfDropBody, this);
            // }
            this.endTouchAccelerate();
        }
        if(this.snake.BodyList.length > 2 && this.snake.count%100 === 0) {
            var last_body = this.snake.BodyList[this.snake.BodyList.length - 1];
            var drop_body = {
                id: last_body.id,
                x: last_body.x + this.snake.x,
                y: last_body.y + this.snake.y,
                color: last_body.Color.OriginColor.indexOf(last_body.Color.Origin)
            }
            this.socket.emit('Drop', JSON.stringify(drop_body));
            this.snake.count = 0;
        }
    }

    private startAccelerate() {
        if (this.snake.AccelerateTimer === undefined){
            this.snake.AccelerateTimer = new egret.Timer(30);
        }
        this.snake.AccelerateTimer.addEventListener(egret.TimerEvent.TIMER, this.IfDropBody, this);
		this.snake.AccelerateTimer.start();
	}

    private stopAccelerate() {
        if(this.snake.AccelerateTimer !== null) {
            if(this.snake.AccelerateTimer.hasEventListener(egret.TimerEvent.TIMER)){
                this.snake.AccelerateTimer.stop();
                this.snake.AccelerateTimer.removeEventListener(egret.TimerEvent.TIMER, this.IfDropBody, this);
            }
        }
	}

    private BodytoFood(fromX: number, fromY: number, x: number, y: number, intake: number, color: number, foodid: string) {
		let food: Food;
        food = new Food();
        food.CreateFood(this.radius, fromX, fromY, color, foodid, intake);		
        this.BackGround.addChild(food);
        this.BackGround.setChildIndex(food,1);
        this.food.push(food);
        var animate: egret.Tween = egret.Tween.get(food);
        animate.to({
            x: x, 
            y: y
        }, 500, egret.Ease.circOut);
	}

    private GetFoodByID(id :string): Array<any> {
        for (var i = 0; i < this.food.length; i++) {
            if (this.food[i].id === id) {
                var info = [];
                info[0] = i;
                info[1] = this.food[i];
                return info;
            }
        }
        return null;
    }

    private GetBodyPointByID(bodyid: string, snake: Snake) {
        for (var i = 0; i < snake.BodyList.length; i++) {
            if (snake.BodyList[i].id === bodyid) {
                var info = [];
                info[0] = i;
                info[1] = snake.BodyList[i];
                return info;
            }
        }
        return null;
    }
}
