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
    private BackGroundHeight: number;
    private LittleMap: LittleMap;
    private RankList: RankList;
    private RankListWidth: number;
    private RankListHeight: number;
    private HitFlag: boolean;

    public constructor() {
        super();
        this.HitFlag = false;
        this.interval = 100 ;
        this.BackGroundWidth = 5000;
        this.BackGroundHeight = 3000;
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
        this.BackGround.height = this.BackGroundHeight;


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
            stage.LittleMap.x = stage.stage.stageWidth - 40;
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
            stage.BackGround.setChildIndex(stage.snake, -999);
        }
        this.socket.on('other_join', function(data) {
            let snake_info: any = JSON.parse(data);
            let Osnake: Snake = new Snake();
            Osnake.CreatOther(snake_info);
            stage.otherSnakes[snake_info.id] = Osnake;
            stage.BackGround.addChild(Osnake);
            stage.BackGround.setChildIndex(Osnake,-999);      
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
        this.socket.on('other_eat', function(id, snake_id, colorcount) {
            let food_info = stage.GetFoodByID(id);
            if (food_info != null){
                stage.otherSnakes[snake_id].ColorCount = JSON.parse(colorcount);
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
                stage.BackGround.setChildIndex(Osnake,-999);
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

        this.socket.on('rebirth',function(id,newX,newY,newColorinfo,num,addpointinfo) {
            console.log(id);
            
            let newColor = JSON.parse(newColorinfo);
            let addpoint = JSON.parse(addpointinfo);
            if(stage.snake.id === id){
                for (var i = 0; i < stage.snake.BodyList.length; i++) {
                    for (var j = 0 ; j < 3; j++) {
                        let fromX = stage.snake.BodyList[i].x + stage.snake.x;
                        let fromY = stage.snake.BodyList[i].y + stage.snake.y;
                        var randomAngle = Math.random()*(Math.PI);
                        var randomLength = Math.random()*70;
                        let toX = fromX + randomLength*Math.cos(randomAngle);
                        let toY = fromY + randomLength*Math.sin(randomAngle);
                        let item = stage.CreateParticle(fromX, fromY, toX, toY, newX, newY);
                    }
                }
                egret.Tween.removeTweens(stage.BackGround);
                let animate = egret.Tween.get(stage.BackGround);
                animate.to({
                    x: - (newX) + stage.stage.stageWidth/2,
                    y: - (newY) + stage.stage.stageHeight/2
                }, 4000);
                stage.snake.removeChildren();
                if (num > 0) {
                    let textTip = new RemoveTips();
                    textTip.Create(num);
                    textTip.textTips.width = stage.stage.stageWidth;
                    textTip.anchorOffsetX = textTip.width/2;
                    textTip.anchorOffsetY = textTip.height/2;
                    textTip.x = stage.stage.stageWidth/2;
                    textTip.y = stage.stage.stageHeight/2 - 200;
                    stage.addChild(textTip);
                    stage.setChildIndex(textTip, -999);
                    setTimeout(function() {
                        stage.removeChild(textTip);
                    }, 100 * num + 2000);
                }
                //stage.BackGround.removeChild(stage.snake);
                setTimeout(function(){
                    stage.snake.ReDraw(newX,newY,newColor);
                    stage.snake.AddPoint(addpoint);
                    //stage.BackGround.addChild(stage.snake);
                }, 4000);
            }
            else{
                for (var i = 0; i < stage.otherSnakes[id].BodyList.length; i++) {
                    for (var j = 0 ; j < 3; j++) {
                        let fromX = stage.otherSnakes[id].BodyList[i].x + stage.otherSnakes[id].x;
                        let fromY = stage.otherSnakes[id].BodyList[i].y + stage.otherSnakes[id].y;
                        var randomAngle = Math.random()*(Math.PI);
                        var randomLength = Math.random()*70;
                        let toX = fromX + randomLength*Math.cos(randomAngle);
                        let toY = fromY + randomLength*Math.sin(randomAngle);
                        let item = stage.CreateParticle(fromX, fromY, toX, toY, newX, newY);
                    }
                }
                let OtherSnakeRebirth = stage.otherSnakes[id];
                stage.otherSnakes[id].removeChildren();
                //stage.BackGround.removeChild(stage.otherSnakes[id]);
                // delete stage.otherSnakes[id];
                setTimeout(function(){
                    // stage.otherSnakes[id] = OtherSnakeRebirth;
                    stage.otherSnakes[id].ReDraw(newX,newY,newColor);
                    stage.otherSnakes[id].AddPoint(addpoint);
                    //stage.BackGround.addChild(stage.otherSnakes[id]);
                }, 4000);
            }
                
        });

        this.socket.on('AnimateAddFood', function(data, islocal, id, bodyid) {
            let addfood: Array<any> = JSON.parse(data);
            if (islocal === "true") {
                stage.DropBodyPoint(bodyid, stage.snake);   
            }
            else {
                let findsnake = stage.otherSnakes[id];
                if(findsnake !== undefined){
                    stage.DropBodyPoint(bodyid, findsnake);
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


        /**
         * 碰撞插入其他蛇处理
         */
        this.socket.on('insert_pas',function(data) {
            // {actid, pasid, pos, insertx, inserty, insertBcolor, insertOcolor}
            let findsnakePas: Snake;
            let findsnakeAct: Snake;
            let insertData = JSON.parse(data);
            let head: BodyPoint;
            let point: BodyPoint;
            let pasid = insertData.pasid;
            findsnakeAct = stage.otherSnakes[insertData.actid];
            findsnakeAct.bool = false;
            head = findsnakeAct.Head;
            console.log(findsnakeAct.id, findsnakeAct.bool);
            

            if (stage.snake.id === pasid) {
                findsnakeAct.removeChild(head);
                findsnakeAct.BodyList.splice(0, 1);
                findsnakeAct.headChange();
                stage.snake.addSinglePoint(head, insertData.pos, insertData.insertx, insertData.inserty, insertData.insertBcolor, insertData.insertOcolor);   
            }
            else {
                findsnakePas = stage.otherSnakes[pasid];
                if(findsnakePas !== undefined) {
                    findsnakeAct.removeChild(head);
                    findsnakeAct.BodyList.splice(0, 1);
                    findsnakeAct.headChange();
                    findsnakePas.addSinglePoint(head, insertData.pos, insertData.x, insertData.y, insertData.Bcolor, insertData.Ocolor);
                }
            }
        });

        /**
         * 祖玛消除其他蛇操作
         */
        this.socket.on('other_ZumaRemove', function(removeinfor) {
            // {id, datum[]{size, head, last, judge, particle[{x,y}...]}}
            let removeData;
            removeData = new Object();
            removeData = JSON.parse(removeinfor);
            
            
            let id = removeData.id;
            let dataLength = removeData.datum.length;
            
            if(stage.snake.id === id) {
                for(var i = 0; i < dataLength; i++) {
                    
                    stage.snake.otherZumaRemove(removeData.datum[i].head, removeData.datum[i].last);
                    // removeData.datum[i].particle.forEach(part => {
                    //     stage.CreateParticle(part.fromX, part.fromY, part.toX, part.toY);
                    // });
                }
            }
            else {
                let findsnake = stage.otherSnakes[id];
                if(findsnake !== undefined) {
                    for(var i = 0; i < dataLength - 1; i++) {
                        findsnake.otherZumaRemove(removeData.datum[i].head, removeData.datum[i].last);
                        // removeData.datum[i].particle.forEach(part => {
                        //     stage.CreateParticle(part.fromX, part.fromY, part.toX, part.toY);
                        // });
                    }
                }
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
            let score = 0;
            for (var key in this.snake.ColorCount) {
                score += this.snake.ColorCount[key];
            }
            let RankInfo= [
                {
                    playercode: this.snake.playercode,
                    length: this.snake.BodyList.length * 15 + score,
                    mine: true
                }
            ];
            for (var key in this.otherSnakes) {
                score = 0;
                let colorcount = this.otherSnakes[key].ColorCount;
                
                for (var other_key in colorcount) {
                    score += colorcount[other_key];
                }
                let singleInfo ;
                singleInfo = {
                    playercode: this.otherSnakes[key].playercode,
                    length: this.otherSnakes[key].BodyList.length * 15 + score,
                    mine: false
                };
                RankInfo.push(singleInfo);
            }
            this.RankList.Manager(RankInfo);
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
        this.socket.emit('eatfood',removeid, JSON.stringify(this.snake.ColorCount));
    }

    private onTimer() {
        if (this.snake.BodyList.length <= 2) {
            this.snake.bool = false;
            this.HitFlag = true;
        }
        else if (this.HitFlag === true) {
            this.snake.bool = true;
            this.HitFlag = false;
        }
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
        let target = this.snake.Move(this.moveEvent, BGX, BGY, this.BackGroundWidth, this.BackGroundHeight, this.interval);
        
        if (target !== null) {
            let animateBG = egret.Tween.get(this.BackGround);
            animateBG.to({
                x: this.BackGround.x - (target.x - headX),
                y: this.BackGround.y - (target.y - headY)
            }, this.interval);
        }

        //蛇碰撞
        if (this.snake.bool === true){
            for(var key in this.otherSnakes) {
                let flag = 0;
                let PassiveSnake: Snake;
                PassiveSnake = this.otherSnakes[key];
                for(var j = 0; j < PassiveSnake.BodyList.length; j++) {
                    
                    let head = this.snake.Head;
                    let HitCheck;
                    HitCheck = new Object();
                    //蛇头
                    if(j === 0) {
                        HitCheck = this.snakeHeadCheck(head, PassiveSnake);
                        if(HitCheck){
                            this.snake.bool = false;
                            this.socket.emit('rebirth',this.snake.id,this.snake.BodyList.length,0);
                            flag = 1;
                            break;
                        }
                    }
                    //蛇身
                    else if(j < PassiveSnake.BodyList.length - 1) {
                        let Mbody = PassiveSnake.BodyList[j];
                        let Lbody = PassiveSnake.BodyList[j-1];
                        let Rbody = PassiveSnake.BodyList[j+1];
                        HitCheck = this.snakeHitCheck(head, Mbody, Lbody, Rbody, PassiveSnake);
                        //返回插入位置 HitCheck.bool 表示能否插入过别的蛇
                        if(HitCheck.bool) {
                            this.snake.bool = false;
                            console.log("11111", this.snake.bool);
                            
                            let insertPos = j + HitCheck.nvalue;
                            this.snakeInsert(insertPos, head, PassiveSnake);
                            flag = 1;
                            break;
                        }
                    }
                    //蛇尾
                    else if(j === PassiveSnake.BodyList.length - 1) {
                        let Mbody = PassiveSnake.BodyList[j];
                        let Lbody = PassiveSnake.BodyList[j-1];
                        HitCheck = this.snakeTailHitCheck(head, Mbody, Lbody, PassiveSnake);
                        if(HitCheck.bool) {
                            this.snake.bool = false;
                            let insertPos = j + HitCheck.nvalue;
                            this.snakeInsert(insertPos, head, PassiveSnake);
                            flag = 1;
                        }
                    }
                }
                if(flag === 1) break;
            }
        }
    }

    /**
     * 蛇碰撞插入
     * pos: 插入位置, head: 本机蛇的头, PassiveSnake: 被撞的蛇
     */
    private snakeInsert(pos: number, head: any, PassiveSnake: Snake) {
         
        let x1 = head.x + this.snake.x;
        let y1 = head.y + this.snake.y;

        console.log(this.snake.id, this.snake.bool);
        let insertData;
        insertData = new Object();
        insertData.actid = this.snake.id;
        insertData.pasid = PassiveSnake.id;
        insertData.pos = pos;
        insertData.insertx = x1;
        insertData.inserty = y1;
        insertData.insertBcolor = this.snake.Head.Color.Bright;
        insertData.insertOcolor = this.snake.Head.Color.Origin;

        for(var i = 0; i < this.snake.Head.Color.OriginColor.length; i++) {
            if(this.snake.Head.Color.OriginColor[i] === this.snake.Head.Color.Origin) {
                insertData.colormatch = i;
                break;
            }
        }

        console.log("33333", this.snake.bool);

        this.snake.removeChild(this.snake.BodyList[0]);
        this.snake.BodyList.splice(0, 1);
        this.snake.headChange();
        PassiveSnake.addSinglePoint(head, pos, insertData.insertx, insertData.inserty, insertData.insertBcolor, insertData.insertOcolor);
        this.socket.emit('insert', JSON.stringify(insertData));

        let removeData;
        removeData = new Object();
        let datum = [];
        removeData.id = PassiveSnake.id;
        let infors;
        infors = new Object();
        infors.size = PassiveSnake.BodyList.length;
        infors.head = pos;
        infors.judge = 1;
        let particleItems = [];
        let num = 0;
        while(infors.judge && infors.size) {
            infors = PassiveSnake.ZumaRemove(infors.head, infors.size);
            if (infors.judge === 1){
                datum.push(infors);
                num += infors.last - infors.head;
            }
        }
        removeData.datum = datum;
        this.socket.emit('rebirth',this.snake.id,this.snake.BodyList.length,num);
        this.socket.emit('ZumaRemove', JSON.stringify(removeData));
    }

    private CreateParticle(fromX: number, fromY: number, toX: number, toY: number, flytoX: number, flytoY: number): egret.Shape {
        let particle =  new Particle();
        particle.CreateParticle(fromX, fromY, toX, toY, flytoX, flytoY);
        this.BackGround.addChild(particle);
        let stage = this;
        setTimeout(function() {
            stage.BackGround.removeChild(particle);
        }, 4000);
        return particle;
    }

    /**
     * 蛇碰撞食物
     */
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

    private snakeHeadCheck(head, PassiveSnake: Snake) {
        let rsquare = 4 * (this.radius) * (this.radius);
        let Mdx = (head.x + this.snake.x - PassiveSnake.Head.x - PassiveSnake.x);
        let Mdy = (head.y + this.snake.y - PassiveSnake.Head.y - PassiveSnake.y);
        let Mdist = Mdx*Mdx + Mdy*Mdy;
        if(Mdist <= rsquare && this.snake.bool && PassiveSnake.bool) {
            return true;
        }
        else return false;
    }

    /**
     * 蛇身碰撞检查
     * head: 本机蛇头, M: 中间节点, L: 前一个节点, R: 后一个节点, PassiveSnake: 被撞的蛇
     */
    private snakeHitCheck(head, M, L, R, PassiveSnake: Snake) {
        let rsquare = 4 * (this.radius) * (this.radius);
        let Mdx = (head.x + this.snake.x - M.x - PassiveSnake.x);
        let Mdy = (head.y + this.snake.y - M.y - PassiveSnake.y);
        let Mdist = Mdx*Mdx + Mdy*Mdy;
        let judge;
        judge = new Object();
        judge.bool = false;
        judge.nvalue = 0;
        
        //碰撞触发
        if(Mdist <= rsquare && this.snake.bool && PassiveSnake.bool) {
            let Ldx = (head.x + this.snake.x - L.x - PassiveSnake.x);
            let Ldy = (head.y + this.snake.y - L.y - PassiveSnake.y);
            let Rdx = (head.x + this.snake.x - R.x - PassiveSnake.x);
            let Rdy = (head.y + this.snake.y - R.y - PassiveSnake.y);
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

    /**
     * 蛇尾碰撞检测
     * head:本机蛇头, M:中间节点, L:前一个节点, PassiveSnake:被撞的蛇
     */
    private snakeTailHitCheck(head, M, L, PassiveSnake: Snake) {
        let rsquare = 4 * (this.radius) * (this.radius);
        let Mdx = (head.x + this.snake.x - M.x - PassiveSnake.x);
        let Mdy = (head.y + this.snake.y - M.y - PassiveSnake.y);
        let Mdist = Mdx*Mdx + Mdy*Mdy;
        let judge;
        judge = new Object();
        judge.bool = false;
        judge.nvalue = 0;
        
        //碰撞触发
        if(Mdist <= rsquare && this.snake.bool && PassiveSnake.bool) {
            let Ldx = (head.x + this.snake.x - L.x - PassiveSnake.x);
            let Ldy = (head.y + this.snake.y - L.y - PassiveSnake.y);
            let Ldist = Ldx*Ldx + Ldy*Ldy;
            if(Ldist < 2*rsquare) {
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

    private DropBodyPoint(bodyid: string, snake: Snake) {
        let last_body;
        for (var i = snake.BodyList.length - 1; i >= 0; i--) {
            if (snake.BodyList[i].id === bodyid) {
                last_body = snake.BodyList[i];
                let last_body_color = snake.BodyList[i].Color;
                let last_body_x = snake.BodyList[i].x;
                let last_body_y = snake.BodyList[i].y;
                snake.removeChild(last_body);
                snake.BodyList.splice(i, 1);
                let falsebodypoint = new BodyPoint();
                falsebodypoint.Create(this.radius, last_body_color, false);
                falsebodypoint.x = snake.x + last_body_x;
                falsebodypoint.y = snake.y + last_body_y;
                this.BackGround.addChild(falsebodypoint);
                this.BackGround.setChildIndex(falsebodypoint, -999);
                var animate: egret.Tween = egret.Tween.get(falsebodypoint);
                animate.to({scaleX: 0.01, scaleY: 0.01,alaph: 0}, 500, egret.Ease.circOut);
                let stage = this;
                setTimeout(function() {
                    stage.BackGround.removeChild(falsebodypoint);
                }, 500);
                break;
            }
        }
        
        return null;
    }

    private Rebirth(DieSnake: Snake) {  //写在判断执行后    
        this.removeChild(this.snake);
        this.snake.removeChildren();
        //this.socket.emit('rebirth',this.snake.id,this.snake.BodyList.length);
    }

    private ReDraw(id,x,y,newColor) {
        this.snake.ReDraw(x,y,newColor);
        this.addChild(this.snake);
        let move_info: Array<Object> = [];
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
        // this.socket.emit('new_a_die',JSON.stringify());
            
        
        
    }
    
    
}
