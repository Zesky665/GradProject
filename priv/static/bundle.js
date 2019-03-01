var p = new SimplePeer({ trickle: false })
 
p.on('error', function (err) { console.log('error', err) })
 
p.on('signal', function (data) {
  console.log('SIGNAL', JSON.stringify(data))
  document.querySelector('#outgoing').textContent = JSON.stringify(data)
})
 
document.querySelector('form').addEventListener('submit', function (ev) {
  ev.preventDefault()
  p.signal(JSON.parse(document.querySelector('#incoming').value))
})

function hasUserMedia() { 
  //check if the browser supports the WebRTC 
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || 
     navigator.mozGetUserMedia); 
}

document.getElementById('connect-btn').addEventListener('click', function (e){
  e.preventDefault();
  if(hasUserMedia()){
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
    || navigator.mozGetUserMedia; 
  
  //enabling video and audio channels 
  navigator.getUserMedia({ video: true, audio: false }, function (stream) { 
      var video = document.querySelector('#local'); 
    
      //inserting our stream to the video tag     
      video.srcObject = stream;
    }, function (err) {})
  } else { 
    alert("WebRTC is not supported"); 
  }
});

function hasUserMedia() { 
  //check if the browser supports the WebRTC 
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || 
     navigator.mozGetUserMedia); 
}

p.on('connect', function () {
  console.log('CONNECT')

  function hasUserMedia() { 
    //check if the browser supports the WebRTC 
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || 
       navigator.mozGetUserMedia); 
 } 
 
 if (hasUserMedia()) { 
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
       || navigator.mozGetUserMedia; 
     
    //enabling video and audio channels 
    navigator.getUserMedia({ video: true, audio: false }, function (stream) { 
       var video = document.querySelector('#local'); 
     
       //inserting our stream to the video tag     
       video.srcObject = stream;
       p.addStream(stream); 
    }, function (err) {}); 
 } else { 
    alert("WebRTC is not supported"); 
 }
  p.send('whatever' + Math.random())

})
 
p.on('data', function (data) {
  console.log('data: ' + data)
})

p.on('stream', function (stream) {
  var video = document.querySelector('#remote'); 
     
       //inserting our stream to the video tag     
      video.srcObject = stream;
      
})