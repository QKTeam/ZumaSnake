class RankList extends egret.Sprite{
	private container: egret.Sprite;
	public constructor(width, height) {
		super();
		this.Create(width, height);
	}
	private Create(width, height) {
		this.width = width;
		this.height = height;
		let bg = new egret.Shape();
		bg.graphics.beginFill(0xffffff);
		bg.graphics.drawRect(0, 0, this.width, this.height);
		bg.graphics.endFill();
		bg.alpha = 0.5;
		this.addChild(bg);
		let top = new egret.Sprite();
		top.graphics.beginFill(0xff9800);
		top.graphics.drawRect(0,0,this.width,30);
		top.graphics.endFill();
		this.addChild(top);
		let title: egret.TextField = new egret.TextField();
		top.addChild(title);
		title.width = this.width;
		title.textAlign = egret.HorizontalAlign.CENTER;
		title.textColor = 0xffffff;
		title.text = "排行榜(Rank)";
		title.size = 20;
		title.y = 5;
		this.container = new egret.Sprite();
		this.container.height = height;
		this.container.width = width
		this.container.y = 35;
		this.addChild(this.container);
		this.setChildIndex(this.container, 1);
	}
	public Manager(infos: Array<any>) {
		this.container.removeChildren();
		infos.sort(function(a, b) {
			return b.length - a.length;
		});
		for (var i = 0;  i < infos.length; i++) {
			let rank = new egret.TextField();
			rank.text = i+1 + '.  ' + infos[i].playercode;
			if (infos[i].mine === true){
				rank.textColor = 0x66bb6a;
			}
			else{
				rank.textColor = 0xef5350;
			}
			rank.size = 20;
			rank.x = 10;
			rank.y = i * 30;
			rank.width = this.width * 2/3 ;
			rank.textAlign = egret.HorizontalAlign.LEFT;
			this.container.addChild(rank);

			let score = new egret.TextField();
			score.text = infos[i].length;
			if (infos[i].mine === true){
				score.textColor = 0x66bb6a;
			}
			else{
				score.textColor = 0xef5350;
			}

			score.size = 20;
			score.y = i * 30;
			score.anchorOffsetX = score.width;
			score.x = this.width - 10;
			score.width = this.width * 1/3;
			score.textAlign = egret.HorizontalAlign.LEFT;
			this.container.addChild(score);
		}
	}
}