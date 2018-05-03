PACKET_ID = 1

class PacketId
{
     constructor(id, user, os, path, version, software)
     {
        this.id = id
        this.user = user
        this.os = os
        this.path = path
        this.version = version
        this.software = software
      }
}

class AgentManager {

      constructor() {
        this.list = []
      }

      Add(agent) {
        this.list.add(agent);
      }

      GetSize(){ return this.list.length}

      GetConnected() {
        var connected = 0
        for (var i = 0; i < this.list.length; i++) {
          if (this.list[i].connected == true) {
              connected++
          }
        }
        return connected
      }
}

class Agent {
    constructor(id, ip, port) {
      this.id = id;
      this.ip = ip;
      this.port = port;
      this.ws = null;
     }

     connect()
     {
       this.ws instanceof WebSocket;
       this.ws = new WebSocket('ws://' + this.ip + ':' + this.port);
       this.ws.onopen = function() {
         this.connected = true

       };

        this.ws.onmessage = function (evt){
               var received_msg = evt.data;
               console.log("ws.onmessage: " + received_msg)
               /* On s'envoit/ Recoit du JSON */
               var object = JSON.parse(received_msg)
               /* PacketIdentification */
               if (object.id == PACKET_ID) {
                 let l_Identification = new PacketId(object.id, object.user, object.os, object.path, object.version, object.software)
                 console.log("Response is : " + JSON.stringify(l_Identification))
               }
             };

        this.ws.onclose = function(){
            // websocket is closed.
            console.log("ws.onclose: ")
          };
    }

    createRequest(request, soft, link)
    {
      var result = {id_agent:this.id, "request":request, "software":soft, "link":link};
      return JSON.stringify(result);
    }

    install(name)
    {
      this.send(createRequest("install", name, null));
    }

    download(link, name)
    {
      this.send(createRequest("download", name, link))
    }

    uninstall(link, name)
    {
      this.send(createRequest("uninstall", name, link))
    }

    autodelete()
    {
      this.send(createRequest("autodelete", null, null))
    }

    send(message)
    {
      if (this.ws != null)
      {
        this.ws.send(message);
        console.log("Message sent:" + message);
      }
    }

    close()
    {
        console.log("Closing....");
        this.ws.close();
    }
}
