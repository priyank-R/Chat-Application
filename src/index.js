const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocation} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} =require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))


app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/index.html'))

})
// app.get('/chat',(req,res)=>{
//     res.sendFile(path.join(__dirname,'../public/chat.html'))
// })


io.on('connection',(socket)=>{


    socket.on('join',({username,room},callback)=>{
       const {error, user} = addUser({id:socket.id,username,room })
       if(error){
           return callback(error)
       }

        socket.join(user.room)

        socket.emit('message',generateMessage('Admin','Welcome !'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))

        io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})
        callback()
    })

   socket.on('sendMessage',(msg,callback)=>{
    const user = getUser(socket.id)
       const filter = new Filter()
       if(filter.isProfane(msg)){
           return callback('Profanity not allowed !')
       }
     

       io.to(user.room).emit('message',generateMessage(user.username,msg))
       callback()
   })

   socket.on('sendLocation',(coords,callback)=>{
       const user = getUser(socket.id)
       io.to(user.room).emit('locationMessage',generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
   })


   socket.on('disconnect',()=>{
       const user = removeUser(socket.id)
       if(user){
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
        io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})
       }
   })

})

server.listen(port,()=>{
    console.log('Server is up on: ',port)
})