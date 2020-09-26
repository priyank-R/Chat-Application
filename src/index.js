const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocation} = require('./utils/messages')

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

    socket.emit('message',generateMessage('Welcome !'))

    socket.broadcast.emit('message',generateMessage('A new user has joined'))

   socket.on('sendMessage',(msg,callback)=>{
       const filter = new Filter()
       if(filter.isProfane(msg)){
           return callback('Profanity not allowed !')
       }

       io.emit('message', generateMessage(msg))
       callback()
   })

   socket.on('sendLocation',(coords,callback)=>{
       io.emit('locationMessage',generateLocation(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
   })


   socket.on('disconnect',()=>{
       io.emit('message',generateMessage('A user has LEFT'))
   })

})

server.listen(port,()=>{
    console.log('Server is up on: ',port)
})