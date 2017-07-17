class Food extends egret.Sprite {
    private color: Color;
    public colornum: number;
    public constructor(x:number,y:number,r:number) {
        super ();
        this.init(x, y, r);
    }

    private food: egret.Shape;
    private init(x:number,y:number, r:number): void {
        this.color = new Color();
        this.colornum = this.color.getColor();
        this.food = new egret.Shape();
        this.food.graphics.beginFill(this.colornum);
        this.food.graphics.drawCircle(0,0,r);
        this.food.graphics.endFill();

        this.food.x =r;
        this.food.y = r;
        this.x = x;
        this.y = y;
        this.addChild(this.food);
    }

    // private onEat() {
    //     this.parent.removeChild(this);
    // }
}