class BodyPoint extends egret.Sprite{
    public Color: Color;
    public bodypoint: egret.Shape;
    public id: number;
    public constructor(){
        super();
    }

    public Create(r:number,color:Color,isHead:boolean) {
        if(isHead){
            this.bodypoint =new egret.Shape();
            this.bodypoint.graphics.lineStyle(2,0x000000);
            this.bodypoint.graphics.beginFill(color.Origin);
            this.bodypoint.graphics.drawCircle(0,0,r);
            this.bodypoint.graphics.endFill();
            this.addChild(this.bodypoint);          
        }
        else{
            this.bodypoint =new egret.Shape();
            this.bodypoint.graphics.lineStyle(2,color.Bright);
            this.bodypoint.graphics.beginFill(color.Origin);
            this.bodypoint.graphics.drawCircle(0,0,r);
            this.bodypoint.graphics.endFill();
            this.addChild(this.bodypoint);
        }
    }
}