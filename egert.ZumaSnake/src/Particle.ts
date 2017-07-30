class Particle extends egret.Sprite{
	private fromX;
	private fromY;
	private toX;
	private toY;
	private flytoX;
	private flytoY;
	private pointX;
	private pointY;
	public constructor() {
		super()
	}
	public CreateParticle(fromX: number, fromY: number, toX: number, toY: number, flytoX: number, flytoY: number) {
		this.fromX = fromX;
		this.fromY = fromY;
		this.toX = toX;
		this.toY = toY;
		this.flytoX = flytoX;
		this.flytoY = flytoY;
		this.pointX = Math.random() * Math.max(toX, flytoX) + Math.min(toX, flytoX);
		this.pointY = Math.random() * Math.max(toY, flytoY) + Math.min(toY, flytoY);
		let particle = new egret.Shape();
        particle.graphics.beginFill(0x40c4ff);
        particle.graphics.drawCircle(0, 0, 2);
        particle.graphics.endFill();
        let glowFilter:egret.GlowFilter = new egret.GlowFilter(0x18ffff, 0.3, 10, 10, 2, egret.BitmapFilterQuality.HIGH, false, false);
        particle.filters = [glowFilter];
        particle.x = 0;
        particle.y = 0;
		this.x = fromX;
		this.y = fromY;
        this.addChild(particle);
        let animate = egret.Tween.get(this);
        animate.to({x: toX, y: toY}, 1000, egret.Ease.circOut).to({factor : 1}, 3000);
	}

	private get factor() {
		return 0;
	}

	private set factor(value) {
		this.x = (1 - value) * (1 - value) * this.toX + 2 * value * (1 - value) * this.pointX + value * value * this.flytoX;
		this.y = (1 - value) * (1 - value) * this.toY + 2 * value * (1 - value) * this.pointY + value * value * this.flytoY;
	}
}