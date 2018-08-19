/*
 * The Bundle class
 * Manage the bundles
 * Manage the calls to the API and the display
 */
var BundleManager = {
    bundles: [],

    /*
     * Store a bundle
     * @param json bundle (the bundle's json object)
     */
    addBundle: function(bundle)
    {
        this.bundles[bundle.id] = bundle;
    },

    /*
     * Get the the details of a specified bundle
     * If the id parameter is not present, return all the bundles' details
     * @param int id (the bundle's id)
     * @return json
     */
    getBundle: function(id = null)
    {
        if (id === null)
            return this.bundles;

        if (this.bundles[id] !== undefined)
            return this.bundles[id];

        return null;
    },

    /*
     * Remove the specified bundle
     * Send a delete request to the API
     * Refresh the display
     * @param int bundleId (the bundle's id)
     */
    deleteBundle: function(bundleId)
    {
        delete this.bundles[bundleId];
        API.deleteBundle(bundleId);
        saveBundles();
        switchBundleMode(0);
    },

    /*
     * Create a bundle
     * Send a request to the API to create the bundle
     * Display the newly created bundle
     */
    createBundle: function()
    {
        var name = document.getElementById('BundleName').value;
        var bundles = [];

        // Get all the softwares and configurations associated to the bundle
        [].forEach.call(document.getElementsByClassName('softwareElement'), function(software) {
            if (software.getElementsByTagName('input')[0].checked)
            {
                var softwareId = parseInt(software.getAttribute('soft-id'));
                var bundle = {'software_id': softwareId, 'configuration_id': null};
                [].forEach.call(document.getElementsByName('config-' + softwareId), function(configuration) {
                    if (configuration.getElementsByTagName('input')[1].checked && configuration.style.display !== 'none')
                        bundle['configuration_id'] = parseInt(configuration.getAttribute('config-id'));
                });
                bundles.push(bundle);
            }
        });

        // Send a request to the API
        API.postBundle(name, bundles);

        // Refresh the bundles' display
        saveBundles();
        switchBundleMode(0);
        displayCreateBundleButton();
    },

    /*
     * Rename a bundle
     * Send a request to the API to rename the bundle
     * Refresh the bundles' display
     * @param int bundleId (the bundle's id)
     * @param name (the new bundle name)
     */
    renameBundle: function(bundleId, name)
    {
        // Check that the new name is set
        if (name === '')
            return;

        // Send a request to the API
        API.updateBundle(bundleId, name);
        saveBundles();
        switchBundleMode(0);
    }
};
