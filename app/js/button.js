
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

var host = "192.168.1.105";

var api_endpoint = host + "/api";
var user_endpoint = api_endpoint + "/user";
var login_endpoint = user_endpoint + "/login";
var conf_endpoint = api_endpoint + "/configuration";
var soft_endpoint = api_endpoint + "/software";

var login = "admin";
var password = "admin";

var user = null;

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
    var xhr = new xdr();
    xhr.open("POST", "http://" + login_endpoint);
    xhr.setRequestHeader("Content-type", "application/json");
     xhr.addEventListener("load", function(e)
    {
        console.log(e.target.responseText);

        // Parse Request
        var json = JSON.parse(e.target.responseText);

        // Check callback
        if (!json || (json && (json.hasOwnProperty('error') || !json.hasOwnProperty('data'))))
            console.log('Error: Login failed.');
        else
        {
            user = json;
            console.log('Hello ' + user.data.login);
        }
    }, false);
    xhr.send(JSON.stringify(
    {
        "login" : login,
        "password" : password,
    }));
}

function downloadSoftware(id)
{
    if (user === null)
        return;

    var xhr = new xdr();
    xhr.open("GET", "http://" + soft_endpoint + "/" + id);
    xhr.setRequestHeader("Authorization", "Bearer " + user.data.api_token);
    xhr.addEventListener("load", function(e)
    {
        console.log(e.target.responseText);

        // Parse Request
        var json = JSON.parse(e.target.responseText);

        // Check callback
        if (!json || (json && (json.hasOwnProperty('error') || !json.hasOwnProperty('data'))))
            console.log('Error: Download failed.');
        else
            console.log('URL: ' + json.data.download_url);
    }, false);
    xhr.send(null);
}

function downloadConfiguration(id)
{
    if (user === null)
        return;

    var xhr = new xdr();
    xhr.open("GET", "http://" + conf_endpoint + "/" + id);
    xhr.setRequestHeader("Authorization", "Bearer " + user.data.api_token);
    xhr.addEventListener("load", function(e)
    {
        console.log(e.target.responseText);

        // Parse Request
        var json = JSON.parse(e.target.responseText);

        // Check callback
        if (json && json.hasOwnProperty('error'))
            console.log('Error: Download failed.');
        else
            console.log('Content: ' + e.target.responseText);
    }, false);
    xhr.send(null);
}

function getSoftwares()
{
    if (user === null)
        return;

    var xhr = new xdr();
    xhr.open("GET", "http://" + soft_endpoint);
    xhr.setRequestHeader("Authorization", "Bearer " + user.data.api_token);
    xhr.addEventListener("load", function(e)
    {
        console.log(e.target.responseText);

        // Parse Request
        var json = JSON.parse(e.target.responseText);

        // Check callback
        if (!json || (json && (json.hasOwnProperty('error') || !json.hasOwnProperty('data'))))
            console.log('Error: Failed to get softwares.');
        else
            console.log('Content: ' + e.target.responseText);
    }, false);
    xhr.send(null);
}
