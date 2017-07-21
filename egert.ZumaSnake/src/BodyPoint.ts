class BodyPoint extends egret.Sprite{
    public Color: Color;
    public bodypoint: egret.Shape;
    public id: string;
    public constructor(){
        super();
    }

    public Create(r:number,color:Color,isHead:boolean) {
        this.Color = color;
        if(isHead){
            this.bodypoint =new egret.Shape();
            this.bodypoint.graphics.lineStyle(4,0x000000);
            this.bodypoint.graphics.beginFill(color.Origin);
            this.bodypoint.graphics.drawCircle(0,0,r);
            this.bodypoint.graphics.endFill();
            this.addChild(this.bodypoint);          
        }
        else{
            this.bodypoint =new egret.Shape();
            this.bodypoint.graphics.lineStyle(4,color.Bright);
            this.bodypoint.graphics.beginFill(color.Origin);
            this.bodypoint.graphics.drawCircle(0,0,r);
            this.bodypoint.graphics.endFill();
            this.addChild(this.bodypoint);
        }
    }
}