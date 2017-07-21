class Color {
    
    /**
     * [紫，红，蓝，绿，黄，墨绿，橙]
     * [Purple, Red, Blue, Green, Yellow, Teal, Deep Orange]
     */
    public OriginColor: number[] = 
    [0x7B1FA2, 0xB71C1C, 0x1976D2, 0x2E7D32, 0xF9A825, 0x00897B, 0xF4511E];

    public BrightColor: number[] =
    [0x9C27B0, 0xD32F2F, 0x2196F3, 0x43A047, 0xFBC02D, 0x26A69A, 0xFF7043];

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
}