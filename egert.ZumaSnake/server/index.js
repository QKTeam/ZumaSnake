var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
  pingTimeout: 1000,
  pingInterval: 100,
});
var uuid = require('node-uuid');

var AllSnakes = [];
var AllFood = [];
var NewSnakeLength = 20;
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
    var snakeX = Math.random() * 1920;
    var snakeY = Math.random() * 1080;
    var bodypoint = [];
    for (var i = 0; i < NewSnakeLength; i++) {
      var bodyinfo = {
        id: uuid.v1(),
        x: snakeX,
        y: snakeY,
        color: Math.round(Math.random() * 6)
      };
      bodypoint.push(bodyinfo);
    }
    var NewSnake = {
      id: id,
      x: snakeX,
      y: snakeY,
      body: bodypoint
    }
    socket.emit('create',JSON.stringify(NewSnake));
    socket.emit('allfood', JSON.stringify(AllFood));
    socket.emit('other_snake',JSON.stringify(AllSnakes));
    AllSnakes.push(NewSnake);
    socket.broadcast.emit('other_join',JSON.stringify(NewSnake));
    
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
      AllSnakes.forEach(snake => {
        if(snake.id === id){
          snake.body = position;
          return;
        }
      });
      
      socket.broadcast.emit('move',JSON.stringify(snake_info));
    });

    socket.on('Drop',function(data) {
      
      var dropfood = JSON.parse(data);
      var returnfood = [];
      var bodyid = dropfood.id;
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
      socket.emit('AnimateAddFood', JSON.stringify(returnfood), "true", id, bodyid);
      socket.broadcast.emit('AnimateAddFood', JSON.stringify(returnfood), "false", id, bodyid)
    });

    socket.on('disconnect', function(){
        console.log('a user leave');
        io.emit('disconnect',id);
        AllSnakes.splice(AllSnakes.indexOf(NewSnake), 1);
    });
    
    socket.on('afterEat', function(id, data) {
      var food_id = uuid.v1();
      socket.emit('own_add_point',data, food_id);
      socket.broadcast.emit('other_add_point', id, data, food_id);
    });

    socket.on('crash',function(data,PasSnake,ActSnake) {
      socket.broadcast.emit('other_crash',data,PasSnake,ActSnake);
      for(var i = 0;i<PasInf.food.length;i++) {
        var food = {};
        food.x = PasInf.food[i].x;
        food.y = PasInf.food[i].y;
        food.intake = PasInf.food[i].intake;
        food.color = this.colornum;
        food.id = uuid.v1();
        returnfood.push(food);
        AllFood.push(food);
      }
      socket.emit('CrashToFood',JSON.stringify(returnfood))
    });
    socket.on('EditSelf',function(data) {
      socket.broadcast.emit('EditOther',data)
    });

    socket.on('insert', function(data) {
      var insertData = JSON.parse(data);
      var Actid = insertData.actid;
      socket.broadcast.emit('insert_pas', data);
      // socket.broadcast.emit('insert_act', Actid);
    });
  });
});

http.listen(2222, function(){
  console.log('listening on *:2222');
});