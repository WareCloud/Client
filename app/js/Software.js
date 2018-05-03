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
    };

var SOFTMANAGER =
{
  softwares: [],

  addSoftware: function(soft)
  {
    var software = new Software(soft.id, soft.name);
    this.softwares[soft.id] = software;
  },

  getSoftware: function(id)
  {
    var result = this.softwares[id];
    return result;
  },

  getSoftwareName: function(id)
  {
    if (this.softwares[id])
      var name = this.softwares[id].getName();
    return name;
  },

  getSoftwares: function()
  {
    return this.softwares;
  },

  display: function()
  {
    this.softwares.forEach(function(soft){
      console.log(soft);
    });
  }
};
