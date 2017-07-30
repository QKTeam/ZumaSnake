class RemoveTips extends egret.Sprite{
	public textTips;
	public constructor() {
		super()
	}

	public Create(num: number) {
		let textTips = new egret.TextField();
		this.textTips = textTips;
		textTips.textAlign = egret.HorizontalAlign.CENTER;
		textTips.textAlign = egret.VerticalAlign.MIDDLE;
		let count = 1;
		textTips.strokeColor = 0x0288d1;
		textTips.stroke = 4;
		textTips.size = 50;
		this.addChild(textTips);
		for (var i = 0; i < num; i++) {
			setTimeout(function() {
				if (count === 4){
					textTips.strokeColor = 0xffa726;
					let animate = egret.Tween.get(textTips);
                    animate.to({size : 100}, 300, egret.Ease.backInOut);
				}
				textTips.text = 'X ' + count++;
			}, 100 * i);
		}
		setTimeout(function() {
			let animate = egret.Tween.get(textTips);
			animate.to({scaleX: 0.01, scaleY: 0.01}, 1000, egret.Ease.backInOut);
		}, 100 * num + 1000);
	}
}