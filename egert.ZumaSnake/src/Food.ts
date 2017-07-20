class Food extends egret.Sprite{
    public color: Color;
    public intake: number;
    public FoodRadius: number;
    public food: egret.Shape;
    public constructor() {
        super();
    }
    //随机生成食物
    public GetRandomFood(r:number) {
        this.food = new egret.Shape();
        this.color = new Color();
        this.intake = Math.round(Math.random() * 3) + 1;
        this.FoodRadius = 0.2 * r * this.intake;
        this.food.graphics.beginFill(this.color.Origin);
        this.food.graphics.drawCircle(0,0,this.FoodRadius);
        this.food.graphics.endFill();
        this.x = Math.random() * 1920;
        this.y = Math.random() * 1080;
        this.addChild(this.food);
    }
    //爆屎
    public CreateAccelerate(x: number,y: number,r: number,color: Color){
        this.color = color;
        this.food = new egret.Shape();
        this.FoodRadius = r * 0.2 * Math.round(Math.random() * 4);
        this.food.graphics.beginFill(color.Origin);
        this.food.graphics.drawCircle(0,0,this.FoodRadius);
        this.food.graphics.endFill();
        this.x = x;
        this.y = y;
        this.addChild(this.food);
    }
        //爆尸体
    public GetBigFood(x: number,y: number,r: number,color: Color){
        this.color = color;
        this.food = new egret.Shape();
        this.intake = 5;
        this.FoodRadius = 0.2 * r * this.intake;
        this.food.graphics.beginFill(color.Origin);
        this.food.graphics.drawCircle(0,0,this.FoodRadius);
        this.food.graphics.endFill();
        this.x = x;
        this.y = y;
        this.addChild(this.food);
    }
}