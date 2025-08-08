const http = require('http')
const { WebSocketServer } = require('ws')
const uuidv4 = require('uuid').v4
const url = require('url')

const server = http.createServer()
const ws = new WebSocketServer({ server })

const connections = {}
const users = {}

ws.on('connection', (connection, request) => {
  const { userName } = url.parse(request.url, true).query
  const uuid = uuidv4()

  connections[uuid] = connection

  users[uuid] = {
    username: userName || "annonymous",
    connectionTime: new Date().toISOString(),
  }

  connection.send(
    JSON.stringify({
      type: 'welcome',
      id: uuid,
      name: users[uuid].username,
      serverTime: new Date().toISOString(),
    })
  )

  broadcast(
    JSON.stringify({
      type: 'user-connected',
      id: users[uuid].userId,
      username: users[uuid].username,
      time: new Date().toISOString(),
    }),
    uuid
  )

  connection.on("message", (data)=>{
    try {
      const msg = JSON.parse(data.toString('utf8'))
      console.log(msg);
      

      connection.send(
        JSON.stringify({
          type: 'message-ack',
          tempId:msg.tempId,
          time: new Date().toISOString()
        })
      )

     broadcast(
       JSON.stringify({
         type: 'user-message',
         content: msg.text,
         username: users[uuid].username,
         userId: uuid,
         time: new Date().toISOString(),
       }),
       uuid
     )
    } catch (error) {
      console.error('Error parsing message:', error)
    }
  
  })

  connection.on("close", ()=>{
    console.log(`${users[uuid].username} disconnected`);
    
    broadcast(
      JSON.stringify({
        type: 'user-disconnected',
        userId: uuid,
        username: users[uuid].username,
        time: new Date().toISOString(),
      }),
      uuid
    )
    delete connections[uuid]
    delete users[uuid]
  })
  
  connection.on('error', (error)=>{
    console.log("Connection error:", error);
    connection.close()
  })
})

function broadcast(message, senderId) {
  Object.keys(connections).forEach((userId) => {
    if (userId != senderId && connections[userId].readyState === 1) {
      connections[userId].send(message)
    }
  })
}

const port = 3000
server.listen(port,'0.0.0.0', () => {
  console.log(`Websocket server listening on port ${port}`)
})

