import IPFS from 'ipfs'

let node

/* start a IPFS node within the service worker */
const start = () => new Promise((resolve, reject) => {
  node = new IPFS({
    EXPERIMENTAL: { pubsub: true },
    config: {
      Addresses: {
        Swarm: [
          '/ip4/127.0.0.1/tcp/9090/ws/p2p-websocket-star/'
        ]
      },
      Bootstrap: []
    }
  })

  node.on('error', (error) => reject(error))
  node.on('ready', () => resolve(node))
})

/* get a ready to use IPFS node */
export const get = async () => {
  if (node) return node
  return await start()
}
