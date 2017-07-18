class Food extends egret.Sprite {
    private color: Color;
    public colornum: number;
    public constructor() {
        super ();
    }

    //小食物半径为0.2r
    private food: egret.Shape;
    public init(x:number,y:number, r:number): void {
        this.color = new Color();
        this.colornum = this.color.getColor();
        this.food = new egret.Shape();
        this.food.graphics.beginFill(this.colornum);
        this.food.graphics.drawCircle(0,0,0.2*r);
        this.food.graphics.endFill();

        this.food.x = 0.2*r;
        this.food.y = 0.2*r;
        this.x = x;
        this.y = y;
        this.addChild(this.food);
    }
    private lashi(x:number,y:number,r:number,color:number): void {
        this.food = new egret.Shape();
        this.food.graphics.beginFill(color);
        this.food.graphics.drawCircle(0,0,0.2*r);
        this.food.graphics.endFill();

        this.food.x = 0,2*r;
        this.food.y = 0.2*r;
        this.x = x;
        this.y = y;
        this.addChild(this.food);
    }

}