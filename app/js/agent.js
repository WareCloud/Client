

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

         /* Test between Agent / Client */
         /* install FirefoxInstaller */
         this.send("install FirefoxInstaller");

         // Web Socket is connected, send data using send()
         //this.ws.send("Message to send");
         //console.log("ws.onopen: Message is sent...");
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
