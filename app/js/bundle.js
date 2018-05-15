/*
class Bundle {
    constructor(name, bundle)
    {
        this.name = name;
        this.bundle = bundle;
    }

    setName(name)
    {
        this.name = name;
    }

    setBundle(bundle)
    {
        this.bundle = bundle;
    }

    addBundle(soft, conf)
    {
        this.bundle.push({'software_id': soft.id, 'configuration_id': conf.id});
    }

    deleteBundle()
    {

    }

    download(agent)
    {
        for(var i = 0; i != this.size; i++)
        {
            agent.download(this.softs[i].link, this.softs[i].name);
        }
    }

    install(agent)
    {
        for(var i = 0; i != this.size; i++)
        {
            agent.install(this.softs[i].name);
        }
    }
}
*/

var BundleManager = {
    bundles: [],

    addBundle: function(bundle)
    {
        this.bundles[bundle.id] = bundle;
    },

    getBundle: function(id = null)
    {
        if (id === null)
            return this.bundles;

        if (this.bundles[id] !== undefined)
            return this.bundles[id];

        return null;
    },

    deleteBundle: function(bundle)
    {
        delete this.bundles[bundle.id];
    }
};

function CreateBundleButton()
{
    var count = 0;
    var elms = document.getElementById('softwareTable').getElementsByTagName("input");
    for (var i = 0; i < elms.length; i++){
        if (elms[i].checked == true)
            count++;
    }
    button = document.getElementById("CreateBundleButton");
    if (count > 1)
        button.style.background = '#26BCB5';
    else {
        button.style.background = '#D6E0F6';
    }
}
