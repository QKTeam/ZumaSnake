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

    
    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        var location;
        location = {}
        location.host = '192.168.1.178';
        this.socket = io('http://' + location.host + ':2333/');
        let bg: egret.Shape = new egret.Shape();
        bg.graphics.beginFill(0xffccbc);
        bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageWidth);
        bg.graphics.endFill();
        this.addChild(bg);
        // this.randomFood();

        this.snake = new Snake();
        this.snake.Create(100 ,100, this.radius, this.SnakeLength);
        this.addChild(this.snake);
        let create_info: Array<Object> = [];
        for (var i = 0; i < this.snake.BodyList.length; i++) {
            let single_object;
            single_object = new Object();
            single_object.x = this.snake.BodyList[i].x;
            single_object.y = this.snake.BodyList[i].y;
            single_object.Ocolor = this.snake.BodyList[i].Color.Origin;
            single_object.Bcolor = this.snake.BodyList[i].Color.Bright;
            create_info.push(single_object);
        }
        
        this.socket.emit('join',JSON.stringify(create_info), this.snake.x, this.snake.y);
        let snake = this.snake;
        let stage = this;
        this.socket.on('join_id', function(id){
            snake.id = id;
        });
        this.socket.on('other_join', function(data) {
            console.log(stage.otherSnakes);
            
            let snake_info: any = JSON.parse(data);
            let Osnake: Snake = new Snake();
            Osnake.CreatOther(snake_info);
            stage.otherSnakes.push(Osnake);
            stage.addChild(Osnake);
            stage.setChildIndex(Osnake,1);
        });

        this.socket.on('allfood', function(data) {
            let food_info: Array<any> = JSON.parse(data);
            console.log(food_info);
            
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
                stage.otherSnakes.push(Osnake);
                stage.addChild(Osnake);
                stage.setChildIndex(Osnake,1);
            });
        });

        this.socket.on('disconnect', function(id) {
            let info: Array<any> = stage.GetSnakeByID(id);
            if(info !== null){
                let ReSnake = info[1];
                let index = info[0];
                stage.removeChild(ReSnake);
                stage.otherSnakes.splice(index, 1);
            }
        });

        this.socket.on('AnimateAddFood', function(data, islocal, id) {
            let addfood: Array<any> = JSON.parse(data);
            if (islocal === "true") {
                console.log('true');
                
                var last_body = stage.snake.BodyList[stage.snake.BodyList.length - 1];
                stage.snake.BodyList.splice(-1, 1);
                var animate: egret.Tween = egret.Tween.get(last_body);
                animate.to({scaleX: 0.01, scaleY: 0.01,alaph: 0}, 400, egret.Ease.circOut);
                var time = egret.setTimeout(function() {
                    stage.snake.removeChild(last_body);
                }, stage, 500);
            }
            else {
                console.log('false');
                
                let findsnake:Array<any> = stage.GetSnakeByID(id);
                if(findsnake !== null){
                    var last_body:BodyPoint = findsnake[1].BodyList[findsnake[1].BodyList.length - 1];
                    findsnake[1].BodyList.splice(-1, 1);
                    var animate: egret.Tween = egret.Tween.get(last_body);
                    animate.to({scaleX: 0.01, scaleY: 0.01,alaph: 0}, 400, egret.Ease.circOut);
                    var time = egret.setTimeout(function() {
                        findsnake[1].removeChild(last_body);
                    }, stage, 500);
                }
            }
            addfood.forEach(food => {
                stage.BodytoFood(food.fromX, food.fromY, food.x, food.y, food.intake, food.color, food.id);
            });
        });

        this.socket.on('move', function(data) {
            let snake_info: any = JSON.parse(data);
            let findsnake:Array<any> = stage.GetSnakeByID(snake_info.id);
            if(findsnake !== null)
            findsnake[1].OtherMove(snake_info, 80);
        });

        this.socket.on('other_add_point', function(data, id) {
            let addpoint = JSON.parse(data);
            let findsnake = stage.GetSnakeByID(id);
            if (findsnake !== null) {
                findsnake[1].OtherAddPoint(addpoint.x, addpoint.y, addpoint.Ocolor, addpoint.Bcolor);
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
        for (var i = 0; i < this.snake.BodyList.length; i++) {
            let single_object;
            single_object = new Object();
            single_object.x = this.snake.BodyList[i].x;
            single_object.y = this.snake.BodyList[i].y;
            move_info.push(single_object);
        }
        this.socket.emit('move',JSON.stringify(move_info), this.snake.id);
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
            this.snake.AfterEat(ncolor);
            let addpoint = this.snake.BodyList[this.snake.BodyList.length - 1];
            let add_info = {
                x: addpoint.x + this.snake.x,
                y: addpoint.y + this.snake.y,
                Ocolor: addpoint.Color.Origin,
                Bcolor: addpoint.Color.Bright
            }
            this.socket.emit("afterEat",JSON.stringify(add_info), this.snake.id);
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
        let move_info: Array<Object> = [];
        for (var i = 0; i < this.snake.BodyList.length; i++) {
            let single_object;
            single_object = new Object();
            single_object.x = this.snake.BodyList[i].x;
            single_object.y = this.snake.BodyList[i].y;
            move_info.push(single_object);
        }
        this.socket.emit('move',JSON.stringify(move_info), this.snake.id);

        //蛇碰撞
        for(var key in this.otherSnakes) {
            let flag = 0;
            for(var j = 0; j < this.otherSnakes[key].BodyList.length; j++) {
                let head = this.snake.Head;
                //蛇头
                if(j = 0) {}
                else if(j > 0 || j < this.otherSnakes[key].BodyList.length - 1) {
                    let Mbody = this.otherSnakes[key].BodyList[j];
                    let Lbody = this.otherSnakes[key].BodyList[j-1];
                    let Rbody = this.otherSnakes[key].BodyList[j+1];
                    //返回插入位置
                    if(this.snakeHitCheck(head, Mbody, Lbody, Rbody, key, j).bool) {
                        let insertPos = j + this.snakeHitCheck(head, Mbody, Lbody, Rbody, key, j).nvalue;
                        this.snakeInsert(insertPos, head, key);
                        flag = 1;
                        break;
                    }
                }
                //蛇尾
                else if(j = this.otherSnakes[key].BodyList.length - 1) {
                    this.snakeInsert(j, head, key);
                    flag = 1;
                }
            }
            if(flag === 1) break;
        }
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
                this.removeChild(this.otherSnakes[key].BodyList[j]);
            }
            this.otherSnakes[key].BodyList.splice(stamp, count);
            this.ZumaRemove(stamp, key);//递归消除
        }
        else return;//递归结束
    }

    private hit(a, b) {
        return (new egret.Rectangle(a.x + this.snake.x - this.radius, a.y + this.snake.y - this.radius, a.width, a.height))
            .intersects(new egret.Rectangle(b.x,b.y,b.width,b.height));
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
                var drop_body = {
                    x: last_body.x + this.snake.x,
                    y: last_body.y + this.snake.y,
                    color: last_body.Color.OriginColor.indexOf(last_body.Color.Origin)
                }
                this.socket.emit('Drop', JSON.stringify(drop_body));
				this.snake.count = 0;
			}
		}, this);
		this.snake.AccelerateTimer.start();
	}

    private stopAccelerate() {
		this.snake.AccelerateTimer.stop();
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

    private GetSnakeByID(id: string): Array<any> {
        for (var i = 0; i < this.otherSnakes.length; i++) {
            if (this.otherSnakes[i].id === id) {
                var snake = [];
                snake[0] = i;
                snake[1] = this.otherSnakes[i];
                return snake;
            }
        }
        return null;
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
}


