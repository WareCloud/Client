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
