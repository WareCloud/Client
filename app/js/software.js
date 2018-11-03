/*
 * The Software class
 * Manage the softwares
 * Manage the calls to the API and the display
 */
var SoftwareManager =
{
    softwares: [],

    /*
     * Store a software
     * @param json software (the software's json object)
     */
    addSoftware: function(soft)
    {
        this.softwares[soft.id] = soft;
    },

    /*
     * Get the the details of a specified software
     * If the id parameter is not present, return all the softwares' details
     * @param int id (the software's id)
     * @return json
     */
    getSoftware: function(id = null)
    {
        if (id === null)
            return this.softwares;

        if (this.softwares[id] !== undefined)
            return this.softwares[id];

        return null;
    },

    searchSoftwares: function(str = null)
    {
        var search_softs = [];
        if (str === null)
            return this.softwares;
        this.softwares.forEach(soft => {
            if (soft.name.search(str) !== -1 || soft.name.toLowerCase().search(str) !== -1 || soft.name.toUpperCase().search(str) !== -1)
                search_softs[soft.id] = soft;
        });
        return search_softs;
    },

    /*
     * Remove the specified software
     * @param json soft (software's json object)
     */
    deleteSoftware: function(soft)
    {
        delete this.softwares[soft.id];
    }
};
