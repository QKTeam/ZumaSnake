class Color {
    
    /**
     * [紫，红，浅蓝，绿，黄，棕，橙]
     * [Purple, Red, Blue, Green, Yellow, Brown, Orange]
     */
    public OriginColor: number[] = 
    [0x7B1FA2, 0xB71C1C, 0x039BE5, 0x2E7D32, 0xF9A825, 0x5D4037, 0xEF6C00];

    public BrightColor: number[] =
    [0x9C27B0, 0xD32F2F, 0x29B6F6, 0x43A047, 0xFBC02D, 0x795548, 0xFB8C00];

    public Origin: number;
    public Bright: number;

    public constructor() {
        
        this.GetRandomColor();
        
    }

    public GetRandomColor() {//随机颜色
        let num: number = Math.floor(Math.random() * this.OriginColor.length);
        this.Origin = this.OriginColor[num];
        this.Bright = this.BrightColor[num];
    }
    public GetColorNum(color: Color) {
        for(var i = 0;i<this.OriginColor.length;i++){
            if(color.Origin === this.OriginColor[i])
                return i;
        }
    }
}