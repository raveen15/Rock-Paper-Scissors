//Variables declared for connection to server and with index.html
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
choices = [];

//Uses server port 5000 to connect
server.listen(process.env.PORT || 5000);
console.log('Server running...'); //Successful connection would display this in command prompt

//Connects with index.html
app.get('/', function(rer, res) {
    res.sendFile(__dirname + '/index.html')
});

//Everything within this function is run when player is connected to server
io.sockets.on('connection', function(socket) {
    //Displays the amount of players connected to the server
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    //Displays the amount of playesconners dicted to the server
    socket.on('disconnect', function(data) {
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1)
        io.emit('disconnected', socket.username);
        console.log('Disconnected: %s sockets connected', connections.length);    
    });
    //Adds username to server, if 2 players are connected, then game starts
    socket.on('add user', function(data, callback) {
        socket.username = data;

        if(users.indexOf(socket.username) > -1)
        {
            callback(false);
        }
        else
        {
            users.push(socket.username);
            updateUsernames();
            callback(true);

            if (Object.keys(users).length == 2)
            {
                io.emit('connected', socket.username);
                io.emit('game start');
            }
        }
    });

    //The below contains the entire code of game calculations, checking whether player 1 or
    //or player two has one. We even show if it is a tie as well
    socket.on('player choice', function (username, choice) {
        choices.push({'user': username, 'choice': choice});
        console.log('%s chose %s.', username, choice);
        
        if(choices.length == 2) 
        {
            console.log('[socket.io] Both players have made choices.');

            switch (choices[0]['choice'])
            {
                case 'rock':
                    switch (choices[1]['choice'])
                    {
                        case 'rock': 
                            io.emit('tie', choices);
                            break;

                        case 'paper':
                            io.emit('player 2 win', choices);               
                            break;
        
                        case 'scissors':
                            io.emit('player 1 win', choices);
                            break;

                        default:
                            break;
                    }
                    break;

                case 'paper':
                    switch (choices[1]['choice'])
                    {
                        case 'rock':
                            io.emit('player 1 win', choices);     
                            break;

                        case 'paper':
                            io.emit('tie', choices);
                            break;
        
                        case 'scissors':
                            io.emit('player 2 win', choices);
                            break;

                        default:
                            break;
                    }
                break;

                case 'scissors':
                    switch (choices[1]['choice'])
                    {
                        case 'rock':
                            io.emit('player 2 win', choices);    
                            break;

                        case 'paper':
                            io.emit('player 1 win', choices); 
                            break;
        
                        case 'scissors':
                            io.emit('tie', choices);
                            break;

                        default:
                            break;
                    }
                    break;

                default:
                    break;
            }

            choices = [];
        }
    });

    //Updates users' username 
    function updateUsernames() {
        io.sockets.emit('get user', users);
    }
});