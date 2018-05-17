var SoftwareManager =
{
    softwares: [],

    addSoftware: function(soft)
    {
        this.softwares[soft.id] = soft;
    },

    getSoftware: function(id = null)
    {
        if (id === null)
            return this.softwares;

        if (this.softwares[id] !== undefined)
            return this.softwares[id];

        return null;
    },

    deleteSoftware: function(soft)
    {
        delete this.softwares[soft.id];
    }
};
