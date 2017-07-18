class BigFood extends egret.Sprite {
    public constructor() {
        super ();
    }
    private bigfood: egret.Shape;
    public init(x:number,y:number,r:number,color:number): void {
        this.bigfood = new egret.Shape();
        this.bigfood.graphics.beginFill(color);
        this.bigfood.graphics.drawCircle(0,0,r);
        this.bigfood.graphics.endFill();

        this.bigfood.x = r;
        this.bigfood.y = r;
        this.x = x;
        this.y = y;
        this.addChild(this.bigfood);
    }
}