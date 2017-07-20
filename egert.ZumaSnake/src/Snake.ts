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
	public constructor() {
		super();
		this.BodyList = [];
		this.speed = 30;
	}
	//本地蛇生成
	/**
	 * x 蛇容器横坐标
	 * y 蛇容器纵坐标
	 * r 蛇身半径
	 * n 蛇身长度
	 */
	public Create(x: number, y:number, r: number, n:number) {
		let headcolor: Color = new Color();
		this.Head = new BodyPoint();
		this.Head.Create(r, headcolor, true);

		//设置坐标
		this.Head.x = r;
		this.Head.y = r;
		this.radius = r;
		this.x = x;
		this.y = y;

		//加入数组
		this.BodyList.push(this.Head);
		this.addChild(this.Head);
		this.setChildIndex(this.Head, -999);

		for (var i = 1; i <= n-1; i++) {
			let bodycolor: Color = new Color();
			let bodypoint: BodyPoint = new BodyPoint();
			bodypoint.Create(r, bodycolor, false);
			bodypoint.x = this.BodyList[this.BodyList.length - 1].x + r;
			bodypoint.y = this.BodyList[this.BodyList.length - 1].y + r;
			this.BodyList.push(bodypoint);
			this.addChild(bodypoint);
			this.setChildIndex(bodypoint, 0);
		}
	}

	public Socket_Create_Others() {

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

	public AfetEat (color: Color) {
		let node: BodyPoint = new BodyPoint();
		node.Create(this.radius, color, false);
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
}