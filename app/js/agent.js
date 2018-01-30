class Agent {
  constructor(id, ip, port) {
    this.id = id;
    this.ip = ip;
    this.port = port;
    this.ws = null;
   }

  connect(){
    this.ws instanceof WebSocket;
    this.ws = new WebSocket('ws://' + this.ip + ':' + this.port);
    this.ws.onopen = function()
      {
     // Web Socket is connected, send data using send()
      this.send("Toto est là");
  //     this.ws.send("Message to send");
  //   console.log("ws.onopen: Message is sent...");
    };
  this.ws.onmessage = function (evt){
   var received_msg = evt.data;
   console.log("ws.onmessage: " + received_msg)
    };
  this.ws.onclose = function(){
      // websocket is closed.
      alert("Connection is closed...");
      console.log("ws.onclose: ")
    };
  }
  send(message){
    if (this.ws != null)
    {
      this.ws.send(message);
      console.log("Message sent toto");
    }
  }
  close(){
      console.log("Closing....");
      this.ws.close();
  }
}
