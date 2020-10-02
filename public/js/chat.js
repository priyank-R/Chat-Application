const socket = io();

//Elements
const $msgForm = document.querySelector("#msgForm");
const $msgInput = $msgForm.querySelector("input");
const $msgFormButton = $msgForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector('#sidebar')

//Templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate = document.querySelector("#location-template")
  .innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true });

$msgForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msgText.value;

  $msgFormButton.setAttribute("disabled", "disabled");
  $msgInput.value = "";
  $msgInput.focus();

  socket.emit("sendMessage", msg, (error) => {
    $msgFormButton.removeAttribute("disabled", "disabled");
    if (error) {
      return console.log(error);
    }
    console.log("The message was delivered successfully");
  });
});


const autoscroll = ()=>{
  
    //New Message Element (The last message that was added)
    const $newMessage = $messages.lastElementChild

    //Height of the new message 
    const newMessageStyles = getComputedStyle($newMessage) //css styles
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin //total heigh of the msg

    //Visible height of the screen (messages element)
    const visibleHeight = $messages.offsetHeight

    //Total height (visible + scrollable) of messages div
    const containerHeight = $messages.scrollHeight

    //Where is our current scroll (How far down have we scrolled )
    const scrollOffset = $messages.scrollTop + visibleHeight //height scrolled from the top 
  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on("message", (msg) => {


  const html = Mustache.render($messageTemplate, {
    username:msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("hh:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
})
socket.on("locationMessage", (location) => {
  const html = Mustache.render($locationTemplate, {
    username: location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format("hh:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on('roomData',({room,users})=>{
  
 
  const html = Mustache.render($sidebarTemplate,{
    room,
    users
  })
  $sidebar.innerHTML = html
})

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled", "disabled");
     
      }
    );
  });
});

socket.emit('join',{username,room},(error)=>{
  if(error){
    alert(error)
    location.href="/"
  }
})