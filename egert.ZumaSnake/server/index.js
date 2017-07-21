var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('node-uuid');

var AllSnakes = [];
var AllFood = [];
for(var i = 0; i < 233; i++) {
  var food_info = {};
  food_info.id = uuid.v1();
  food_info.x = Math.random() * 1920;
  food_info.y = Math.random() * 1080;
  food_info.intake = Math.round(Math.random() * 2) + 1;
  food_info.color = Math.round(Math.random() * 6);
  AllFood.push(food_info);
}
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('join', function(data, x, y) {
    var id = uuid.v1();
    socket.emit('join_id', id);
    var create_info = JSON.parse(data);
    var snake_info = {
      id: id,
      x: x,
      y: y,
      body: create_info
    };
    socket.emit('allfood', JSON.stringify(AllFood));
    socket.emit('other_snake',JSON.stringify(AllSnakes));
    AllSnakes.push(snake_info);
    socket.broadcast.emit('other_join',JSON.stringify(snake_info));
    
    socket.on('eatfood',function(data) {
      socket.broadcast.emit('other_eat', data);
      for(var i = 0; i < AllFood.length; i++) {
        if (AllFood[i].id === data){
          AllFood.splice(i,1);
          break;
        }
      }
    });

    socket.on('move', function(data, id) {
      var position = JSON.parse(data);
      var snake_info = {
        id: id,
        body: position
      }
      socket.broadcast.emit('move',JSON.stringify(snake_info));
    });

    socket.on('Drop',function(data) {
      var dropfood = JSON.parse(data);
      var returnfood = [];
      for (var i = 0; i < 5; i++) {
        var food = {};
        var addfood = {};
        food.id = addfood.id = uuid.v1();
        var intake = Math.round(Math.random() * 2) + 1;
        food.intake = addfood.intake = intake;
        var randomAngle = Math.random()*(Math.PI);
        var randomLength = Math.random()*70;
        food.fromX = dropfood.x;
        food.fromY = dropfood.y;
        food.x = addfood.x = dropfood.x + randomLength*Math.cos(randomAngle);
        food.y = addfood.y = dropfood.y + randomLength*Math.sin(randomAngle);
        food.color = addfood.color = dropfood.color;
        returnfood.push(food);
        AllFood.push(addfood);
      }
      socket.emit('AnimateAddFood', JSON.stringify(returnfood), "true", id);
      socket.broadcast.emit('AnimateAddFood', JSON.stringify(returnfood), "false", id)
      


      socket.emit('getfoodID',food.id);
      socket.broadcast.emit('other_drop',JSON.stringify(food));
    });

    socket.on('disconnect', function(){
        io.emit('disconnect',id);
        AllSnakes.splice(AllSnakes.indexOf(snake_info), 1);
    });

    socket.on('afterEat', function(data, id) {
      console.log(data);
      socket.broadcast.emit('other_add_point',data, id);
    });
  });
});

http.listen(2333, function(){
  console.log('listening on *:2233');
});