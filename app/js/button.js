
function connectAgent()
{
    ip = "127.0.0.1"
    port = "8000"

    console.log("Connection to " + "wss://" + ip + ":" + port + "...");
      // Let us open a web socket
    var ws = new WebSocket("wss://" + ip + ":" + port);
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

function xdr()
  {
      var xdr = null;
      if (window.XDomainRequest)
          xdr = new XDomainRequest();
      else if (window.XMLHttpRequest)
          xdr = new XMLHttpRequest();
      else
              console.log("Module non compatible");
      return (xdr);
  }

function connectServer()
{
  console.log("Connection server....");
  var login = "admin";
  var password = "admin";
  var xhr = new xdr();
  xhr.open("POST", "http://192.168.1.105/api/user/login");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.addEventListener("load", function(e)
  {
      console.log(e.target.responseText);

      // Parse Request
      var json = JSON.parse(e.target.responseText);

      // Check callback
      if (json.hasOwnProperty('error') || !json.hasOwnProperty('data'))
          console.log('Login failed.');
      else
          console.log('Hello ' + json.data.login);
  }, false);
  xhr.send(JSON.stringify(
  {
      "login" : login,
      "password" : password,
  }));
}
