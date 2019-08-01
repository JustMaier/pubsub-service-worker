/* global self, Response */

import { createProxyServer } from 'ipfs-postmsg-proxy'
import { Buffer } from 'ipfs'
import * as node from './node'

let ipfsNode
let peerId

function postMessage (data) {
  self.clients.matchAll().then((clients) => {
    clients.forEach(client => client.postMessage(data))
  })
}
function emit (type, payload) {
  postMessage({ type, payload })
}
async function handleMessageReceived ({ from, data: dataBuffer }) {
  const msg = dataBuffer.toString()
  emit({ type: 'chat', payload: { msg, from } })

  if (from === peerId) return
  ipfsNode.pubsub.publish('chat:receipt', Buffer.from('received'))
}
function handleReceiptReceived ({ from }) {
  emit({ type: 'chat:receipt', payload: { from } })
}

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

// Handle chat requests
self.addEventListener('message', async ({ data }) => {
  if (ipfsNode) ipfsNode.pubsub.publish('chat', Buffer.from(data))
})

// Activate service worker
self.addEventListener('activate', (event) => {
  node.get().then((node) => {
    ipfsNode = node
    ipfsNode.pubsub.subscribe('chat', handleMessageReceived)
    ipfsNode.pubsub.subscribe('chat:receipt', handleReceiptReceived)

    ipfsNode.id().then(({ id }) => {
      peerId = id
    })
  }).catch((err) => console.log(err))

  event.waitUntil(self.clients.claim())
})

createProxyServer(() => ipfsNode, {
  addListener: self.addEventListener && self.addEventListener.bind(self),
  removeListener: self.removeEventListener && self.removeEventListener.bind(self),
  postMessage
})
