const socket = io("/")

const videoGrid = document.getElementById("video-grid")
const myVideo = document.createElement("video")
myVideo.muted = true
const myPeer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3000",//same as your localhosthost port

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




function hideCam() {
    const videoTrack = userStream.getTracks().find(track => track.kind === "video")
    if (videoTrack.enabled) {
        videoTrack.enabled = false
        this.innerHTML = "Show Cam"
    }
    else {
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
socket.on("user-disconnect", (userId) => {
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