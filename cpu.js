
function CPU(x, y, width, height, color, image) {
    this.Title = "CENTRAL PROCESS UNIT";
    this.Description = [];
    this.Selected = false;
    this.Color = color;
    this.Bounds = new Rect(x, y, width, height);
    this.Centre = new Point(this.Bounds.X + (this.Bounds.Width / 2), this.Bounds.Y + (this.Bounds.Height / 2))
    this.Radius = DistanceBetweenPoints(new Point(this.Bounds.X, this.Bounds.Y), this.Centre);
    this.Bots = []; // Workers
    this.Resources = { Iron: 500 };
    this.KnownResources = [];
    this.Image = image;

    this.InVisualBounds = false;

    this.Defending = false;

    this.HP = cpuStartingHP;
    this.MaxHP = this.HP;

    this.Description = [];
    this.Infos = [];
    this.Actions = [];
    this.SetupActionMenu();
}

CPU.prototype.SetupActionMenu = function () {
    this.Description.push("The CPU is the base of");
    this.Description.push("operations and storage.");
    this.Description.push("This is where the bots are");
    this.Description.push("spawned and resources stored.");

    this.Infos.push(new InfoItem("Iron", this.Resources.Iron));
    this.Infos.push(new InfoItem("Bots", this.Bots.length));
    this.Infos.push(new InfoItem("Defending", this.Defending));

    this.Actions.push(new ActionItem("Create Bot", this.CreateBot));
	this.Actions.push(new ActionItem("Create Rogue", this.CreateRogue));
    this.Actions.push(new ActionItem("Toggle Defence", this.ToggleDefence));
}

CPU.prototype.Update = function (modifier) {
    this.CreateBot(this);

    for (var i = 0; i < this.Bots.length; i++) {
        if (this.Bots[i].Mutated) {
            var location = new Point(this.Bots[i].Bounds.X, this.Bots[i].Bounds.Y);
            var selected = this.Bots[i].Selected;
            this.Bots.splice(i, 1);

            // Bot is officially self aware.
            addRogueBot(location, selected);
            continue;
        }
        this.Bots[i].Update(modifier);
        if (this.Bots[i].HP <= 0) {
            this.Bots.splice(i, 1);
        }
    }

    this.UpdateInfos(modifier);

    var vRect = new Rect(
		this.Bounds.X + map.X,
		this.Bounds.Y + map.Y,
		this.Bounds.Width,
		this.Bounds.Height);

    this.InVisualBounds =
		IntersectRect(vRect, _screenRect) ? true : false;
}

CPU.prototype.UpdateInfos = function (modifier) {
    this.Infos = [];
    this.Infos.push(new InfoItem("Iron", this.Resources.Iron));
    this.Infos.push(new InfoItem("Bots", this.Bots.length));
    this.Infos.push(new InfoItem("Defending", this.Defending));
}

CPU.prototype.Draw = function () {
    if (this.InVisualBounds) {
        ctx.drawImage(this.Image, this.Bounds.X + map.X, this.Bounds.Y + map.Y, this.Bounds.Width, this.Bounds.Height);

        // Mark cpu with color by drawing color rect over image
        var w = this.Bounds.Width / 10;
        var h = this.Bounds.Height / 10;
        var x = this.Centre.X + map.X - (w / 2);
        var y = this.Centre.Y + map.Y - (h / 2);

        ctx.save();
        ctx.fillStyle = this.Color;
        ctx.fillRect(x, y, w, h);
        ctx.restore();
    }

    for (var i = 0; i < this.Bots.length; i++) {
        this.Bots[i].Draw();
    }

    if (this.InVisualBounds) {
        if (this.Selected) {
            drawSelectionOrb(this.Bounds, this.Radius, this.Color);
            this.DrawHPBar();
        }
    }

    this.DrawDebug();
}

CPU.prototype.DrawHPBar = function () {
    // Formula for calculation hp bar length
    // bar% = hp * 100 / maxMonsterHP
    // hpLength = maxBarLength * bar% / 100
    var percentage = this.HP * 100 / this.MaxHP;
    var hpLength = this.Bounds.Width * percentage / 100;

    ctx.fillStyle = "gray";
    ctx.fillRect(
		this.Bounds.X + map.X,
		this.Bounds.Y - 16 + map.Y,
		this.Bounds.Width,
		4);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "lime";
    ctx.fillRect(
		this.Bounds.X + map.X,
		this.Bounds.Y - 16 + map.Y,
		hpLength,
		4);
}

CPU.prototype.DrawDebug = function () {
    if (showDebug) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(
            this.Bounds.X + map.X,
            this.Bounds.Y + map.Y,
            this.Bounds.Width, 
            this.Bounds.Height);
    }
}

CPU.prototype.CreateBot = function (cpu) {
    var botCost = 50;

    if (cpu.Resources.Iron < botCost) {
        return;
    }

    var x = RandomBetween(cpu.Bounds.X - 10, cpu.Bounds.X + cpu.Bounds.Width + 20);
    var y = RandomBetween(cpu.Bounds.Y - 10, cpu.Bounds.Y + cpu.Bounds.Height + 20);

    var bot1 = new Bot(cpu);
    bot1.Bounds.X = x;
    bot1.Bounds.Y = y;

    cpu.Bots.push(bot1);
    cpu.Resources.Iron -= botCost;
}

CPU.prototype.CreateRogue = function(cpu) {
	addRogueBot(cpu.Centre, true);
}

CPU.prototype.ToggleDefence = function (cpu) {
    cpu.Defending = !cpu.Defending;

    for (var i = 0; i < cpu.Bots.length; i++) {
        cpu.Bots[i].States.Defending = cpu.Defending ? 1 : 0;

        if (cpu.Bots[i].States.Defending == 1) {
            cpu.Bots[i].Target.X = cpu.Centre.X;
            cpu.Bots[i].Target.Y = cpu.Centre.Y;
        }

    }
}