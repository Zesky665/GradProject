import {Socket, Presence} from "phoenix"

let video = new Socket("/socket", {params: {id: window.current_user_id}})

video.connect();
let channelCornerId = window.channelCornerId
let userid = window.current_user_id
var presences = {};
var init;
var offers = [];
var lps = [];
var rps = [];
var localStream;

const localVideo = document.querySelector("#localVideo");

const videoR1 = document.querySelector('#OneR');
const videoR2 = document.querySelector('#TwoR');
const videoR3 = document.querySelector('#ThreeR');

const videoL1 = document.querySelector('#OneL');
const videoL2 = document.querySelector('#TwoL');
const videoL3 = document.querySelector('#ThreeL');

var connected = false; 

// ,{ "urls": 'turn:homeo@turn.bistri.com:80', credential: 'homeo'}

let servers = {
  "iceServers": [{
    "urls": "stun2.l.google.com:19302"
  }]
};
let config = {
  iceServers: [ { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'turn:turn.bistri.com:80', credential: 'homeo', username: 'homeo' }] 
};

function gotMedia(stream){
  console.log('Localstream exists');
  console.log(stream);
  localStream = stream;
  let L1 = new SimplePeer({ initiator: true, trickle: true, stream: localStream, config: config, offerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: true } })
  let L2 = new SimplePeer({ initiator: true, trickle: true, stream: localStream, config: config, offerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: true } })
  let L3 = new SimplePeer({ initiator: true, trickle: true, stream: localStream, config: config, offerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: true } })

  lps = [L1, L2, L3];

  L1.on('signal', function(data){
    console.log(data);
    offers[0] = data;
  })
  
  L2.on('signal', function(data){
    console.log(data);
    offers[1] = data;
  })
  
  L3.on('signal', function(data){
    console.log(data);
    offers[2] = data;
  })

  L1.on('stream', function(stream){

    console.log('Remote stream exists');
    console.log(stream);
    console.log('Video1 is present  = ' + (videoL1 == null));
    //console.log(data);
    videoL1.srcObject = stream;
    videoL1.setAttribute("style", "display: block");
    videoL1.pause()
  })
  
  L2.on('stream', function(stream){
    const videoL2 = document.querySelector('#TwoL');

    console.log('Remote stream exists');
    console.log(stream);
    console.log('Video2 is present  = ' + (videoL2 == null));
    //console.log(data);
    videoL2.srcObject = stream;
    videoL2.setAttribute("style", "display: block");
    videoL2.pause()
  })
  
  L3.on('stream', function(stream){
    const videoL3 = document.querySelector('#ThreeL');

    console.log('Remote stream exists');
    console.log(stream);
    console.log('Video3 is present  = ' + (videoL3 == null));
    //console.log(data);
    videoL3.srcObject = stream;
    videoL3.setAttribute("style", "display: block");
    videoL3.pause()
  })
  
}


// Now that you are connected, you can join channels with a topic:

if (channelCornerId) {

  // Now that you are connected, you can join channels with a topic:
  let corner_channel = video.channel(`webrtc:`, {user_id: window.current_user_id})
  let private_channel = video.channel(`private:${userid}`)

  corner_channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })

  private_channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })
  
  private_channel.on(`offer`, (message) => {
    console.log('This works');
    getAnswer(message);
  });

  private_channel.on(`answer`, (message) => {
    console.log('This works');
    setAnswer(message);
  });

  corner_channel.on(`corner:${channelCornerId}:new_message`, (message) => {
    console.log("message", message)
    renderMessage(message)
  });

  corner_channel.on("presence_state", state => {
    
    presences = Presence.syncState(presences, state)
    console.log(state)
    var result = Object.values(presences);

    //console.log(result);
    for(var i = 0;i < Object.keys(result).length;i++){
      var rez = result[i].metas[0].user_id;
      userid = parseInt(userid, 10);
      if(rez === userid) {
        init = result[i].metas[0].initiator;

        console.log('This users init ' + init);
        break;
      } 
    };
    navigator.getUserMedia({ video: true, audio: false }, gotMedia, function () {})

    //console.log('peers: \n' + peers + '\npeers');
    renderOnlineUsers(state)
  });

