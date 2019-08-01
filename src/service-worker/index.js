/* global self, Response */

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
  if (data === 'wake') {
    getPreparedNode()
    return
  }
  (await getPreparedNode()).pubsub.publish('chat', Buffer.from(data))
})

// Activate service worker
self.addEventListener('activate', (event) => {
  getPreparedNode().catch((err) => console.log(err))
  event.waitUntil(self.clients.claim())
})

async function getPreparedNode () {
  if (ipfsNode) return ipfsNode
  ipfsNode = await node.get()
  ipfsNode.pubsub.subscribe('chat', handleMessageReceived)
  ipfsNode.pubsub.subscribe('chat:receipt', handleReceiptReceived)

  ipfsNode.id().then(({ id }) => {
    peerId = id
  })
}
