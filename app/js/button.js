
let client = null; // node socket
let socketId; // chrome API socket id

function connectAgent()
{
    ip = "127.0.0.1"
    port = "8000"

    console.log("Connection to " + "ws://" + ip + ":" + port + "...");
      // Let us open a web socket
    var ws = new WebSocket("ws://" + ip + ":" + port);
    ws.onopen = function()
    {
       // Web Socket is connected, send data using send()
       ws.send("Message to send");
       console.log("ws.onopen: Message is sent...");

    };

    ws.onmessage = function (evt)
    {
       var received_msg = evt.data;
       console.log("ws.onmessage: " + received_msg)
    };

    ws.onclose = function()
    {
       // websocket is closed.
       alert("Connection is closed...");
       console.log("ws.onclose: ")
    };
}

function connectServer()
{
    ip = "127.0.0.1"
    port = "8000"

    console.log("Connection to " + "ws://" + ip + ":" + port + "...");
      // Let us open a web socket
    var ws = new WebSocket("ws://" + ip + ":" + port);
    ws.onopen = function()
    {
       // Web Socket is connected, send data using send()
       ws.send("Message to send");
       console.log("ws.onopen: Message is sent...");

    };

    ws.onmessage = function (evt)
    {
       var received_msg = evt.data;
       console.log("ws.onmessage: " + received_msg)
    };

    ws.onclose = function()
    {
       // websocket is closed.
       alert("Connection is closed...");
       console.log("ws.onclose: ")
    };
}
