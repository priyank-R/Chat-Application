const socket = io()

//Elements
const $msgForm = document.querySelector('#msgForm')
const $msgInput = $msgForm.querySelector('input')
const $msgFormButton = $msgForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML


$msgForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const msg = e.target.elements.msgText.value

    $msgFormButton.setAttribute('disabled', 'disabled')
    $msgInput.value=''
    $msgInput.focus()

    socket.emit('sendMessage', msg, (error) => {
        $msgFormButton.removeAttribute('disabled', 'disabled')
        if (error) {
            return console.log(error)
        }
        console.log('The message was delivered successfully')
    })
})

socket.on('message', (msg) => {
    console.log(msg)

    const html = Mustache.render($messageTemplate,{message:msg.text})
    $messages.insertAdjacentHTML('beforeend',html)

})

socket.on('locationMessage',(url)=>{
    const html = Mustache.render($locationTemplate,{url})
    $messages.insertAdjacentHTML('beforeend',html)
})

$sendLocationButton.addEventListener('click', () => {

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
            $sendLocationButton.removeAttribute('disabled','disabled')
            console.log('Location shared')
        })
    })
})