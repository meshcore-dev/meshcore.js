import Connection from "./connection.js";

// Easy way to test this is to run `websocat -s 5000`

class WebSocketConnection extends Connection {

    constructor(url) {
        super();

        let self = this
        this.isClosing = false

        let socket = new WebSocket(url)
        socket.onopen = (event) => {
          //console.log("connected")
          this.onConnected();
        }
        socket.onerror = function(error) {
          //console.log(error);
          self.isClosing = true
          self.onDisconnected();
        }
        socket.onmessage = async function(event) {
          //console.log('got message', event.data)
          let buf = await event.data.arrayBuffer();
          self.onFrameReceived(buf);
        }
        socket.onclose = function() {
          if (!self.isClosing) {
            self.onDisconnected();
          }
        }
        this.socket = socket
    }

    static async open() {

        // ensure browser supports web bluetooth
        let url = prompt("Enter WebSocket URL", "ws://127.0.0.1:5000")
        if (url.startsWith("ws://") || url.startsWith("wss://")) {          
        } else {
          url = "ws://" + url
        }

        return new WebSocketConnection(url);
    }

    async close() {
        try {
          this.isClosing = true
          this.socket.close()
        } catch(e) {
          //console.log("close error", e)
          // ignore error when disconnecting
        }
    }

    async write(bytes) {
      try {
        this.socket.send(bytes)
      } catch(e) {
        console.log("failed to write to ble device", e);
      }
    }

    async sendToRadioFrame(frame) {
      this.emit("tx", frame);
      await this.write(frame);
    }

}

export default WebSocketConnection;
