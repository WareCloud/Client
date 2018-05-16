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
    },

    createBundle: function()
    {
        var name = document.getElementById('BundleName').value;
        var bundles = [];

        [].forEach.call(document.getElementsByClassName('softwareElement'), function(software) {
            if (software.getElementsByTagName('input')[0].checked)
            {
                var softwareId = parseInt(software.getAttribute('soft-id'));
                var bundle = {'software_id': softwareId, 'configuration_id': null};
                [].forEach.call(document.getElementsByName('config-' + softwareId), function(configuration) {
                    if (configuration.getElementsByTagName('input')[0].checked && configuration.style.display !== 'none')
                        bundle['configuration_id'] = parseInt(configuration.getAttribute('config-id'));
                });
                bundles.push(bundle);
            }
        });

        API.postBundle(name, bundles);

        saveBundles();
        switchBundleMode(0);
        displayCreateBundleButton();
    },

    renameBundle: function(event)
    {
        var name = event.target.value;
        var bundleId = parseInt(event.target.parentNode.parentNode.getAttribute('bundle-id'));

        if (name === "")
            return;

        API.updateBundle(bundleId, name);
        saveBundles();
        switchBundleMode(0);
    }
};
