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
    },

    renameBundle: function(event)
    {
        var name = event.target.value;
        var configurationId = parseInt(event.target.parentNode.parentNode.getAttribute('config-id'));

        if (name === "")
            return;

        API.updateConfiguration(configurationId, name);
        saveConfigurations();
        displayConfigurations();
        [].forEach.call(document.getElementsByClassName('softwareElement'), function(el) {
            if (el.getElementsByTagName('input')[0].checked)
            {
                document.getElementsByName('config-' + el.getAttribute('soft-id')).forEach(function (conf) {
                    conf.style.display = el.getElementsByTagName('input')[0].checked ? 'block' : 'none';
                });
            }
        });
    }
};
