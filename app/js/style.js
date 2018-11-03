var refreshDevicesTimeout;

function loadContent()
{
    saveSoftwares();
    saveConfigurations();
    saveBundles();
    displayProfile();
}

function displayProfile()
{
    document.getElementById('ProfileTab').innerHTML = '<img class="icon" src="assets/svg/user.svg">' + API.user.login;
}

function displayContent()
{
    if (db === null || API.user === null)
    {
        setTimeout(function() { displayContent(); }, 100);
        return;
    }

    displayDevices();
    refreshDevicesTimeout = setInterval(refreshDevicesAvailbility, 10000);
    displaySoftwares();
    displayConfigurations();
}

function openNav()
{
    document.getElementById('mySidenav').style.width = '250px';
}

function closeNav()
{
    document.getElementById('mySidenav').style.width = '0';
}

function SwitchTab(name)
{
    var message = null;
    document.getElementById(numTab + 'Tab').className = 'Tab0 tab';
    document.getElementById(name + 'Tab').className = 'Tab1 tab';
    document.getElementById('Content' + numTab + 'Tab').style.display = 'none';
    document.getElementById('Content' + name + 'Tab').style.display = 'block';
    numTab = name;
    if (name === 'Install')
    {
        displayContent();
    }
    if (name === 'Profile')
        message = document.getElementById('profileMessage');
    if (name === 'Suggestion')
        message = document.getElementById('suggestionMessage');
    if (name === 'Bug')
        message = document.getElementById('bugReportMessage');

    if (message)
    {
        message.className = 'alert';
        message.innerHTML = '';
    }
}

function fontFitResize(fit, wrap, step = 0.5)
{
    var currentSize;
    while(fit.offsetWidth < wrap.offsetWidth) {
        currentSize = parseFloat(window.getComputedStyle(wrap, null).getPropertyValue('font-size'));
        wrap.style.fontSize = (currentSize - step) + 'px';
    }
}



var perRow = 0;
var maxElem = 0;
var maxRows = 0;

function recalculateSoftwareRows()
{
    var softwareTable = document.getElementsByClassName('softwareTable')[0];
    var child = softwareTable.children[0];
    if (softwareTable === undefined || child === undefined)
        return;

    var ulWidth = softwareTable.offsetWidth;
    var liWidth = child.offsetWidth;
    perRow = Math.floor( ulWidth / liWidth );
    maxElem = softwareTable.children.length;
    maxRows = Math.ceil(maxElem / perRow);
}

function getSoftwareRow(position)
{
    return Math.min(maxRows, Math.ceil(position / perRow)) - 1;
}

function resetSoftwareDescription()
{
    var elements = document.getElementsByClassName('software-description');

    while(elements.length > 0)
        elements[0].parentNode.removeChild(elements[0]);

    [].forEach.call(document.getElementsByClassName('active'), function(el) {
        el.style.display = 'none';
    });

    recalculateSoftwareRows();

    for (var row = 1; row <= maxRows; row++){
        var softwareDescription = document.createElement('div');
        softwareDescription.classList.add('software-description');
        softwareDescription.style.display = 'none';
        var close = document.createElement('a');
        close.className = 'close-button';
        var article = document.createElement('article');
        article.className = 'software-entry';
        var h1 = document.createElement('h1');
        h1.className = 'soft-title';
        var entryImg = document.createElement('div');
        entryImg.className = 'soft-img';
        var img = document.createElement('img');
        img.className = 'soft-img-src';
        var description = document.createElement('p');
        description.className = 'soft-desc';
        entryImg.appendChild(img);
        article.appendChild(h1);
        article.appendChild(entryImg);
        article.appendChild(description);
        softwareDescription.appendChild(close);
        softwareDescription.appendChild(article);
        var afterObj = Math.min((perRow * row), maxElem) - 1;
        var referenceNode = document.getElementsByClassName('softwareElement')[afterObj];
        referenceNode.parentNode.insertBefore(softwareDescription, referenceNode.nextSibling);
    }

    [].forEach.call(document.getElementsByClassName('close-button'), function(el) {
        el.addEventListener('click', function(){
            [].forEach.call(document.getElementsByClassName('software-description'), function(el) {
                el.style.display = 'none';
            });
            [].forEach.call(document.getElementsByClassName('active'), function(el) {
                el.style.display = 'none';
            });
        });
    });
}

function initSoftwaresDescriptions()
{
    [].forEach.call(document.getElementsByClassName('soft-info'), function(el) {
        el.addEventListener('click', function(){
            [].forEach.call(document.getElementsByClassName('software-description'), function(el) {
                el.style.display = 'none';
            });
            [].forEach.call(document.getElementsByClassName('active'), function(el) {
                el.style.display = 'none';
            });
            var currSoftware = this.parentNode.parentNode;
            var childs = currSoftware.parentNode.childNodes;
            var pos = 0;
            for (var i = 0; i < childs.length; i++) {
                if (childs[i].className === currSoftware.className)
                    pos++;
                if (currSoftware === childs[i]){
                    break;
                }
            }
            var row = getSoftwareRow(pos);
            var description = document.getElementsByClassName('software-description')[row];
            description.getElementsByClassName('soft-title')[0].textContent = SoftwareManager.getSoftware(pos).name;
            description.getElementsByClassName('soft-img-src')[0].src = API.getRootURL() + SoftwareManager.getSoftware(pos).icon_url;
            description.getElementsByClassName('soft-desc')[0].textContent = SoftwareManager.getSoftware(pos).comment;
            currSoftware.getElementsByClassName('active')[0].style.display = '';
            description.style.display = 'block';
        });
    });
}

function activateSoftSearch(search = null)
{
    searchSoftwares(search);
}

function activateConfSearch(search = null)
{
    searchConfigurations(search);
}