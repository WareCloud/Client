/*
function Software(soft){
    this.id = soft.id;
    this.name = soft.name;
    this.icon_url = soft.icon_url;
    this.comment = soft.comment;
    this.vendor = soft.vendor;
    this.vendor_url = soft.vendor_url;
    this.created_at = soft.created_at;
    this.download_url = soft.download_url;
    this.version = soft.version;
    console.log(this);

    this.setIcon = function(url) {
        this.icon_url = url;
    };

    this.getName = function(){
        return this.name;
    };
}
*/

var SOFTMANAGER =
{
    softwares: [],

    addSoftware: function(soft)
    {
        this.softwares[soft.id] = soft;
    },

    getSoftware: function(id)
    {
        if (this.softwares[id] !== undefined)
            return this.softwares[id];
        return null;
    },

    getSoftwareName: function(id)
    {
        if (this.softwares[id] !== undefined)
            return this.softwares[id].name;
        return null;
    },

    getSoftwares: function()
    {
        return this.softwares;
    },

    /*
    display: function()
    {
        this.softwares.forEach(function(soft){
            console.log(soft);
        });
    }
    */
};
