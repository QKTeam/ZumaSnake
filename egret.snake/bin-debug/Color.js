var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var Color = (function () {
    function Color() {
        this.ColorList = [0x7e57c2, 0x5c6bc0, 0xef5350, 0xec407a, 0xab47bc, 0x42a5f5, 0x29b6f6, 0x26c6da, 0x26a69a, 0xffa726];
    }
    Color.prototype.getColor = function () {
        var num = Math.round(Math.random() * this.ColorList.length);
        return this.ColorList[num];
    };
    return Color;
}());
__reflect(Color.prototype, "Color");
//# sourceMappingURL=Color.js.map