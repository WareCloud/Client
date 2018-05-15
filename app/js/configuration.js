var ConfigurationManager = {
    configurations: [],

    addConfiguration: function(configuration)
    {
        this.configurations[configuration.id] = configuration;
    },

    getConfiguration: function(id = null)
    {
        if (id === null)
            return this.configurations;

        if (this.configurations[id] !== undefined)
            return this.configurations[id];

        return null;
    },

    deleteConfiguration: function(configuration)
    {
        delete this.configurations[configuration.id];
    }
};
