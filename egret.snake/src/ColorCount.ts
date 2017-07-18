//计算小食物累积类
class ColorCount extends egret.Sprite {
    public color: number;
    public count: number;
    public constructor(color:number, count:number) {
        super();
        this.Count(color, count);
    }
    
    private Count(color:number, count:number) {
        this.count = count;
        this.color = color;
    }
}