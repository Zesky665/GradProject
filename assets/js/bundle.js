import {Socket, Presence} from "phoenix"

let socket = new Socket("/socket", {params: {id: window.current_user_id}})

socket.connect();
let channelCornerId = window.channelCornerId
let userid = window.current_user_id
var presences = {};
var init;
var offers = [];
var lps = [];
var rps = [];
var localStream;
const video1 = document.querySelector('#one');
const video2 = document.querySelector('#two');
const video3 = document.querySelector('#three');

let servers = {
  "iceServers": [{
    "url": "stun:stun.example.org"
  }]
};

function gotMedia(stream){
  localStream = stream;
  let L1 = new SimplePeer({ initiator: true, trickle: false, stream: stream, trickle: false, offerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false } })
  let L2 = new SimplePeer({ initiator: true, trickle: false, stream: stream, trickle: false, offerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false } })
  let L3 = new SimplePeer({ initiator: true, trickle: false, stream: stream, trickle: false, offerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false } })

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
}


// Now that you are connected, you can join channels with a topic:

if (channelCornerId) {

  // Now that you are connected, you can join channels with a topic:
  let corner_channel = socket.channel(`webrtc:`, {user_id: window.current_user_id})
  let private_channel = socket.channel(`private:${userid}`)

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

    //console.log('peers: \n' + peers + '\npeers');
    renderOnlineUsers(state)
  });


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


  lps[0].on('connect', function () {
    console.log('CONNECT')
    //console.log('whatever' + Math.random())
    //rps[0].send('data' + Math.random());
  })

  lps[1].on('connect', function () {
    console.log('CONNECT')
    console.log('whatever' + Math.random())
    //rps[1].send('data' + Math.random());
  })

  lps[2].on('connect', function () {
    console.log('CONNECT')
    console.log('whatever' + Math.random())
    //rps[2].send('data' + Math.random());
  })

 }



 const getAnswer = function(msg) {

  let R1 = new SimplePeer({ initiator: false, trickle: false, stream: localStream, trickle: false, answerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false } })
  let R2 = new SimplePeer({ initiator: false, trickle: false, stream: localStream, trickle: false, answerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false } })
  let R3 = new SimplePeer({ initiator: false, trickle: false, stream: localStream, trickle: false, answerConstraints: { offerToReceiveAudio: true, offerToReceiveVideo: false } })

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
  }

 document.querySelector('.connect').addEventListener('click', function (ev) {
     console.log('clicked');
    ev.preventDefault()

    navigator.getUserMedia({ video: false, audio: true }, gotMedia, function () {})

    console.log('peer offers : \n');
    //console.log(offers);

  });

  document.querySelector('.call').addEventListener('click', function (ev) {
    console.log('clicked');
   ev.preventDefault()

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
 });

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


export default socket;