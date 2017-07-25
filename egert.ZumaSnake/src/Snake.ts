class Snake extends egret.Sprite{
	//蛇身数组
	public BodyList: BodyPoint[];
	//蛇身半径
	public radius: number;
	//蛇头
	public Head: BodyPoint;
	//累计食物计数数组
	public ColorCount: Object;
	//蛇的速度
	public speed: number;
	//加速计时器
	public AccelerateTimer: egret.Timer;
	//加速累计时间
	public count: number;
	//插入时用来判断是否没有插入过
	public bool:boolean;

	public id: String;
	
	public constructor() {
		super();
		this.BodyList = [];
		this.speed = 30*0.5;
		this.ColorCount = {};
		this.count = 0;
		this.bool = true;
		this.radius = 10;
	}
	//本地蛇生成
	/**
	 * r 蛇身半径
	 * bodypoint 蛇身信息
	 */
	public Create(bodypointInfo) {
		this.id = bodypointInfo.id;
		let headcolor: Color = new Color();
		headcolor.Origin = headcolor.OriginColor[bodypointInfo.body[0].color];
		headcolor.Bright = headcolor.BrightColor[bodypointInfo.body[0].color];
		this.Head = new BodyPoint();
		this.Head.Create(this.radius, headcolor, true);
		this.bool = true;

		//设置坐标
		this.Head.x = this.radius;
		this.Head.y = this.radius;
		this.Head.id = bodypointInfo.body[0].id;
		this.x = bodypointInfo.x;
		this.y = bodypointInfo.y;

		//加入数组
		this.BodyList.push(this.Head);
		this.Head.scaleX = 0.01;
		this.Head.scaleY = 0.01;
		let animate: egret.Tween = egret.Tween.get(this.Head);
		this.addChild(this.Head);
		animate.to({scaleX: 1.0, scaleY: 1.0},300);
		this.setChildIndex(this.Head, -999);

		for (var i = 1; i < bodypointInfo.body.length; i++) {
			console.log('data-length',bodypointInfo.body.length)
			let bodycolor: Color = new Color();
			bodycolor.Origin = headcolor.OriginColor[bodypointInfo.body[i].color];
			bodycolor.Bright = headcolor.BrightColor[bodypointInfo.body[i].color];
			let bodypoint: BodyPoint = new BodyPoint();
			bodypoint.Create(this.radius, bodycolor, false);
			bodypoint.x = this.radius;
			bodypoint.y = this.radius;
			bodypoint.id = bodypointInfo.body[i].id;
			this.BodyList.push(bodypoint);
			bodypoint.x = 0.01;
			bodypoint.y = 0.01;
			animate = egret.Tween.get(bodypoint);
			this.addChild(bodypoint);
			animate.to({scaleX: 1.0, scaleY: 1.0},300);
			this.setChildIndex(bodypoint, 0);
		}
	}


	public Move(e: egret.TouchEvent, interval: number) {
		let mouseX = e.stageX;
		let mouseY = e.stageY;
		let animate: egret.Tween;

		let headX = this.x + this.BodyList[0].x;
		let headY = this.y + this.BodyList[0].y;
		animate = egret.Tween.get(this.BodyList[0]);

		let length = Math.sqrt((mouseX - headX)*(mouseX - headX) + (mouseY - headY)*(mouseY - headY));
		let VectorX = (mouseX - headX)/length;
		let VectorY = (mouseY - headY)/length;

		if (VectorX*length*VectorX*length+VectorY*length*VectorY*length<=this.speed*this.speed) return;

		let NextX = this.BodyList[0].x + this.speed * VectorX;
		let NextY = this.BodyList[0].y + this.speed * VectorY;

		animate.to({x: NextX, y: NextY}, interval);

		for (var i = this.BodyList.length - 1; i >= 1; i--) {
			animate = egret.Tween.get(this.BodyList[i]);
			animate.to({x: this.BodyList[i -1].x, y: this.BodyList[i -1].y}, interval);
		}
	}

	public AfterEat (color_info, id) {
		let node: BodyPoint = new BodyPoint();
		let color = new Color();
		color.Bright = color_info.Bcolor;
		color.Origin = color_info.Ocolor;
		node.Create(this.radius, color, false);
		node.id = id;
		node.x = this.BodyList[this.BodyList.length - 1].x + this.radius;
		node.y = this.BodyList[this.BodyList.length - 1].y + this.radius;
		node.scaleX = 0.01;
		node.scaleY = 0.01;
		this.BodyList.push(node);
		this.addChild(node);
		var animate: egret.Tween = egret.Tween.get(node);
		animate.to({scaleX: 1.0, scaleY: 1.0},500,egret.Ease.circOut);
		this.setChildIndex(this.BodyList[this.BodyList.length - 1],0);
	}

	public CreatOther(info: any) {
		this.id = info.id;
		this.Head = new BodyPoint();
		let headcolor: Color = new Color();
		headcolor.Origin = headcolor.OriginColor[info.body[0].color];
		headcolor.Bright = headcolor.BrightColor[info.body[0].color];
		this.Head.Create(this.radius, headcolor, true);
		this.Head.x = this.radius;
		this.Head.y = this.radius;
		this.Head.id = info.body[0].id;
		this.x = info.x;
		this.y = info.y;
		this.BodyList.push(this.Head);
		this.Head.scaleX = 0.01;
		this.Head.scaleY = 0.01;
		let animate: egret.Tween = egret.Tween.get(this.Head);
		this.addChild(this.Head);
		animate.to({scaleX: 1.0, scaleY: 1.0},300);
		this.setChildIndex(this.Head, -999);

		for(var i = 1; i < info.body.length; i++) {
			let bodypoint: BodyPoint = new BodyPoint();
			let bodycolor: Color = new Color();
			bodycolor.Origin = bodycolor.OriginColor[info.body[i].color];
			bodycolor.Bright = bodycolor.BrightColor[info.body[i].color];
			bodypoint.Create(this.radius, bodycolor, false);
			bodypoint.x = info.x;
			bodypoint.y = info.y;
			bodypoint.id = info.body[i].id;
			this.BodyList.push(bodypoint);
			bodypoint.scaleX = 0.01;
			bodypoint.scaleY = 0.01;
			animate = egret.Tween.get(bodypoint);
			this.addChild(bodypoint);
			animate.to({scaleX: 1.0, scaleY: 1.0},300);
			this.setChildIndex(bodypoint, 0);
		}
	}


	public OtherMove(info: any, interval) {
		for(var i = 0; i < Math.min(info.body.length, this.BodyList.length); i++) {
			let animate: egret.Tween = egret.Tween.get(this.BodyList[i]);
			animate.to({x: info.body[i].x, y: info.body[i].y},interval);
		}
	}

	public OtherAddPoint (x: number, y: number, Ocolor: number, Bcolor: number) {
		let node: BodyPoint = new BodyPoint();
		let nodecolor = new Color();
		nodecolor.Bright = Bcolor;
		nodecolor.Origin = Ocolor;
		node.Create(this.radius, nodecolor, false);
		node.x = x - this.x;
		node.y = y - this.y;
		node.scaleX = 0.01;
		node.scaleY = 0.01;
		this.BodyList.push(node);
		this.addChild(node);
		var animate: egret.Tween = egret.Tween.get(node);
		animate.to({scaleX: 1.0, scaleY: 1.0},500,egret.Ease.circOut);
		this.setChildIndex(this.BodyList[this.BodyList.length - 1],0);
	}

	public RemoveSnake() {
		this.BodyList.forEach(bodypoint => {
			let animate = egret.Tween.get(bodypoint);
			animate.to({scaleX: 0.01, scaleY: 0.01}, 300);
		});
	}

	/**
     * 蛇身消除判断
     */
    public ZumaRemove(pos: number,ActSnake: Snake) {

        let infor;
        infor = new Object;
		infor.pos = pos;

        for(var j = pos - 1; j > 0; j--) {
			let FlagColor = this.BodyList[pos].Color.Origin;
            if(this.BodyList[j].Color.Origin === FlagColor) {
                infor.stampQ = j;
				pos = infor.stampsQ; //标记满足颜色和插入的一节相同的的节点的下标
            }
            else {
				break;
			}
        }
        for(var k = pos + 1; k < this.BodyList.length; k++) {
        	let FlagColor = this.BodyList[pos].Color;
            if(this.BodyList[k].Color === FlagColor) {
				infor.stampH = k;
            }
            else {
				break;
			}
        }
		let stampQ = pos - 1;
		let stampH = infor.stampH;
		let qqq = JSON.stringify(this.Check(pos,stampQ,stampH));
		let ans;
		ans = new Object;
		ans = JSON.parse(qqq);
		infor.stampQ = ans.stampQ;
		infor.stampH = ans.stampH;
		infor.id = this.id;
		if(infor.stampH - infor.stampQ < 2){ //撞失败
			infor.food = null;
			ActSnake.Rebirth(ActSnake);
			// PasInf.actsnake = 瞬移没写
			return infor;
		}
		else { //撞成功
			let toFood = this.BodyList.slice(infor.stampH+1);
			this.BodyList.splice(infor.BodyList[infor.stampQ-1],infor.BodyList.length-infor.stampH+1);
			infor.food = this.CrashToFood(toFood);
			// PasInf.actsnake = 加成没写
			return infor;
		}
    }
	private Check(pos,stampQ,stampH) {
        let FlagColor = this.BodyList[pos-1].Color.Origin;
		let count = 0;
		let count_k =0;
		for(var j = stampQ - 1; j > 0; j--) {
            if(this.BodyList[j].Color.Origin === FlagColor) {
                stampQ = j; //标记满足颜色和插入的一节相同的的节点的下标
				pos = stampQ - 1;
				count++;
            }
            else {
				break;
			}
        }
        for(var k = stampH + 1; k < this.BodyList.length; k++) {
            if(this.BodyList[k].Color.Origin === FlagColor) {
				stampH = k;
				count++;
            }
            else {
				break;
			}
        }
		if(count<3 || count_k===0){
			let ans;
			ans = new Object;
			ans.stampQ = stampQ;
			if(this.BodyList[stampH].Color.Origin === this.BodyList[j].Color.Origin)
				ans.stampH = stampH - 1;
			else
				ans.stampH = stampH;
			return ans;
		}
		else
			this.Check(pos,stampQ,stampH);
	}
	public CrashToFood(body) {
		let food: Food;
		let foods = [];
		for(var i =0;i<body.BodyList.length;i++){
			food = new Food;
			food.GetBigFood(body.BodyList[i].x+body.x,body.BodyList[i].y+body.y,this.radius,body.BodyList[i].Color);
			foods.push(food);
		}
		return foods;
	}
	private Rebirth(ActSnake: Snake) {
		let actsnake = new Snake;
		actsnake.id = ActSnake.id;
		for(var i = 0;i<ActSnake.BodyList.length;i++) {
			
		}
			
	}
}