import {Socket, Presence} from "phoenix"

let socket = new Socket("/socket", {params: {id: window.current_user_id}})

socket.connect();
let channelCornerId = window.channelCornerId
let userid = window.current_user_id
var presences = {};
var init;
var peersOffers = [];
var peersAnswers = [];
var peersIce = [];
let localStream;
const localVideo = document.querySelector('#localVideo');
const video1 = document.querySelector('#one');
const video2 = document.querySelector('#two');
const video3 = document.querySelector('#three');

let servers = {
  "iceServers": [{
    "url": "stun:stun.stunprotocol.org"
  }]
};

let pc1 = new RTCPeerConnection(servers);
let pc2 = new RTCPeerConnection(servers);
let pc3 = new RTCPeerConnection(servers);

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
    console.log('it works');
    console.log(message);
    getAnswer(message);
  });

  private_channel.on(`answer`, (message) => {
    console.log('it works too :)');
    console.log(message)
    takeAnswer(message);
  });

  private_channel.on(`ice_offer`, (message) => {
    console.log('ICE offer works too :)');
    console.log(message)
    takeIceCandidate(message.init ,message, false)
  });

  private_channel.on(`ice_answer`, (message) => {
    console.log('ICE answer works too :)');
    console.log(message)
    takeIceCandidate(message.peer ,message, true)
  });

  corner_channel.on(`corner:${channelCornerId}:new_message`, (message) => {
    console.log("message", message)
    renderMessage(message)
  });

  pc1.onicecandidate = function(event) {
    console.log("ICE CANDIDATE 1");
    if (event.candidate) {
      peersIce[0] = event.candidate;
    }
  };

  pc2.onicecandidate = function(event) {
    console.log("ICE CANDIDATE 2");
    if (event.candidate) {
      peersIce[1] = event.candidate;
    }
  };

  pc3.onicecandidate = function(event) {
    console.log("ICE CANDIDATE 3");
    if (event.candidate) {
      peersIce[2] = event.candidate;
    }
  };




  const takeIceCandidate = function(target, msg, type ) {
    //console.log(peersIce);
    //console.log('ice 0 ' + peersIce[0]);
    //console.log('ice 1 ' + peersIce[1]);
    //console.log('ice 2 ' + peersIce[2]);
    switch(target){
      case 1:  
        console.log('This is peer 1 ice candidate ' + msg.message);
        var candidate = new RTCIceCandidate(msg.message);
        pc1.addIceCandidate(candidate);
        //console.log('This is what the ice candidate looks like : ');
        //console.log(Object.keys(peersIce[msg.peer]));
        //console.log(Object.values(peersIce[msg.peer]));
        if(type == false){
          private_channel.push('ice_answer', {message: peersIce[msg.peer], peer: msg.peer, recipient: userid, sender: msg.sender});}
        break;
      case 2:  
        console.log(msg.message);
        var candidate = new RTCIceCandidate(msg.message);
        pc2.addIceCandidate(candidate);
        if(type == false){
          private_channel.push('ice_answer', {message: peersIce[msg.peer], peer: msg.peer, recipient: userid, sender: msg.sender});}
        break;
      case 3:  
        console.log(msg.message);
        console.log(peersIce[msg.peer]);
        var candidate = new RTCIceCandidate(msg.message);
        pc3.addIceCandidate(candidate);
        if(type == false){
          private_channel.push('ice_answer', {message: peersIce[msg.peer], peer: msg.peer, recipient: userid, sender: msg.sender});}
        break;
      default:
         console.log('This does not work \n');
         break;
    };
  };

  const takeAnswer = function(msg) {
    switch(msg.peer){
      case 1:  
      //console.log(Object.values(msg));
      //console.log(Object.keys(msg));
      console.log("This works 5 " + msg.message);
        pc1.setRemoteDescription(msg.message);
        break;
      case 2:  
      console.log("This works 6 " + msg.message);
        pc2.setRemoteDescription(msg.message);
        break;
      case 3:  
      console.log("This works 7 " + msg.message);
        pc3.setRemoteDescription(msg.message);
        break;
      default:
         console.log('This does not work \n');
         break;
    };
  };


  const getAnswer = function(msg) {
    switch(msg.init){
      case 1:  
      console.log(Object.values(msg));
      console.log(Object.keys(msg));
      console.log(msg.message);
        var desc = new RTCSessionDescription(msg.message);
        pc1.setRemoteDescription(desc);
        pc1.createAnswer().then(function(answer) {
          console.log('Peers 1 : \n');
          console.log(answer);
          //console.log(peersOffers[0]);
          return pc1.setLocalDescription(answer);
        })
        .then(function() {
          console.log('Send Peers 1 : \n');
          private_channel.push('answer', {message: pc1.localDescription, peer: msg.peer, recipient: userid, sender: msg.sender});
        })
        break;
      case 2:  
        var desc = new RTCSessionDescription(msg.message);
        pc2.setRemoteDescription(desc);
        pc2.createAnswer().then(function(answer) {
          console.log('Peers 1 : \n');
          console.log(answer);
          //console.log(peersOffers[0]);
          return pc2.setLocalDescription(answer);
        })
        .then(function() {
          console.log('Send Peers 2 : \n');
          private_channel.push('answer', {message: pc2.localDescription, peer: msg.peer, recipient: userid, sender: msg.sender});
        })
        break;
      case 3:  
        var desc = new RTCSessionDescription(msg.message);
        pc3.setRemoteDescription(desc);
        pc3.createAnswer().then(function(answer) {
          console.log('Peers 1 : \n');
          console.log(answer);
          //console.log(peersOffers[0]);
          return pc3.setLocalDescription(answer);
        })
        .then(function() {
          console.log('Send Peers 3 : \n');
          private_channel.push('answer', {message: pc3.localDescription, peer: msg.peer, recipient: userid, sender: msg.sender});
        })
        break;
      default:
         console.log('This does not work \n');
         break;
    };
  };

  const createOffers = function (init) {
    peersOffers = [];
    switch(init){
      case 1:  
        pc1.createOffer().then(function(offer) {
          console.log('Peers 1 : \n');
          console.log(offer);
          //peersOffers.push(offer.sdp);
          //console.log(peersOffers[0]);
          pc1.setLocalDescription(offer);
        })
        .then(function() {
          console.log('Send Peers 1 : \n');
          peersOffers.push(pc1.localDescription);
        })
        
      case 2:  
        pc2.createOffer().then(function(offer) {
          console.log('Peers 2 : \n');
          console.log(offer);
          //peersOffers.push(offer.sdp);
          pc2.setLocalDescription(offer);
        })
        .then(function() {
          console.log('Send Peers 2 : \n');
          peersOffers.push(pc2.localDescription);
        })
        
      case 3:  
        pc3.createOffer().then(function(offer) {
          console.log('Peers 3 : \n');
          console.log(offer);
          //peersOffers.push(offer.sdp);
          pc3.setLocalDescription(offer);
        })
        .then(function() {
          console.log('Send Peers 3 : \n');
          peersOffers.push(pc3.localDescription);
        })
        break;
      default:
         console.log('This does not work \n');
         break;
    };
    return true;
  };

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
        //createOffers(init);
        console.log('Done')
        break;
      } 
    };



    //console.log('peers: \n' + peers + '\npeers');
    renderOnlineUsers(state)
  });
  
  /*corner_channel.on("presence_diff", diff => {
    private_channel.push('update', {message: "Hi"});
    //presences = Presence.syncDiff(presences, diff)
    //console.log(diff)
    //console.log(presences)
    //renderOnlineUsers(state)
  });*/

 document.querySelector('.connect').addEventListener('click', function (ev) {
    
    console.log('clicked');
    ev.preventDefault()

    navigator.mediaDevices.getUserMedia({audio:true, video:false}).then(function(localStream){
      localVideo.srcObject = localStream;
      localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
      localStream.getTracks().forEach(track => pc2.addTrack(track, localStream));
      localStream.getTracks().forEach(track => pc3.addTrack(track, localStream));
    }).then(function(){
      createOffers(init);
    })

    
    console.log('peer offers : \n');
    console.log(peersOffers);
    var result = Object.values(presences);
    for(var i = init-1, n = 0;i < Object.keys(result).length;i++){
      var rec = result[Object.keys(result).length - i - 1].metas[0].user_id;
      userid = parseInt(userid, 10);
      console.log('This ' + i);
      if(rec != userid) {
       //var signal = peers[rez-1];
       //console.log('This signal ' + signal);
       
       //console.log(peersOffers);
       let message = peersOffers[n];
       n++;
       private_channel.push('offer', {message: message, peer: n, init: init, recipient: rec, sender: userid});
       
      }; 
    };
  });

  document.querySelector('.call').addEventListener('click', function (ev) { 
    ev.preventDefault();
    console.log(peersIce);

    var result = Object.values(presences);
    for(var i = init-1, n = 0;i < Object.keys(result).length;i++){
      var rec = result[Object.keys(result).length - i - 1].metas[0].user_id;
      userid = parseInt(userid, 10);
      console.log('This ice ' + i);
      console.log('This ice ' + message);
      if(rec != userid) {
       //var signal = peers[rez-1];
       //console.log('This signal ' + signal);
       
       //console.log(peersOffers);
       var message = peersIce[n];
       n++;
       private_channel.push('ice_offer', {message: message, peer: n, init: init, recipient: rec, sender: userid});
       
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


pc1.ontrack = function(event) {
  console.log("Track 1" + event.streams[0]);
  console.log(Object.values(event.streams[0]));
  video1.srcObject = event.streams[0];

};

pc2.ontrack = function(event) {
  console.log("Track  2" + event.streams[0]);
  console.log(Object.values(event.streams[0]));
  video2.srcObject = event.streams[0];

};

pc3.ontrack = function(event) {
  console.log("Track  3" + event.streams[0]);
  console.log(Object.values(event.streams[0]));
  video3.srcObject = event.streams[0];

};


export default socket;