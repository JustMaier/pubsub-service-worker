PubSub in an service worker with IPFS
===

This was a quick exploration into using pubsub inside of a service worker using IPFS.
[Here's a video demo](https://www.loom.com/share/c51dd3cb7f314b9c99eb8afa3aa12ea9)

## Bad news

It doesn't work very well. Service workers aren't designed for short bursts of work like `fetch` and `push`. Since PubSub doesn't trigger either of those events, the service worker goes to sleep and the IPFS node dies.

### Potential solutions

- Use `fetch` for publishing to pubsub. Downside, it still doesn't keep the node alive to receive messages...
- Use `push` to wake node and send pubsub messages. This would need to be built as an add-on for IPFS nodes so that peers could relay to sleeping service worker peers through nodes that have the `push` ability.