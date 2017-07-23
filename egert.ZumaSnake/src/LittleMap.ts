class LittleMap extends egret.Sprite{
	private snake_info;
	private radius;
	private ratio;
	public constructor(MapWidth, MapHeight, radius, ratio) {
		super();
		this.snake_info ={};
		this.Create(MapWidth, MapHeight, radius, ratio);
	}
	private Create(MapWidth, MapHeight, radius, ratio) {
		this.radius = radius;
		this.ratio = ratio;
		this.width = MapWidth * ratio;
		this.height = MapHeight * ratio;
		let bg = new egret.Shape();
		bg.graphics.beginFill(0xbdbdbd);
		bg.graphics.drawRect(0, 0, this.width, this.height);
		bg.graphics.endFill();
		bg.alpha = 0.5;
		this.addChild(bg);
	}
	public addSnakeOrModify(info: any, interval) {
			if (!this.snake_info[info.id]) {
				if (info.mine === true) {
					var glowFilter: egret.GlowFilter = new egret.GlowFilter(
					0x66bb6a, 1, 10, 10, 2, egret.BitmapFilterQuality.HIGH, false, false
					);
					let point = new egret.Shape();
					point.graphics.beginFill(0x66bb6a);
					point.graphics.drawCircle(0,0,this.radius);
					point.graphics.endFill();
					this.addChild(point);
					point.filters = [ glowFilter ];
					point.x = this.ratio * info.x;
					point.y = this.ratio * info.y;
					point.scaleX = 0.01;
					point.scaleY = 0.01;
					let animate = egret.Tween.get(point);
					animate.to({scaleX: 1.0, scaleY: 1.0},interval);
					
					this.snake_info[info.id] = {
						object: point,
						x: this.ratio * info.x,
						y: this.ratio * info.y
					}
				}
				else {
					var glowFilter: egret.GlowFilter = new egret.GlowFilter(
					0xef5350, 1, 10, 10, 2, egret.BitmapFilterQuality.HIGH, false, false
					);
					let point = new egret.Shape();
					point.graphics.beginFill(0xef5350);
					point.graphics.drawCircle(0,0,this.radius);
					point.graphics.endFill();
					this.addChild(point);
					point.filters = [ glowFilter ];
					point.x = this.ratio * info.x;
					point.y = this.ratio * info.y;
					point.scaleX = 0.01;
					point.scaleY = 0.01;
					let animate = egret.Tween.get(point);
					animate.to({scaleX: 1.0, scaleY: 1.0},interval);
					this.snake_info[info.id] = {
						object: point,
						x: this.ratio * info.x,
						y: this.ratio * info.y
					}
				}
			}
			else {
				let animate = egret.Tween.get(this.snake_info[info.id].object);
				this.snake_info[info.id].x = this.ratio * info.x;
				this.snake_info[info.id].y = this.ratio * info.y;
				animate.to({x: this.ratio * info.x, y: this.ratio * info.y}, interval);
			}
	}

	public RemovePoint (id) {
		if (this.snake_info[id] !== undefined) {
			this.removeChild(this.snake_info[id].object);
			delete this.snake_info[id];
		}
	}
}