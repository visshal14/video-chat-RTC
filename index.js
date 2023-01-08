const express = require("express")
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io")(server)
const { v4: uuidV4 } = require('uuid')



app.set("view engine", "ejs")
app.use(express.static("public"))


const { ExpressPeerServer } = require("peer")
const peerServer = ExpressPeerServer(server, {
    cors: {
        origin: "*"
    },
    debug: true
})

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidV4()}`)
})


app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room })
})



io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnect", userId)
        })
    })

})

server.listen(3000, () => {
    console.log("server start at : 3000")
})