/*
  corner_channel.on("presence_diff", diff => {
    //private_channel.push('update', {message: "Hi"});
    presences = Presence.syncDiff(presences, diff)
    console.log(diff)
    console.log(presences)

    connect()
  
  });
*/

 const setAnswer = function(msg) {
  console.log("The local peers");
  console.log(lps);
  console.log("The remote peers");
  console.log(rps);
  switch(msg.peer){
    case 0:
      console.log("Answer 1 applied");
      lps[0].signal(JSON.parse(msg.message));
      break;
    case 1:
      console.log("Answer 2 applied");
      lps[1].signal(JSON.parse(msg.message));
      break;
    case 2:
      console.log("Answer 3 applied");
      lps[2].signal(JSON.parse(msg.message));
      break;
    default:
    console.log("Answer X applied");
    break;
  }

  lps[0].on('data', function (data) {
    console.log('data: ' + JSON.stringify(data))
  })

  lps[1].on('connect', function (data) {
    console.log('data: ' + JSON.stringify(data))
  })

  lps[2].on('connect', function (data) {
    console.log('data: ' + JSON.stringify(data))
  })
  
  lps[0].on('connect', function () {
    console.log('CONNECT')
    //console.log('whatever' + Math.random())
    //lps[0].addTrack(localStream)
  })

  lps[1].on('connect', function () {
    console.log('CONNECT')
    console.log('whatever' + Math.random())
    //lps[1].addTrack(localStream)
  })

  lps[2].on('connect', function () {
    console.log('CONNECT')
    console.log('whatever' + Math.random())
    //lps[2].addTrack(localStream)
  })

 }



 const getAnswer = function(msg) {

  let R1 = new SimplePeer({ initiator: false, trickle: false, stream: localStream, config: config, answerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: true } })
  let R2 = new SimplePeer({ initiator: false, trickle: false, stream: localStream, config: config, answerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: true } })
  let R3 = new SimplePeer({ initiator: false, trickle: false, stream: localStream, config: config, answerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: true } })

  rps = [R1, R2, R3];

  switch(msg.init){
    case 1:
      R1.signal(JSON.parse(msg.message));
      break;
    case 2:
      R2.signal(JSON.parse(msg.message));
      break;
    case 3:
      R3.signal(JSON.parse(msg.message));
      break;
    default:
      console.log('There is some problem');
      break;
   }
  
  R1.on('signal', function(data){
    console.log(data);
    var message = JSON.stringify(data);
    private_channel.push('answer', {message: message, peer: msg.peer, recipient: msg.recipient, sender: msg.sender});
  })
  
  R2.on('signal', function(data){
    console.log(data);
    var message = JSON.stringify(data);
    private_channel.push('answer', {message: message, peer: msg.peer,  recipient: msg.recipient, sender: msg.sender});
  })
  
  R3.on('signal', function(data){
    console.log(data);
    var message = JSON.stringify(data);
    private_channel.push('answer', {message: message, peer: msg.peer,  recipient: msg.recipient, sender: msg.sender});
  })

  R1.on('stream', function(stream){
    console.log('Stream in 1');
    videoR1.srcObject = stream;
    videoR1.setAttribute("style", "display: block"); 
    videoR1.pause()
  })
  
  R2.on('stream', function(stream){
    console.log('Stream in 2');
    videoR2.srcObject = stream;
    videoR2.setAttribute("style", "display: block");
    videoR2.pause()
  })
  
  R3.on('stream', function(stream){
    console.log('Stream in 3');
    videoR3.srcObject = stream;
    videoR3.setAttribute("style", "display: block");
    videoR3.pause()
  }) 
  
  }

 const connect = function(ev) {
   connected = true;
  console.log('clicked');
    if(ev != null){ev.preventDefault()}
    console.log('peer offers : \n');
    //console.log(offers);
    var result = Object.values(presences);
 for(var i = init-1, n = 0;i < Object.keys(result).length;i++){
   var rec = result[Object.keys(result).length - i - 1].metas[0].user_id;
   userid = parseInt(userid, 10);
   console.log('This ' + i);
   if(rec != userid) {
    //var signal = peers[rez-1];
    //console.log('This signal ' + signal);
    
    console.log(offers[n]);
    let message = JSON.stringify(offers[n]);
    console.log(message);
    private_channel.push('offer', {message: message, peer: n, init: init, recipient: rec, sender: userid});
    n++;
   }; 
 };
  localVideo.srcObject = localStream;
  localVideo.play();
 };

 const call = function(ev) {
  console.log('clicked');
  ev.preventDefault()
  videoL1.play();
  videoL2.play();
  videoL3.play();
  videoR1.play();
  videoR2.play();
  videoR3.play();
  console.log(connected);
};

 const hangup = function(ev) {
  console.log('clicked');
  ev.preventDefault()
  videoL1.pause(); videoL1.destroy();
  videoL2.pause(); videoL2.destroy();
  videoL3.pause(); videoL3.destroy();
  videoR1.pause();
  videoR2.pause();
  videoR3.pause();
};

 document.querySelector('.connect').addEventListener('click', connect);
 
 document.querySelector('.call').addEventListener('click', call );

 document.querySelector('.hangup').addEventListener('click', hangup );

const renderOnlineUsers = function(presences) {
  let onlineUsers = Presence.list(presences, (_id, {metas: [user, ...rest]}) => {
    return onlineUserTemplate(user);
  }).join("")
  //console.log(presences)
  document.querySelector("#online-users").innerHTML = onlineUsers;
}

const onlineUserTemplate = function(user) {
  return `
    <div id="online-user-${user.user_id}">
      <strong class="text-secondary">${user.username}:${user.initiator}</strong>
    </div>
  `
}
};


export default video;
