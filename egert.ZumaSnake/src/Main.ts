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

    public constructor() {
        super();
        this.interval = 120 ;
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
        this.socket = io('http://'+window.location.hostname+':2222/');
        let bg: egret.Shape = new egret.Shape();
        bg.graphics.beginFill(0xffccbc);
        bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageWidth);
        bg.graphics.endFill();
        this.addChild(bg);

        // let snake = this.snake;
        let stage = this;

        this.socket.emit('join');
        this.socket.on('create', function(NewSnake) {
            var SnakeInfo = JSON.parse(NewSnake);
            GiveSnakeToStage(SnakeInfo);
            console.log(stage.snake);
            
            // console.log('join',stage.otherSnakes);
        });
        
        
        function GiveSnakeToStage(SnakeInfo) {
            stage.snake = new Snake();
            stage.snake.Create(SnakeInfo);
            stage.addChild(stage.snake);
        }
        
        
        // this.snake = new Snake();
        // this.snake.Create(100 ,100, this.radius, this.SnakeLength);
        // this.addChild(this.snake);
        // let create_info: Array<Object> = [];
        // for (var i = 0; i < this.snake.BodyList.length; i++) {
        //     let single_object;
        //     single_object = new Object();
        //     single_object.x = this.snake.BodyList[i].x;
        //     single_object.y = this.snake.BodyList[i].y;
        //     single_object.Ocolor = this.snake.BodyList[i].Color.Origin;
        //     single_object.Bcolor = this.snake.BodyList[i].Color.Bright;
        //     create_info.push(single_object);
        // }
        
        // this.socket.emit('join',JSON.stringify(create_info), this.snake.x, this.snake.y);
        
        this.socket.on('other_join', function(data) {
            let snake_info: any = JSON.parse(data);
            let Osnake: Snake = new Snake();
            Osnake.CreatOther(snake_info);
            stage.otherSnakes[snake_info.id] = Osnake;
            stage.addChild(Osnake);
            stage.setChildIndex(Osnake,1);
            
            // console.log('other join',stage.otherSnakes);         
        });

        this.socket.on('allfood', function(data) {
            let food_info: Array<any> = JSON.parse(data);
            food_info.forEach(food => {
                let newFood: Food = new Food();
                newFood.CreateFood(stage.radius, food.x, food.y, food.color, food.id, food.intake);
                stage.addChild(newFood);
                stage.setChildIndex(newFood, 1);
                stage.food.push(newFood);
            });
        });
        this.socket.on('other_eat', function(id) {
            let food_info = stage.GetFoodByID(id);
            if (food_info != null){
                stage.removeChild(food_info[1]);
                stage.food.splice(food_info[0], 1);
            }
        });

        this.socket.on('other_snake', function(data) {
            let snakes: Array<any> = JSON.parse(data);
            snakes.forEach(snake => {
                let Osnake: Snake = new Snake();
                Osnake.CreatOther(snake);
                stage.otherSnakes[snake.id] = Osnake;
                stage.addChild(Osnake);
                stage.setChildIndex(Osnake,1);
            });
            // console.log('other snake',stage.otherSnakes);
            
        });

        this.socket.on('disconnect', function(id) {
            if(stage.otherSnakes[id] !== undefined){
                stage.otherSnakes[id].RemoveSnake();
                var delay = setTimeout(function() {
                    stage.removeChild(stage.otherSnakes[id]);
                    delete stage.otherSnakes[id];
                }, 300);
            }
        });

        this.socket.on('rebirth',function(id,newX,newY,newColor) {
            if(stage.snake.id === id)
                stage.ReDraw(id,newX,newY,newColor);
            else{
                stage.removeChild(stage.otherSnakes[id]);
                stage.otherSnakes[id].ReDrawOthers(newX,newY,newColor);
                stage.addChild(stage.otherSnakes[id]);
            }
                
        });

        this.socket.on('AnimateAddFood', function(data, islocal, id, bodyid) {
            let addfood: Array<any> = JSON.parse(data);
            if (islocal === "true") {
                stage.GetBodyPointByID(bodyid, stage.snake);   
                // console.log(find[1].$parent);
                // console.log(stage.snake.BodyList.length);
                
                // if(find !== null){
                //     var last_body = find[1];
                //     stage.snake.BodyList.splice(find[0], 1);
                //     var animate: egret.Tween = egret.Tween.get(last_body);
                //     animate.to({scaleX: 0.01, scaleY: 0.01,alaph: 0}, 400, egret.Ease.circOut);
                //     var time = egret.setTimeout(function() {
                //         stage.snake.removeChild(last_body);
                //     }, stage, 500);
                // }
            }
            else {
                let findsnake = stage.otherSnakes[id];
                if(findsnake !== undefined){
                    stage.GetBodyPointByID(bodyid, findsnake);
                    // console.log(find[1].$parent);
                    
                    // if (find !== null) {
                    //     var last_body = find[1];
                    //     findsnake.BodyList.splice(find[0], 1);
                    //     var animate: egret.Tween = egret.Tween.get(last_body);
                    //     animate.to({scaleX: 0.01, scaleY: 0.01,alaph: 0}, 400, egret.Ease.circOut);
                    //     var time = egret.setTimeout(function() {
                    //         findsnake.removeChild(last_body);
                    //     }, stage, 500);
                    // }
                }
            }
            addfood.forEach(food => {
                stage.BodytoFood(food.fromX, food.fromY, food.x, food.y, food.intake, food.color, food.id);
            });
        });

        this.socket.on('move', function(data) {
            let snake_info: any = JSON.parse(data);
            let findsnake = stage.otherSnakes[snake_info.id];
            if(findsnake !== undefined)
            findsnake.OtherMove(snake_info, 80);
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
        this.socket.on('other_crash',function(data,PasSnake,ActSnake) {           
            let PasInf = JSON.parse(data);
            let passnake = JSON.parse(PasSnake);
            let actsnake = JSON.parse(ActSnake);
            
            if(stage.snake.id === PasInf.id) {
                stage.snake === JSON.parse(PasSnake);
                stage.otherSnakes[actsnake.id] = JSON.parse(ActSnake);
                
            }
            else {
                stage.otherSnakes[passnake.id] = JSON.parse(PasSnake);
                stage.otherSnakes[actsnake.id] = JSON.parse(ActSnake);
            }     
        });
        this.socket.on('EditOther',function(data) {
            let othersnake = JSON.parse(data);
            stage.otherSnakes[othersnake.id] = othersnake;
        });

        /**
         * 碰撞插入其他蛇处理
         */
        this.socket.on('insert_pas',function(data) {
            // {actid, pasid, pos, insertx, inserty, insertBcolor, insertOcolor}
            let findsnakePas: Snake = new Snake();
            let findsnakeAct: Snake = new Snake();
            let insertData = JSON.parse(data);
            let head: BodyPoint = new BodyPoint();
            let point: BodyPoint = new BodyPoint();
            let pasid = insertData.pasid;
            findsnakeAct = stage.otherSnakes[insertData.actid];
            head = findsnakeAct.Head;

            if (stage.snake.id === pasid) {
                findsnakeAct.removeChild(head);
                stage.snake.addSinglePoint(findsnakeAct.Head.id, insertData.pos, insertData.insertx, insertData.inserty, insertData.insertBcolor, insertData.insertOcolor);
                
                findsnakeAct.BodyList.splice(0, 1);
                findsnakeAct.headChange();
            }
            else {
                findsnakePas = stage.otherSnakes[pasid];
                if(findsnakePas !== undefined) {
                    findsnakeAct.removeChild(head);
                    findsnakePas.addSinglePoint(findsnakeAct.Head.id, insertData.pos, insertData.x, insertData.y, insertData.Bcolor, insertData.Ocolor);
                    findsnakeAct.BodyList.splice(0, 1);
                    findsnakeAct.headChange();
                }
            }
        });

        /**
         * 祖玛消除其他蛇操作
         */
        this.socket.on('other_ZumaRemove', function(removeinfor) {
            // {id, datum[]{size, head, last, judge}}
            let removeData;
            removeData = new Object();
            removeData = JSON.parse(removeinfor);
            let id = removeData.id;
            let dataLength = removeData.datum.length;
            if(stage.snake.id === id) {
                for(var i = 0; i < dataLength - 1; i++) {
                    stage.snake.otherZumaRemove(removeData.datum[i].head, removeData.datum[i].last);

                    
                }
            }
            else {
                let findsnake = stage.otherSnakes[id];
                if(findsnake !== undefined) {
                    for(var i = 0; i < dataLength - 1; i++) {
                        findsnake.otherZumaRemove(removeData.datum[i].head, removeData.datum[i].last);
                    }
                }
            }
        });


        this.GetMoveTimer = new egret.Timer(80);
        this.GetMoveTimer.addEventListener(egret.TimerEvent.TIMER, this.GetOtherMove, this);
        this.GetMoveTimer.start();

        mouse.enable(this.stage);
        mouse.setMouseMoveEnabled(true);
        this.touchEnabled = true;

        this.addEventListener(mouse.MouseEvent.MOUSE_MOVE, this.OnMove, this);
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.startTouchAccelerate, this);
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.endTouchAccelerate, this);
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
        }
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
        this.removeChild(this.food[i]);
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
        this.snake.Move(this.moveEvent, this.interval);

        
        //蛇碰撞
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
                    continue;
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
                        let insertPos = j + HitCheck.nvalue;
                        this.snakeInsert(insertPos, head, PassiveSnake,this.snake);
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
                        this.snakeInsert(j, head, PassiveSnake, this.snake);
                        flag = 1;
                    }
                }
            }
            if(flag === 1) break;
        }
    }

    /**
     * 蛇碰撞插入
     * pos: 插入位置, head: 本机蛇的头, PassiveSnake: 被撞的蛇
     */
    private snakeInsert(pos: number, head: any, PassiveSnake: Snake, ActSnake: Snake) {
         
        let x1 = head.x + this.snake.x;
        let y1 = head.y + this.snake.y;

        console.log(x1, y1);
        
        let point: BodyPoint = new BodyPoint();
        let insertData;
        let headid = this.snake.Head.id;
        insertData = new Object();
        insertData.actid = this.snake.id;
        insertData.pasid = PassiveSnake.id;
        insertData.pos = pos;
        insertData.insertx = x1;
        insertData.inserty = y1;
        insertData.insertBcolor = this.snake.Head.Color.Bright;
        insertData.insertOcolor = this.snake.Head.Color.Origin;
        insertData.headid = headid;
        for(var i = 0; i < this.snake.Head.Color.OriginColor.length; i++) {
            if(this.snake.Head.Color.OriginColor[i] === this.snake.Head.Color.Origin) {
                insertData.colormatch = i;
                break;
            }
        }

        // this.snake.bodypointModify(x1, y1);
        
        this.snake.removeChild(this.snake.BodyList[0]);
        PassiveSnake.addSinglePoint(headid, pos, insertData.insertx, insertData.inserty, insertData.insertBcolor, insertData.insertOcolor);

        // if(pos < PassiveSnake.BodyList.length - 1) {
		// 	// PassiveSnake.BodyList.splice(pos, 0, point);
		// 	let index = PassiveSnake.getChildIndex(PassiveSnake.BodyList[pos - 1]);  
        // 	PassiveSnake.addChildAt(this.snake.Head, index);
		// }
		// else {
		// 	PassiveSnake.BodyList.push(this.snake.Head);
		// 	PassiveSnake.addChild(this.snake.Head);
		// 	PassiveSnake.setChildIndex(PassiveSnake.BodyList[PassiveSnake.BodyList.length - 1],0);
		// }

        this.snake.BodyList.splice(0, 1);
        
        this.socket.emit('insert', JSON.stringify(insertData));

        let removeData;
        removeData = new Object();
        let data;
        data = new Object();
        let datum = [];
        removeData.id = PassiveSnake.id;
        let infors;
        infors = new Object();
        infors.size = PassiveSnake.BodyList.length;
        infors.head = pos;
        infors.judge = 1;
        while(infors.judge && infors.size) {
            infors = PassiveSnake.ZumaRemove(infors.head, infors.size);
            datum.push(infors);
        }
        removeData.datum = datum;
        this.Rebirth(this.snake);
        this.socket.emit('ZumaRemove', JSON.stringify(removeData));
    }

    /**
     * 蛇碰撞食物
     */
    private hit(a, b) {
        return (new egret.Rectangle(a.x + this.snake.x - this.radius, a.y + this.snake.y - this.radius, a.width, a.height))
            .intersects(new egret.Rectangle(b.x,b.y,b.width,b.height));
    }

    /**
     * 蛇身碰撞检查
     * head: 本机蛇头, M: 中间节点, L: 前一个节点, R: 后一个节点, PassiveSnake: 被撞的蛇
     */
    private snakeHitCheck(head, M, L, R, PassiveSnake: Snake) {
        let rsquare = 4 * (this.radius + this.SnakeLineWidth) * (this.radius + this.SnakeLineWidth);
        let Mdx = (head.x + this.snake.x - M.x - PassiveSnake.x);
        let Mdy = (head.y + this.snake.y - M.y - PassiveSnake.y);
        let Mdist = Mdx*Mdx + Mdy*Mdy;
        let judge;
        judge = new Object();
        judge.bool = false;
        judge.nvalue = 0;
        
        //碰撞触发
        if(Mdist <= rsquare && this.snake.bool) {
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
        let rsquare = 4 * (this.radius + this.SnakeLineWidth) * (this.radius + this.SnakeLineWidth);
        let Mdx = (head.x + this.snake.x - M.x - PassiveSnake.x);
        let Mdy = (head.y + this.snake.y - M.y - PassiveSnake.y);
        let Mdist = Mdx*Mdx + Mdy*Mdy;
        let judge;
        judge = new Object();
        judge.bool = false;
        judge.nvalue = 0;
        
        //碰撞触发
        if(Mdist <= rsquare && this.snake.bool) {
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
                this.timer.delay = 70;
                this.interval = 70;
                this.startAccelerate();
            }
        }
    }

    private endTouchAccelerate() {
        if (this.snake !== undefined){
            this.timer.delay = 150;
            this.interval = 150;
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
            console.log('11111',this.snake.BodyList.length);
            console.log(this.snake.BodyList[this.snake.BodyList.length - 1]);
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
        this.addChild(food);
        this.setChildIndex(food,1);
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
                let last_body = snake.BodyList[i];
                var animate: egret.Tween = egret.Tween.get(last_body);
                animate.to({scaleX: 0.01, scaleY: 0.01,alaph: 0}, 400, egret.Ease.circOut);
                var time = egret.setTimeout(function() {
                    // console.log(snake.BodyList[i].$parent);
                    if (i === this.snake.BodyList.length) i--;
                    console.log('22222',this.snake.BodyList.length);
                    console.log(this.snake.BodyList[i]);
                    console.log('i',i);
                    
                    snake.removeChild(last_body);
                    snake.BodyList.splice(i, 1);
                }, this, 500);
                break;
                // var info = [];
                // info[0] = i;
                // info[1] = snake.BodyList[i];
                // return info;
            }
        }
        return null;
    }

    private Rebirth(DieSnake: Snake) {  //写在判断执行后
        console.log("6666");       
        this.removeChild(this.snake);
        this.snake.removeChildren();
        this.socket.emit('rebirth',this.snake.id,this.snake.BodyList.length);
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
