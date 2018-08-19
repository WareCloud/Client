/*
 * The Configuration class
 * Manage the configurations
 * Manage the calls to the API and the display
 */
var ConfigurationManager = {
    configurations: [],

    /*
     * Store a configuration
     * @param json configuration (the configuration's json object)
     */
    addConfiguration: function(configuration)
    {
        this.configurations[configuration.id] = configuration;
    },

    /*
     * Get the the details of a specified configuration
     * If the id parameter is not present, return all the configurations' details
     * @param int id (the configuration's id)
     * @return json
     */
    getConfiguration: function(id = null)
    {
        if (id === null)
            return this.configurations;

        if (this.configurations[id] !== undefined)
            return this.configurations[id];

        return null;
    },

    /*
     * Remove the specified configuration
     * Send a delete request to the API
     * Refresh the display
     * @param int configurationId (the configuration's id)
     */
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

    /*
     * Rename a configuration
     * Send a request to the API to rename the configuration
     * Refresh the configurations' display
     * @param int configurationId (the configuration's id)
     * @param name (the new configuration name)
     */
    renameConfiguration: function(configurationId, name)
    {
        // Check that the new name is set
        if (name === '')
            return;

        // Send a request to the API
        API.updateConfiguration(configurationId, name);
        saveConfigurations();
        displayConfigurations();

        // Refresh the configurations' display
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
