//const { PeerServer } = require("peer")

const socket = io("/")

const videoGrid = document.getElementById("video-grid")

// const screenGrid = document.getElementById("screen-grid")
const myVideo = document.createElement("video")
// const myScreen = document.createElement("video")
myVideo.muted = true
// socket.emit('join-room',ROOM_ID,10)
const myPeer = new Peer(undefined, {
    host: "/",
    // port:'3001' || process.env.PORT

})

const peers = {}
let userStream

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    userStream = stream
    addVideoStream(myVideo, stream)


    myPeer.on("call", call => {
        call.answer(stream)

        const video = document.createElement("video")

        call.on("stream", userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on("user-connected", userId => {
        connectToNewUser(userId, stream)
    })
})




function hideCam(){
    const videoTrack = userStream.getTracks().find(track=>track.kind==="video")
    if(videoTrack.enabled){
        videoTrack.enabled = false
        this.innerHTML = "Show Cam"
    }
    else{
        videoTrack.enabled = true
        this.innerHTML = "hide Cam"
    }
}






myPeer.on("open", id => {
    socket.emit("join-room", ROOM_ID, id)
})

socket.on("user-connected", userId => {
    console.log("user-connected" + userId)
})
socket.on("user-disconnect",(userId)=>{
    console.log("user disconnected :" + userId)
})
socket.on("user-disconnect", (userId) => {
    if (peers[userId]) {
        peers[userId].close()
    }
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement("video")
    call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on("close", () => {
        video.remove()
    })
    peers[userId] = call
}



function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener("loadedmetadata", () => {
        video.play()
    })
    videoGrid.append(video)
}