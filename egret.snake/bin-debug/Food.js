var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Food = (function (_super) {
    __extends(Food, _super);
    function Food(x, y, r) {
        var _this = _super.call(this) || this;
        _this.init(x, y, r);
        return _this;
    }
    Food.prototype.init = function (x, y, r) {
        this.color = new Color();
        this.colornum = this.color.getColor();
        this.food = new egret.Shape();
        this.food.graphics.beginFill(this.colornum);
        this.food.graphics.drawCircle(0, 0, r);
        this.food.graphics.endFill();
        this.food.x = r;
        this.food.y = r;
        this.x = x;
        this.y = y;
        this.addChild(this.food);
    };
    return Food;
}(egret.Sprite));
__reflect(Food.prototype, "Food");
//# sourceMappingURL=Food.js.map