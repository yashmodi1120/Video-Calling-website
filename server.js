const express = require('express') //using expressjs and importing it
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server) //socketio helps in real time communication
const { v4: uuidv4 } = require('uuid')  //uuid helps in giving us a unique id for the room
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
    debug: true
})

app.use('/peerjs',peerServer)

app.set('view engine','ejs') //changing viewengine to ejs, ejs helps in interaction of backend wuth frontend

app.use(express.static('public')) //importing the frontend


app.get('/',(req,res) => {
    res.redirect(`/${uuidv4()}`) //takes the unique id and redirects it to "/:room"
})

app.get('/:room',(req,res) =>{
    res.render('room',{ roomId : req.params.room })
})

io.on('connection',socket => {
    socket.on('join-room' , (roomId, userId) => {
        socket.join(roomId)
        io.to(roomId).emit('user-connected',userId) /* tells everyone in the room that a new user has joined */ 
        socket.on('message',message =>{
            io.to(roomId).emit('createMessage',message)
        })
        socket.on('disconnect',() => {
            io.to(roomId).emit('user-disconnected',userId)
        })
    })
})

server.listen(3000) //local host