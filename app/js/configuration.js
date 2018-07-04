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

    deleteConfiguration: function(configurationId)
    {
        delete this.configurations[configurationId];
        API.deleteConfiguration(configurationId);
        saveConfigurations();
        displayConfigurations();

        [].forEach.call(document.getElementsByClassName('softwareElement'), function(el) {
            if (el.getElementsByTagName('input')[0].checked)
            {
                document.getElementsByName('config-' + el.getAttribute('soft-id')).forEach(function(conf) {
                    conf.style.display = el.getElementsByTagName('input')[0].checked ? 'block' : 'none';
                });
            }
        });
    },

    renameConfiguration: function(configurationId, name)
    {
        if (name === '')
            return;

        API.updateConfiguration(configurationId, name);
        saveConfigurations();
        displayConfigurations();
        [].forEach.call(document.getElementsByClassName('softwareElement'), function(el) {
            if (el.getElementsByTagName('input')[0].checked)
            {
                document.getElementsByName('config-' + el.getAttribute('soft-id')).forEach(function(conf) {
                    conf.style.display = el.getElementsByTagName('input')[0].checked ? 'block' : 'none';
                });
            }
        });
    }
};
