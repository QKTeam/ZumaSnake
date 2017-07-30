class Particle extends egret.Sprite{
	public constructor() {
		super()
	}
	public CreateParticle(fromX: number, fromY: number, toX: number, toY: number, flytoX: number, flytoY: number) {
		let particle = new egret.Shape();
        particle.graphics.beginFill(0x40c4ff);
        particle.graphics.drawCircle(0, 0, 2);
        particle.graphics.endFill();
        let glowFilter:egret.GlowFilter = new egret.GlowFilter(0x18ffff, 0.3, 10, 10, 2, egret.BitmapFilterQuality.HIGH, false, false);
        particle.filters = [glowFilter];
        particle.x = 0;
        particle.y = 0;
        this.addChild(particle);
        let animate = egret.Tween.get(this);
        animate.to({x: toX, y: toY}, 1000, egret.Ease.circOut).to({x: flytoX, y: flytoY}, 1000);
		let sprite = this;
        setTimeout(function() {
            sprite.removeChild(particle);
        }, 2000);
        return particle;
	}
}