
var apiManager =
{
  host : "163.5.84.202",

  api_endpoint : this.host + "/api",
  user_endpoint : this.api_endpoint + "/user",
  login_endpoint : this.user_endpoint + "/login",
  conf_endpoint : this.api_endpoint + "/configuration",
  soft_endpoint : this.api_endpoint + "/software",

  login : "admin",
  password : "admin",

  user : null,

  xdr : getXdr,

  send_request : function ()
  {
  },

  connect : connectApi,
  downloadSoftware : downloadSoftwareApi,
  downloadConfiguration : downloadConfigurationApi,
  getSoftwares : getSoftwaresApi
}

function getSoftwaresApi()
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
            var softwares = json.data;
            console.log(softwares[0]);

            var container=document.getElementById("softwares");
            softwares.forEach(function(soft) {
                var software = document.createElement('a');
                software.innerHTML = soft.name; // Adds name
                software.href = soft.download_url; // Edit href link
                container.appendChild(software);
                var br = document.createElement('br');
                container.appendChild(br);
            });

    }, false);
    xhr.send(null);
}


function downloadConfigurationApi(id)
{
    if (this.user === null)
        return;

    var xhr = new this.xdr();
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

function downloadSoftwareApi(id)
{
    if (this.user === null)
        return;

    var xhr = new this.xdr();
    xhr.open("GET", "http://" + this.soft_endpoint + "/" + id);
    xhr.setRequestHeader("Authorization", "Bearer " + this.user.data.api_token);
    xhr.addEventListener("load", function(e)
    {
        console.log(e.target.responseText);

        // Parse Request
        var json = JSON.parse(e.target.responseText);

        // Check callback
        if (!json || (json && (json.hasOwnProperty('error') || !json.hasOwnProperty('data'))))
            console.log('Error: Download failed.');
        else
        {
            console.log('URL: ' + json.data.download_url);

          }
    }, false);
    xhr.send(null);
}

function connectApi ()
{
  var xhr = new this.xdr();
  xhr.open("POST", "http://" + this.login_endpoint);
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
      this.user = json;
      console.log('Hello ' + this.user.data.login);
    }
  }, false);
  xhr.send(JSON.stringify(
  {
    "login" : this.login,
    "password" : this.password,
  }));
}

function getXdr()
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
