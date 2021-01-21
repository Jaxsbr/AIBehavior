function Resource(type, x, y, width, height, image) {
    CollisionEntity.call(this, new Rect(x, y, width, height));
    this.Title = type + " Resource";
    this.Selected = false;
    this.Type = type;
    this.Image = image;
    this.Bounds = new Rect(x, y, width, height);
    this.Centre = new Point(this.Bounds.X + (this.Bounds.Width / 2), this.Bounds.Y + (this.Bounds.Height / 2))
    this.Radius = DistanceBetweenPoints(new Point(this.Bounds.X, this.Bounds.Y), this.Centre);
    this.Units = 100;
    this.StartUnits = this.Units;
    this.MaxUnits = this.Units;
    this.HarvestingModifier = 20; // How long it takes to harvest 1 unit.

    this.InVisualBounds = false;

    this.RegenerateTick = 200;
    this.RegenrateElapsed = 0;
    this.Regenerating = false;

    this.Description = [];
    this.Infos = [];
    this.Actions = [];
    this.SetupActionMenu();
}

Resource.prototype = Object.create(CollisionEntity.prototype);

Resource.prototype.SetupActionMenu = function () {
    this.Description.push(this.Type + " Resource");
    this.Description.push("Contains " + this.Type + " units.");

    this.Infos.push(new InfoItem("Units", this.Units));
    this.Infos.push(new InfoItem("Regenerating", this.Regenerating));
    this.Infos.push(new InfoItem("Regenerate Time", Math.round(this.RegenrateElapsed)));
}

Resource.prototype.Update = function (modifier) {
    if (this.Units <= 0 && !this.Regenerating) {
        this.Regenerating = true;
        this.RegenrateElapsed = this.RegenerateTick;
    }

    if (this.Regenerating) {
        if (this.RegenrateElapsed <= 0) {
            this.Regenerating = false;
            this.Units = this.StartUnits;
        }
        else {
            this.RegenrateElapsed -= 0.1;
        }
    }

    this.UpdateInfos();

    var vRect = new Rect(
		this.Bounds.X + map.X,
		this.Bounds.Y + map.Y,
		this.Bounds.Width,
		this.Bounds.Height);

    this.InVisualBounds =
		IntersectRect(vRect, _screenRect) ? true : false;
}

Resource.prototype.UpdateInfos = function () {
    this.Infos = [];
    this.Infos.push(new InfoItem("Units", this.Units));
    this.Infos.push(new InfoItem("Regenerating", this.Regenerating));
    this.Infos.push(new InfoItem("Regenerate Time", Math.round(this.RegenrateElapsed)));
}

Resource.prototype.Draw = function () {
    if (!this.InVisualBounds) {
        return;
    }

    if (this.Units <= 0) {
        return;
    }

    if (this.Image) {
        ctx.drawImage(this.Image, this.Bounds.X + map.X, this.Bounds.Y + map.Y, this.Bounds.Width, this.Bounds.Height);

        var color = "white";
        switch (this.Type) {
            case "Iron":
                color = "maroon";
                break;
        }

        if (this.Selected) {
            drawSelectionOrb(this.Bounds, this.Radius, color);
            this.DrawHPBar();
        }
        this.DrawDebug();
    }
}

Resource.prototype.DrawDebug = function () {
    if (showDebug) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(
            this.Bounds.X + map.X,
            this.Bounds.Y + map.Y,
            this.Bounds.Width, 
            this.Bounds.Height);
    }
}

Resource.prototype.DrawHPBar = function () {
    // Formula for calculation hp bar length
    // bar% = hp * 100 / maxMonsterHP
    // hpLength = maxBarLength * bar% / 100
    var percentage = this.Units * 100 / this.MaxUnits;
    var hpLength = this.Bounds.Width * percentage / 100;

    ctx.fillStyle = "gray";
    ctx.fillRect(
		this.Bounds.X + map.X,
		this.Bounds.Y - 8 + map.Y,
		this.Bounds.Width,
		4);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "lightblue";
    ctx.fillRect(
		this.Bounds.X + map.X,
		this.Bounds.Y - 8 + map.Y,
		hpLength,
		4);
}

Resource.prototype.constructor = Resource;