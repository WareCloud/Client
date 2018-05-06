class Bundle {
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
        this.softs = [];
    }

    addSoftware(soft)
    {
        this.softs.push(soft);
    }

    removeSoftware(soft)
    {
      for (i = 0; i != this.size; i++)
      {
        if (this.softs[i].id == soft.id)
        {
          this.softs = this.softs.splice(i);
        }
      }
    }

    download(agent)
    {
        for(i = 0; i != this.size; i++)
        {
            agent.download(this.softs[i].link, this.softs[i].name);
        }
    }

    install(agent)
    {
        for(i = 0; i != this.size; i++)
        {
            agent.install(this.softs[i].name);
        }
    }
}

var BUNDLEMANAGER = {
  bundles: [],

  createBundle: function(name)
  {
    this.bundles.push(new Bundle(this.bundles.length, name))
  },

  getBundle: function(id)
  {
    return this.bundles[id];
  }

};

function create_bundle()
{
  var count = 0;
  var elms = document.getElementById('softwareTable').getElementsByTagName("input");
  for (var i = 0; i < elms.length; i++){
    if (elms[i].checked == true)
      count++;
  }
  button = document.getElementById("create_bundle");
  if (count > 1)
    button.style.background = '#26BCB5';
  else {
    button.style.background = '#D6E0F6';
  }
}
