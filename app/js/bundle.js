class Bundle {
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
        this.size = 0;
        this.softs = [];
    }

    addSoftware(soft)
    {
        this.softs[this.size] = soft;
        this.size++;
    }

    download(agent)
    {
        for(i = 0; i != this.size; i++)
        {
            agent.download(this.softs[i].link, this.softs[i].name);
        }
    }

    install(agent)
    {
        for(i = 0; i != this.size; i++)
        {
            agent.install(this.softs[i].name);
        }
    }
}
