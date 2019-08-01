navigator.serviceWorker.getRegistration().then(registration => {
  if (!registration || !navigator.serviceWorker.controller) {
    navigator.serviceWorker.register('/service-worker.js').then(function () {
      onWorkerReady()
    })
  } else {
    onWorkerReady()
  }
})

function onWorkerReady () {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type) addItem(event.data)
  })
  navigator.serviceWorker.controller.postMessage('wake')
}

function addItem (data) {
  const item = document.createElement('li')
  item.innerText = JSON.stringify(data)
  document.getElementById('out').prepend(item)
}

const msg = document.getElementById('msg')
function sendMessage () {
  navigator.serviceWorker.controller.postMessage(msg.value)
  msg.value = ''
}
document.getElementById('send').addEventListener('click', sendMessage)
