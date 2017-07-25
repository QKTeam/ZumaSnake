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


	public addSinglePoint(pos: number, Dcount: number, x: number, y: number, Bcolor: number, Ocolor: number, isHead: boolean) {
		let point: BodyPoint = new BodyPoint();
		let pointColor = new Color();
		console.log(Bcolor, Ocolor);
		
		pointColor.Bright = Bcolor;
		pointColor.Origin = Ocolor;
		point.Create(this.radius, pointColor, isHead);
		point.x = x - this.x;
		point.y = y - this.y;
		this.BodyList.splice(pos, 0, point);
		this.addChild(point);
		this.setChildIndex(this.BodyList[pos],0);
		return point;
	}

	/**
     * 蛇身消除判断v0.0
     */
    // public ZumaRemove(pos: number,ActSnake:Snake,PasSnake:Snake) {
	// 	//插入位置

    //     let infor;
    //     infor = new Object;
    //     infor.ActSnake = ActSnake;
    //     infor.PasSnake = PasSnake;
	// 	infor.pos = pos;

    //     let stampQ = pos;
	// 	let stampH = pos;
	// 	let ans = this.Check(pos,stampQ,stampH,PasSnake);
	// 	infor.stampQ = ans.stampQ;
	// 	infor.stampH = ans.stampH;
	// 	return infor;

        // for(var j = pos - 1; j > 0; j--) {
		// 	let FlagColor = PasSnake[pos].Color.Origin;
        //     if(PasSnake.BodyList[j].Color.Origin === FlagColor) {
        //         infor.stampQ = j;
		// 		pos = infor.stampsQ; //标记满足颜色和插入的一节相同的的节点的下标
        //     }
        //     else {
		// 		break;
		// 	}
        // }
        // for(var k = pos + 1; k < PasSnake.BodyList.length; k++) {
        // 	let FlagColor = PasSnake[pos].Color.Origin;
        //     if(this.BodyList[k].Color.Origin === FlagColor) {
		// 		infor.stampH = k;
        //     }
        //     else {
		// 		break;
		// 	}
        // }

        // //检查剩余身体长度
        // switch(this.BodyList.length - count)
        // { //小于3调整
        // case 2:
        //     stamp++;
        //     count--;
        //     break;
        // case 1:
        //     stamp += 2;
        //     count -= 2;
        //     break;
        // }
		// infor.stamp = stamp;
		// infor.count = count;
        // //消除三个以上相同颜色蛇身
        // if(count > 2) {
        //     for(var j = stamp; j < stamp + count; j++) {
		// 		console.log('j',j);
				
        //         this.removeChild(this.BodyList[j]);
        //     }
        //     this.BodyList.splice(stamp, count);
        //     if(stamp > this.BodyList.length - 1) { //stamp超出蛇节点
        //         stamp--;
        //     }
        //     this.ZumaRemove(stamp,ActSnake);//递归消除
        // }
        // else {		
		// 	infors.push(infor);	
		// 	console.log(infors.length);
			
					
		// 	return infors;
		// }//递归结束
    // }
	// private Check(pos,stampQ,stampH,PasSnake) {
    //     let FlagColor = PasSnake.BodyList[pos].Color.Origin;
	// 	let count = 0;
	// 	for(var j = stampQ - 1; j > 0; j--) {
    //         if(PasSnake.BodyList[j].Color.Origin === FlagColor) {
    //             stampQ = j; //标记满足颜色和插入的一节相同的的节点的下标
	// 			pos = stampQ - 1;
	// 			count++;
    //         }
    //         else {
	// 			break;
	// 		}
    //     }
    //     for(var k = stampH + 1; k < PasSnake.BodyList.length; k++) {
    //         if(PasSnake.BodyList[k].Color.Origin === FlagColor) {
	// 			stampH = k;
	// 			count++;
    //         }
    //         else {
	// 			break;
	// 		}
    //     }
	// 	if(count<3){
	// 		let ans;
	// 		ans = new Object;
	// 		ans.stampQ = stampQ;
	// 		if(PasSnake.BodyList[stampH].Color.Origin === PasSnake.BodyList[j].Color.Origin)
	// 			ans.stampH = stampH - 1;
	// 		else
	// 			ans.stampH = stampH;
	// 		return ans;
	// 	}
	// 	else
	// 		this.Check(pos,stampQ,stampH,PasSnake)
	// 	// if(PasSnake[pos].Color.Origin === PasSnake[k+1].Color.Origin&&pos>1&&k<PasSnake.BodyList.length)
	// 	// 	this.Check(pos,stampQ,stampH,PasSnake);
	// 	// else


	// }
	//各种处理
	public Edit(infor:any) {
		let PasInf;
		PasInf = new Object;
		if(infor.stampH - infor.stampQ <= 1){ //撞失败
			PasInf.passnake = infor.PasSnake;
			PasInf.actsnake = infor.ActSnake
			PasInf.food = null;
			// PasInf.actsnake = 瞬移没写
			return PasInf;
		}
		else { //撞成功
			let toFood = infor.PasSnake.BodyList.slice(infor.stampH+1);
			infor.PasSnake.splice(infor.BodyList[infor.stampQ],infor.BodyList.length-infor.stampH+1);
			PasInf.passnake = infor.PasSnake;
			PasInf.food = this.CrashToFood(toFood);
			// PasInf.actsnake = 加成没写
			return PasInf;
		}
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
	// //操作蛇身
	// public CasePas(infor){
	// 	let PasInf;
	// 	PasInf = new Object;
	// 	if(infor.stampH - infor.stampQ <= 1){ //撞失败
	// 		PasInf.passnake = infor.PasSnake;
	// 		PasInf.food = null;
	// 		return PasInf;
	// 	}
	// 	else { //撞成功
	// 		let toFood = infor.PasSnake.BodyList.slice(infor.stampH+1);
	// 		infor.PasSnake.splice(infor.BodyList[infor.stampQ],infor.BodyList.length-infor.stampH+1);
	// 		PasInf.passnake = infor.PasSnake;
	// 		PasInf.food = this.CrashToFood(toFood);
	// 		return PasInf;
	// 	}

	// }
	// public EditPasSnakes(crash_infor) {
	// 	let PasInf;
	// 	PasInf = new Object;
	// 	if(crash_infor.stampH - crash_infor.stampQ <= 1){ //撞失败
	// 		PasInf.passnake = crash_infor.PasSnake;
	// 		return PasInf;
	// 	}
	// 	else { //撞成功
	// 		let toFood = crash_infor.PasSnake.BodyList.slice(crash_infor.stampH+1);
	// 		crash_infor.PasSnake.splice(crash_infor.BodyList[crash_infor.stampQ],crash_infor.BodyList.length-infor.stampH+1);
	// 		PasInf.passnake = crash_infor.PasSnake;
	// 		return PasInf;
	// 	}
	// }
	// public EditActSnake(crash_infor) {
	// 	// let PasInf;
	// 	// PasInf = new Object;
	// 	// if(crash_infor.stampH)
	// }

	//被撞后变成食物

	/**
	 * 蛇身消除判断
	 */
	public ZumaRemove(pos, size) {
		console.log(pos);
		
		let infors;
		infors = new Object();
		let head = pos;
		let last = pos;
		let FlagColor;
		FlagColor = this.BodyList[pos].Color.Origin;
		console.log(head, last);
		while (this.BodyList[head].Color.Origin === FlagColor && head) head--;
		if(head || this.BodyList[head].Color.Origin !== FlagColor) head++;
		while(this.BodyList[last].Color.Origin === FlagColor && last < size) last++;
		// console.log(this.BodyList.length);
		console.log(head, last);
		
		if(last - head > 2) {
            for(var i = head; i< last; i++) {
                this.removeChild(this.BodyList[i]);
            }
			this.BodyList.splice(head, last - head);
			infors.size = size + head - last;
			infors.pos = head;
			infors.last = last;
			infors.judge = 1;
			return infors;
		}
		else {
			infors.pos = head;
			infors.last = last;
			infors.judge = 0;
			return infors;
		}
	}

	public actInsert() {
		this.removeChild(this.BodyList[0]);
		this.BodyList.splice(0, 1);
	}

	public pasInsert(pos, head) {
		this.BodyList.splice(pos, 0, head);
		this.addChild(this.BodyList[pos]);
	}
}