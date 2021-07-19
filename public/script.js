const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

var peer = new Peer(undefined,{
    path: 'peerjs',
    host: '/',
    port: '3000'
})

/* get user media allows chorme to access video and audio*/
let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    myVideoStream = stream;
    addVideoStream(myVideo,stream)
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    })
})

/* answering the call */ 
peer.on('call', (call) => {
    navigator.mediaDevices.getUserMedia({
        video:true,
        audio:true
    }).then((stream) =>{
        myVideoStream = stream;
        call.answer(stream)
        const video = document.createElement('video')
        console.log("answer");
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-disconnected',userId =>{
    if(peers[userId]) 
        peers[userId].close()
})

/*other person calling */
const connectToNewUser = (userId,stream) => {
    const call = peer.call(userId,stream);
    const video = document.createElement('video')
    console.log("calling");
    call.on('stream', userVideoStream => {
        addVideoStream(video,userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}


const addVideoStream = (video, stream) => {
    video.srcObject = stream //take the stream and play it
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

let text = $('input')


/* enter has key 13 */
/* socket .emit sends data and socket .on receives data */

$('html').keydown((e) =>{
    if(e.which == 13 && text.val().length != 0){
        socket.emit('message',text.val())
        //console.log(text.val())
        text.val('') 
    }
})

socket.on('createMessage', message =>{
    $('.messages').append(`<li class = "message"><b>user</b><br/>${message}</li>`)
    scrollToBottom()
})

const scrollToBottom = () => {
    let d = $('.main__chat__window');
    d.scrollTop(d.prop("scrollHeight"));
}


//muting the audio
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}
  
const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
}
const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}
  
const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}
