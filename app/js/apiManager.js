var API =
{
    api_protocol: 'http',
    api_host: '163.5.84.202',
    api_prefix: '/api',

    api_endpoints: {
        'get_user':     {endpoint: '/user',           method: 'GET',  use_token: true,  json: true},
        'register':     {endpoint: '/user/register',  method: 'POST', use_token: false, json: true},
        'login':        {endpoint: '/user/login',     method: 'POST', use_token: false, json: true},
        'logout':       {endpoint: '/user/logout',    method: 'POST', use_token: true,  json: true},
        'get_config':   {endpoint: '/configuration',  method: 'GET',  use_token: true,  json: false},
        'post_config':  {endpoint: '/configuration',  method: 'POST', use_token: true,  json: true},
        'get_soft':     {endpoint: '/software',       method: 'GET',  use_token: true,  json: true}
    },

    user: null,

    xdr: function()
    {
        var xdr = null;
        if (window.XDomainRequest)
            xdr = new XDomainRequest();
        else if (window.XMLHttpRequest)
            xdr = new XMLHttpRequest();
        else
            console.log("Module non compatible");
        return (xdr);
    },

    callAPI: function(action, token = null, param = null, data = null)
    {
        if (this.api_endpoints[action] === undefined)
            return null;

        var endpointInfos = this.api_endpoints[action];
        if (endpointInfos.use_token && token === null)
            return null;

        var xhr = new this.xdr();
        var api_url = this.api_protocol + "://" + this.api_host + this.api_prefix + endpointInfos.endpoint;
        if (param !== null)
            api_url += '/' + param;

        xhr.open(endpointInfos.method, api_url, false);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");

        if (endpointInfos.use_token)
            xhr.setRequestHeader("Authorization", "Bearer " + token);

        xhr.onreadystatechange = function()
        {
            return xhr.responseText;
        };

        xhr.send(data);

        return xhr.onreadystatechange();
    },

    parseResult: function(jsonResult, logName = null)
    {
        if (jsonResult === undefined || jsonResult === null)
        {
            if (logName !== null)
                console.log('[' + logName + '] ERROR: Failed to communicate with the API !');

            return {success: false, errors: {error: ["Failed to communicate with the API !"]}};
        }

        if (jsonResult.hasOwnProperty('error'))
        {
            if (logName !== null)
                console.log('[' + logName + '] ERROR: ' + jsonResult.error);

            return {success: false, errors: {error: [jsonResult.error]}};
        }

        if (jsonResult.hasOwnProperty('errors'))
        {
            if (logName !== null)
                for (var key in jsonResult.errors)
                    console.log('[' + logName + '] ERROR: ' + key + " => " + jsonResult.errors[key]);

            return {success: false, errors: jsonResult.errors};
        }

        if (!jsonResult.hasOwnProperty('data'))
        {
            if (logName !== null)
                console.log('[' + logName + '] ERROR: Unknown error.');

            return {success: false, errors: {error: 'Unknown error.'}};
        }

        return {success: true, data: jsonResult.data};
    },

    getResult: function(action, verifyLogin = true, logName = null, token = false, param = null, data = null)
    {
        if (this.api_endpoints[action] === undefined)
        {
            if (logName !== null)
                console.log('[' + logName + '] ERROR: Invalid endpoint !');

            return {success: false, errors: {error: 'Invalid endpoint !'}};
        }

        var endpointInfos = this.api_endpoints[action];

        if (token)
            var api_token = this.user !== null ? this.user.api_token : null;

        if (verifyLogin && !this.isStillLoggedIn())
            return {success: false, errors: {error: 'Unauthenticated.'}};

        var result = this.callAPI(action, api_token, param, data);
        if (result === null)
        {
            if (logName !== null)
                console.log('[' + logName + '] ERROR: Result is null !');

            return {success: false, errors: {error: 'Result is null.'}};
        }

        if (logName);
            console.log('RESULT => ' + result);

        if (!endpointInfos.json)
            return {success: true, data: result};

        try {
            var jsonResult = JSON.parse(result);
        } catch (e) {
            console.error("Parsing error:", e);
            return {success: false, errors: {error: 'Failed to parse JSON result.'}};
        }

        var parsedResult = this.parseResult(jsonResult, logName);

        return parsedResult;
    },

    register: function(login, password, passwordConfirmation)
    {
        var result = this.getResult('register', false, 'REGISTER', false, null, JSON.stringify({"login": login, "password": password, "password_confirmation": passwordConfirmation}));

        if (result.success)
            this.user = result.data;

        return result;
    },

    login: function(login, password)
    {
        var result = this.getResult('login', false, 'LOGIN', false, null, JSON.stringify({"login": login, "password": password}));

        if (result.success)
            this.user = result.data;

        return result;
    },

    logout: function()
    {
        this.user = null;
        return this.getResult('logout', true, 'LOGOUT', true);
    },

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

    getSoftware: function(id = null)
    {
        var result = this.getResult('get_soft', true, 'SOFTWARE', true, id);
        return result;
    },

    getConfiguration: function(id)
    {
        var result = this.getResult('get_config', true, 'CONFIGURATION', true, id);
        return result;
    },

    setUser: function(user)
    {
        this.user = user;
        if (!this.isStillLoggedIn())
            this.user = null;

        return this.user !== null;
    },

    deleteUser: function(user)
    {
        this.user = null;
    }
};
