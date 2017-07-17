class Color {
	public constructor() {
		
	}

	private ColorList :number[] = 
	[0x7e57c2, 0x5c6bc0, 0xef5350, 0xec407a, 0xab47bc, 0x42a5f5, 0x29b6f6, 0x26c6da, 0x26a69a, 0xffa726];

	public getColor() {
		var num: number = Math.round(Math.random() * this.ColorList.length);
		return this.ColorList[num];
	}
}