/*
 * The API Class
 * Defines the API communication protocol
 */

var API =
{
    api_protocol: 'https',
    api_host: 'api.warecloud.me',
    api_port: '',
    api_prefix: '',

    api_endpoints: {
        'get_user':         {endpoint: '/user',                 method: 'GET',      use_token: true,    json: true},
        'register':         {endpoint: '/user/register',        method: 'POST',     use_token: false,   json: true},
        'login':            {endpoint: '/user/login',           method: 'POST',     use_token: false,   json: true},
        'logout':           {endpoint: '/user/logout',          method: 'POST',     use_token: true,    json: true},
        'get_config':       {endpoint: '/configuration',        method: 'GET',      use_token: true,    json: false},
        'post_config':      {endpoint: '/configuration',        method: 'POST',     use_token: true,    json: true},
        'up_config':        {endpoint: '/configuration',        method: 'PUT',      use_token: true,    json: true},
        'del_config':       {endpoint: '/configuration',        method: 'DELETE',   use_token: true,    json: false},
        'get_soft':         {endpoint: '/software',             method: 'GET',      use_token: true,    json: true},
        'get_bundle':       {endpoint: '/bundle',               method: 'GET',      use_token: true,    json: true},
        'post_bundle':      {endpoint: '/bundle',               method: 'POST',     use_token: true,    json: true},
        'up_bundle':        {endpoint: '/bundle',               method: 'PUT',      use_token: true,    json: true},
        'del_bundle':       {endpoint: '/bundle',               method: 'DELETE',   use_token: true,    json: false},
        'post_suggestion':  {endpoint: '/softwaresuggestion',   method: 'POST',     use_token: true,    json: false},
        'post_bug':         {endpoint: '/bugreport',            method: 'POST',     use_token: true,    json: false},
        'update_password':  {endpoint: '/user/password',        method: 'POST',     use_token: true,    json: true}
    },

    // Contains the user informations
    user: null,

    xdr: function()
    {
        var xdr = null;
        if (window.XDomainRequest)
            xdr = new XDomainRequest();
        else if (window.XMLHttpRequest)
            xdr = new XMLHttpRequest();
        else
            console.log('Module non compatible');
        return (xdr);
    },

    /*
     * Returns the root url of the API (ex: https://api.warecloud.me)
     * @return string
     */
    getRootURL: function()
    {
        return (this.api_protocol + '://' + this.api_host + (this.api_port !== '' ? (':' + this.api_port) : '') + this.api_prefix);
    },

    /*
     * Send a request to the API
     * @param string action (see api_endpoints, ex: login)
     * @param string token (the user token to communicate with the API)
     * @param string param (the request parameters)
     * @param array data (the request data)
     * @return string (the API's response)
     */
    callAPI: function(action, token = null, param = null, data = null)
    {
        // Check that the action is present in api_endpoints
        if (this.api_endpoints[action] === undefined)
            return null;

        // Check if the action requires a token to communicate with the API
        var endpointInfos = this.api_endpoints[action];
        if (endpointInfos.use_token && token === null)
            return null;

        var xhr = new this.xdr();
        var api_url = this.getRootURL() + endpointInfos.endpoint;
        if (param !== null)
            api_url += '/' + param;

        xhr.open(endpointInfos.method, api_url, false);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');

        if (endpointInfos.use_token)
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);

        xhr.onreadystatechange = function()
        {
            return xhr.responseText;
        };

        // Send a request
        xhr.send(data);

        // Return the API's response
        return xhr.onreadystatechange();
    },

    /*
     * Parse the json's API response and check if the API returned errors
     * @param json jsonResult (the API's response)
     * @param string logName
     * @return json object
     */
    parseResult: function(jsonResult, logName = null)
    {
        // Check that the API returned content
        if (jsonResult === undefined || jsonResult === null)
        {
            if (logName !== null)
                console.log('[' + logName + '] ERROR: Failed to communicate with the API !');

            return {success: false, errors: {error: ['Failed to communicate with the API !']}};
        }

        // If the API returned an error, log it and return the error
        if (jsonResult.hasOwnProperty('error'))
        {
            if (logName !== null)
                console.log('[' + logName + '] ERROR: ' + jsonResult.error);

            return {success: false, errors: {error: [jsonResult.error]}};
        }

        // If the API returned errors, log them and return them
        if (jsonResult.hasOwnProperty('errors'))
        {
            if (logName !== null)
                for (var key in jsonResult.errors)
                    console.log('[' + logName + '] ERROR: ' + key + ' => ' + jsonResult.errors[key]);

            return {success: false, errors: jsonResult.errors};
        }

        // If the response doesn't contain data, return an "Unknown error"
        if (!jsonResult.hasOwnProperty('data') && Object.keys(jsonResult).length !== 0)
        {
            if (logName !== null)
                console.log('[' + logName + '] ERROR: Unknown error.');

            return {success: false, errors: {error: 'Unknown error.'}};
        }

        // Return a success status code and the associated json object containing the API's response
        return {success: true, data: jsonResult.data};
    },

    /*
     * Send a request to the API and return its content into a json object
     * @param string action (see api_endpoints, ex: login)
     * @param boolean verifyLogin (check that the user is logged in before sending the request)
     * @param logName
     * @param string token (the user token to communicate with the API)
     * @param string param (the request parameters)
     * @param array data (the request data)
     * @return string/json (the API's response)
     */
    getResult: function(action, verifyLogin = true, logName = null, token = false, param = null, data = null)
    {
        // Check that the action is present in api_endpoints
        if (this.api_endpoints[action] === undefined)
        {
            if (logName !== null)
                console.log('[' + logName + '] ERROR: Invalid endpoint !');

            return {success: false, errors: {error: 'Invalid endpoint !'}};
        }

        // Get the endpoint configuration
        var endpointInfos = this.api_endpoints[action];

        // Set the API's token
        if (token)
            var api_token = this.user !== null ? this.user.api_token : null;

        // Check if the request requires the user to be logged in
        if (verifyLogin && !this.isStillLoggedIn())
            return {success: false, errors: {error: 'Unauthenticated.'}};

        // Get the API's response
        var result = this.callAPI(action, api_token, param, data);
        if (result === null)
        {
            if (logName !== null)
                console.log('[' + logName + '] ERROR: Result is null !');

            // If the response doesn't contains data, return a result is null error
            return {success: false, errors: {error: 'Result is null.'}};
        }

        /*if (logName)
            console.log('RESULT => ' + result);*/

        // If the result is not a json object, return the content without parsing it into a json object
        if (!endpointInfos.json && param !== null)
            return {success: true, data: result};

        try {
            var jsonResult = JSON.parse(result);
        } catch (e) {
            console.error('Parsing error:', e);
            return {success: false, errors: {error: 'Failed to parse JSON result.'}};
        }

        var parsedResult = this.parseResult(jsonResult, logName);

        // Return the API's response into a json object
        return parsedResult;
    },

    /*
     * Send a register request to the API and return its result
     * @param string login (the user's login)
     * @param string password (the user's password)
     * @param string passwordConfirmation (the password confirmation)
     * @return json (the API's response)
     */
    register: function(login, password, passwordConfirmation)
    {
        var json = {'login': login, 'password': password, 'password_confirmation': passwordConfirmation};
        var result = this.getResult('register', false, 'REGISTER', false, null, JSON.stringify(json));

        if (result.success)
            this.user = result.data;

        return result;
    },

    /*
     * Send a login request to the API and return its result
     * @param string login (the user's login)
     * @param string password (the user's password)
     * @return json (the API's response)
     */
    login: function(login, password)
    {
        var json = {'login': login, 'password': password};
        var result = this.getResult('login', false, 'LOGIN', false, null, JSON.stringify(json));

        if (result.success)
            this.user = result.data;

        return result;
    },

   /*
    * Send a logout request to the API, remove the stored user informations and redirect the user to the login page
    * @param string login (the user's login)
    * @param string password (the user's password)
    * @param string passwordConfirmation (the password confirmation)
    * @return boolean (if the API successfully logged out the user)
    */
    logout: function()
    {
        this.user = null;
        return this.getResult('logout', true, 'LOGOUT', true);
    },

    /*
     * Send a request to the API to check if the user is still logged in
     * @return boolean (if the user is still logged in)
     */
    isStillLoggedIn: function()
    {
        if (this.user === null)
            return false;

        var result = this.getResult('get_user', false, null, true);
        if (result === null || result.success === false)
        {
            this.deleteUser();
            return false;
        }

        return true;
    },

    /*
     * Send a request to the API to get the specified software's details
     * If the id parameter is not present, returns a list containing all softwares' details
     * @param int id (the software's id)
     * @return json (the API's response)
     */
    getSoftware: function(id = null)
    {
        var result = this.getResult('get_soft', true, 'SOFTWARE', true, id);
        return result;
    },

    /*
     * Send a request to the API to get the specified configuration's details
     * If the id parameter is not present, returns a list containing the details of all the configurations owned by the user
     * @param int id (the configuration's id)
     * @return json (the API's response)
     */
    getConfiguration: function(id = null)
    {
        var result = this.getResult('get_config', true, 'CONFIGURATION', true, id);
        return result;
    },

    /*
     * Send a request to the API to store a newly created configuration
     * @param string name (the configuration's name)
     * @param int id (the software's id associated to the configuration)
     * @param string content (the configuration's content)
     * @param string filename (the configuration's filename)
     * @param string path (the configuration's path)
     * @return json (the API's response)
     */
    postConfiguration: function(name, softwareId, content, filename, path)
    {
        var json = {'software_id': softwareId, 'name': name, 'content': content, 'filename': filename, 'path': path};
        var result = this.getResult('post_config', true, 'CONFIGURATION', true, null, JSON.stringify(json));
        return result;
    },

    /*
     * Send a request to the API to update a specified configuration
     * Doesn't update the name if its parameter is not present (only update its content)
     * Doesn't update the content if its parameter is not present (only update its name)
     * @param int id (the configuration's id)
     * @param string name (the configuration's name)
     * @param string content (the configuration's content)
     * @return json (the API's response)
     */
    /*
    updateConfiguration: function(id, name = null, content = null)
    {
        var json = {};

        if (name !== null)
            json['name'] = name;

        if (content !== null)
            json['content'] = content;


        var result = this.getResult('up_config', true, 'CONFIGURATION', true, id, JSON.stringify(json));
        return result;
    },
    */

    /*
     * Send a request to the API to delete a specified configuration
     * @param int id (the configuration's id)
     * @return json (the API's response)
     */
    deleteConfiguration: function(id)
    {
        var result = this.getResult('del_config', true, 'CONFIGURATION', true, id);
        return result;
    },

    /*
     * Store the user informations
     * @return boolean
     */
    setUser: function(user)
    {
        this.user = user;
        if (!this.isStillLoggedIn())
            this.user = null;

        return this.user !== null;
    },

    /*
     * Remove the user informations
     */
    deleteUser: function(user)
    {
        this.user = null;
    },

    /*
     * Send a request to the API to get the specified bundle's details
     * If the id parameter is not present, returns a list containing the details of all the bundles owned by the user
     * @param int id (the bundle's id)
     * @return json (the API's response)
     */
    getBundle: function(id = null)
    {
        var result = this.getResult('get_bundle', true, 'BUNDLE', true, id);
        return result;
    },

    /*
     * Send a request to the API to store a newly created bundle
     * @param string name (the bundle's name)
     * @param array bundle (the bundle's data containing softwares and configurations)
     * @return json (the API's response)
     */
    postBundle: function(name, bundle)
    {
        var json = {'name': name, 'bundle': bundle};
        var result = this.getResult('post_bundle', true, 'BUNDLE', true, null, JSON.stringify(json));
        return result;
    },

    /*
     * Send a request to the API to update a specified bundle
     * @param int id (the bundle's id)
     * @param string name (the bundle's name)
     * @param array bundle (the bundle's data containing softwares and configurations)
     * @return json (the API's response)
     */
    updateBundle: function(id, name = null, bundle = null)
    {
        var json = {};

        if (name !== null)
            json['name'] = name;

        if (bundle !== null)
            json['bundle'] = bundle;

        var result = this.getResult('up_bundle', true, 'BUNDLE', true, id, JSON.stringify(json));
        return result;
    },

    /*
     * Send a request to the API to delete a specified bundle
     * @param int id (the bundle's id)
     * @return json (the API's response)
     */
    deleteBundle: function(id)
    {
        var result = this.getResult('del_bundle', true, 'BUNDLE', true, id);
        return result;
    },

    /*
     * Send a software suggestion request to the API
     * @param string name (the software's name)
     * @param string website (the software's vendor website)
     * @return json (the API's response)
     */
    postSoftwareSuggestion: function(name, website)
    {
        var json = {'name': name, 'website': website};
        var result = this.getResult('post_suggestion', true, 'SOFTWARE SUGGESTION', true, null, JSON.stringify(json));
        return result;
    },

    /*
     * Send a bug report request to the API
     * @param string name (the software's name)
     * @param string description (the bug's description)
     * @return json (the API's response)
     */
    postBug: function(title, description)
    {
        var json = {'title': title, 'description': description};
        var result = this.getResult('post_bug', true, 'BUG REPORT', true, null, JSON.stringify(json));
        return result;
    },

    /*
     * Send a password update request to the API and return its result
     * @param string password (the user's current passwors)
     * @param string newPassword (the user's new password)
     * @param string newPasswordConfirmation (the user's new password confirmation)
     * @return json (the API's response)
     */
    updatePassword: function(password, newPassword, newPasswordConfirmation)
    {
        var json = {'password': password, 'new_password': newPassword, 'new_password_confirmation': newPasswordConfirmation};
        var result = this.getResult('update_password', true, 'UPDATE PASSWORD', true, null, JSON.stringify(json));
        return result;
    }
};
