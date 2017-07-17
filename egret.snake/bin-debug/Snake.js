var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// 蛇类
var Snake = (function (_super) {
    __extends(Snake, _super);
    function Snake(x, y, r, n) {
        var _this = _super.call(this) || this;
        _this.headColor = new Color();
        _this.body = [];
        _this.speed = 30;
        _this.Create(x, y, r, n);
        return _this;
    }
    /**
    * x 横坐标
    * y 纵坐标
    * r 蛇头半径
    * color 蛇头颜色
    * n 初始蛇身数量
    */
    Snake.prototype.Create = function (x, y, r, n) {
        this.head = new egret.Shape();
        this.head.graphics.lineStyle(5, 0x403232);
        this.head.graphics.beginFill(this.headColor.getColor());
        this.head.graphics.drawCircle(r, r, r);
        this.head.graphics.endFill();
        //设置坐标
        this.head.x = 0;
        this.head.y = 0;
        this.radius = 20;
        this.x = x;
        this.y = y;
        //加入数组
        this.body.push(this.head);
        this.addChild(this.head);
        this.setChildIndex(this.head, -999);
        for (var i = 1; i <= n - 1; i++) {
            var bodycolor = new Color();
            var bodypoint = new egret.Shape();
            bodypoint.graphics.beginFill(bodycolor.getColor());
            bodypoint.graphics.drawCircle(r, r, r);
            bodypoint.graphics.endFill();
            bodypoint.x = this.body[this.body.length - 1].x + r;
            bodypoint.y = this.body[this.body.length - 1].y + r;
            this.body.push(bodypoint);
            this.addChild(this.body[this.body.length - 1]);
            this.setChildIndex(this.body[this.body.length - 1], 0);
        }
    };
    Snake.prototype.Move = function (e, interval) {
        var mouseX = e.stageX;
        var mouseY = e.stageY;
        var animate;
        var headX = this.x + this.body[0].x;
        var headY = this.y + this.body[0].y;
        animate = egret.Tween.get(this.body[0]);
        var length = Math.sqrt((mouseX - headX) * (mouseX - headX) + (mouseY - headY) * (mouseY - headY));
        var VectorX = (mouseX - headX) / length;
        var VectorY = (mouseY - headY) / length;
        if (VectorX * length * VectorX * length + VectorY * length * VectorY * length <= this.speed * this.speed)
            return;
        var NextX = this.body[0].x + this.speed * VectorX;
        var NextY = this.body[0].y + this.speed * VectorY;
        animate.to({ x: NextX, y: NextY }, interval);
        for (var i = this.body.length - 1; i >= 1; i--) {
            animate = egret.Tween.get(this.body[i]);
            animate.to({ x: this.body[i - 1].x, y: this.body[i - 1].y }, interval);
        }
    };
    Snake.prototype.afterEat = function (color) {
        var node = new egret.Shape();
        node.graphics.beginFill(color);
        node.graphics.drawCircle(this.radius, this.radius, this.radius);
        node.graphics.endFill();
        node.x = this.body[this.body.length - 1].x + this.radius;
        node.y = this.body[this.body.length - 1].y + this.radius;
        this.body.push(node);
        this.addChild(node);
        this.setChildIndex(this.body[this.body.length - 1], 0);
    };
    return Snake;
}(egret.Sprite));
__reflect(Snake.prototype, "Snake");
//# sourceMappingURL=Snake.js.map