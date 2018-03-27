function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function SwitchTab(name)
{
    document.getElementById(numTab + 'Tab').className = 'Tab0 tab';
    document.getElementById(name + 'Tab').className = 'Tab1 tab';
    document.getElementById('Content' + numTab + 'Tab').style.display = 'none';
    document.getElementById('Content' + name + 'Tab').style.display = 'block';
    numTab = name;
    if (name === "Software")
    {
        document.getElementById('softwareTable').innerHTML = '';
        getSoftwares();
    }
}

function fontFitResize(fit, wrap, step = 0.5) {
    var currentSize;
    while(fit.offsetWidth < wrap.offsetWidth) {
        currentSize = parseFloat(window.getComputedStyle(wrap, null).getPropertyValue('font-size'));
        wrap.style.fontSize = (currentSize - step) + 'px';
    }
}
