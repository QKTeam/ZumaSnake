class BodyPoint extends egret.Sprite{
	public Color: number;
	public bodypoint: egret.Shape;
	public constructor() {
		super();
	}

	public CreateBody(r: number, color: number) {
		this.bodypoint = new egret.Shape();
		this.Color = color;
		this.bodypoint.graphics.beginFill(color);
		this.bodypoint.graphics.drawCircle(0,0,r);
		this.bodypoint.graphics.endFill();
		this.addChild(this.bodypoint);
		return this;
	}
	public CreateHead(line_R: number, line_C: number, r: number, color: number) {
		this.bodypoint = new egret.Shape();
		this.Color = color;
		this.bodypoint.graphics.lineStyle(line_R, line_C);
		this.bodypoint.graphics.beginFill(color);
		this.bodypoint.graphics.drawCircle(0,0,r);
		this.bodypoint.graphics.endFill();
		this.addChild(this.bodypoint);
		return this;
	}
}