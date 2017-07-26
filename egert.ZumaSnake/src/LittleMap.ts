class LittleMap extends egret.Sprite{
	private snake_info;
	private radius;
	private ratio;
	private MapBody: egret.Sprite;
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
		let title = new egret.Sprite();
		this.addChild(title);
		title.x = 0;
		title.y = 0;
		let titleBG = new egret.Shape();
		titleBG.graphics.beginFill(0xff9800);
		titleBG.graphics.drawRect(0,0,30, this.height);
		titleBG.graphics.endFill();
		title.addChild(titleBG);
		

		let text = ['M','a','p'];

		for (var i = 0; i < text.length; i++) {
			let title_text = new egret.TextField();
			title_text.text = text[i];
			title_text.textColor = 0xffffff;
			title_text.size = 20;
			title_text.anchorOffsetX = title_text.width/2;
			title_text.anchorOffsetY = title_text.height/2;
			title_text.x = title.width/2;
			title_text.y = i*(title_text.height+10) + (title.height - (3*title_text.height + 20))/2;
			title.addChild(title_text);
		}

		this.MapBody = new egret.Sprite();
		this.MapBody.x = 30;
		this.addChild(this.MapBody);
		let bg = new egret.Shape();
		bg.graphics.beginFill(0xffffff);
		bg.graphics.drawRect(0, 0, this.width, this.height);
		bg.graphics.endFill();
		bg.alpha = 0.5;
		this.MapBody.addChild(bg);
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
					this.MapBody.addChild(point);
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
					this.MapBody.addChild(point);
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

	public RemovePoint (id, interval) {
		if (this.snake_info[id] !== undefined) {
			let remove = this.snake_info[id].object;
			let animate = egret.Tween.get(remove);
			animate.to({scaleX: 0.01, scaleY: 0.01}, interval);
			egret.setTimeout(function() {
				this.MapBody.removeChild(remove);
			}, this, interval);
			delete this.snake_info[id];
		}
	}
}