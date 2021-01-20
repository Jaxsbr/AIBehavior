
function Bot(parentCPU) {
    this.Title = "BOT"
    this.Image = null;
    this.Selected = false;
    this.Bounds = new Rect(0, 0, startingBotSize, startingBotSize);
    this.PayloadUnits = 0;
    this.MaxPayload = 10;
    this.CurrentResource = null;
    this.PayloadType = { Iron: 0 };
    this.ParentCPU = parentCPU;
    this.Color = this.ParentCPU.Color;
    this.States = { Searching: 1, Harvesting: 0, Defending: 0, Mutating: 0 };
    this.Speed = startingBotSpeed;
    this.PayloadsCollected = 0;

    // After each payload collected, a random change will increase
    // awareness. When awareness level equal to MutateValue is reached.
    // Bot will leave cpu and become self aware/rogue.
    this.Awareness = 0;
    this.MutateValue = 2;
    this.MutateElapsed = 0;
    this.MutateTick = 100;
    this.Mutated = false;

    this.HP = 10;
    this.MaxHP = this.HP;

    this.DamageImmunityValue = 0;
    this.DamageImmunityCount = 10;

    this.InVisualBounds = false;

    this.Target = new Point(0, 0);
    this.SteerForce = 0.05;
    this.Velocity = null;
    this.DesiredVelocity = new Point(0, 0);
    this.SearchMoveTick = 20;
    this.SearchMoveElapsed = 20;
    this.ScanRect = this.Bounds;
    this.Centre = new Point(this.Bounds.X + (this.Bounds.Width / 2), this.Bounds.Y + (this.Bounds.Height / 2));
    this.Radius = DistanceBetweenPoints(new Point(this.Bounds.X, this.Bounds.Y), this.Centre);
    this.HarvestTick = 0;
    this.HarvestElapsed = 0;

    this.Description = [];
    this.Infos = [];
    this.Actions = [];
    this.SetupActionMenu();
}

Bot.prototype.SetupActionMenu = function () {
    this.Description.push("The Bot is the worker bee.");
    this.Description.push("It gathers resources for its CPU");

    this.Infos.push(new InfoItem("Searching", this.States.Searching == 0 ? "NO" : "YES"));
    this.Infos.push(new InfoItem("Harvesting", this.States.Harvesting == 0 ? "NO" : "YES"));
    this.Infos.push(new InfoItem("Defending", this.States.Defending == 0 ? "NO" : "YES"));
    this.Infos.push(new InfoItem("Payloads Collected", this.PayloadsCollected));
    this.Infos.push(new InfoItem("Awareness", this.Awareness));
    this.Infos.push(new InfoItem("Mutating", this.States.Mutating == 0 ? "NO" : "YES"));
    this.Infos.push(new InfoItem("Mutate Time", Math.floor(this.MutateElapsed)));

    //this.Actions.push(new ActionItem("Create Bot", this.CreateBot));
}

Bot.prototype.Update = function (modifier) {
    this.Centre = new Point(this.Bounds.X + (this.Bounds.Width / 2), this.Bounds.Y + (this.Bounds.Height / 2));
    this.Radius = DistanceBetweenPoints(new Point(this.Bounds.X, this.Bounds.Y), this.Centre);

    if (this.Awareness >= this.MutateValue) {
        this.States.Searching = 0;
        this.States.Harvesting = 0;
        this.States.Defending = 0;
        this.States.Mutating = 1;
    }

    if (this.States.Mutating == 1) {
        // TODO:
        // Count down mutating.
        if (!this.Mutated) {
            this.MutateElapsed += 0.1;
            if (this.MutateElapsed >= this.MutateTick) {
                this.Mutated = true;
                // This should be the last time
                // this bot was updated before turning into a rogue..				
            }
        }
    }
    else {
        if (this.States.Defending == 1) {
            this.UpdateDefending(modifier);
        }
        else {
            if (this.States.Searching == 1) {
                this.Image = bot1Image;
                this.UpdateSearching(modifier);
            }

            if (this.States.Harvesting == 1) {
                this.Image = bot2Image;
                this.UpdateHarvesting(modifier);
            }
        }

        this.UpdateMovement(modifier);

        this.ScanRect = new Rect(
			this.Bounds.X - 60,
			this.Bounds.Y - 60,
			this.Bounds.Width + 120,
			this.Bounds.Height + 120);
    }

    this.UpdateInfos(modifier);

    var vRect = new Rect(
		this.Bounds.X + map.X,
		this.Bounds.Y + map.Y,
		this.Bounds.Width,
		this.Bounds.Height);

    this.InVisualBounds =
        IntersectRect(vRect, _screenRect) ? true : false;
        
    this.UpdateDamangeImmunity();    
}

Bot.prototype.UpdateInfos = function (modifier) {
    this.Infos = [];
    this.Infos.push(new InfoItem("Searching", this.States.Searching == 0 ? "NO" : "YES"));
    this.Infos.push(new InfoItem("Harvesting", this.States.Harvesting == 0 ? "NO" : "YES"));
    this.Infos.push(new InfoItem("Defending", this.States.Defending == 0 ? "NO" : "YES"));
    this.Infos.push(new InfoItem("Payloads Collected", this.PayloadsCollected));
    this.Infos.push(new InfoItem("Awareness", this.Awareness));
    this.Infos.push(new InfoItem("Mutating", this.States.Mutating == 0 ? "NO" : "YES"));
    this.Infos.push(new InfoItem("Mutate Time", Math.floor(this.MutateElapsed)));
}

Bot.prototype.UpdateSearching = function (modifier) {
    // Bot will search for resource objects by random movements and scanning areas.
    // Once found a Bot will change states to harvesting and start collection the resource for the CPU.
    for (var i = 0; i < resources.length; i++) {
        if (IntersectRect(this.ScanRect, resources[i].Bounds)) {
            if (resources[i].Units > 0) {
                this.States.Searching = 0;
                this.States.Harvesting = 1;
                this.CurrentResource = resources[i];
                this.DesiredVelocity = new Point(0, 0);
                this.Velocity = new Point(0, 0);
                break;
            }
        }
    }

    this.SearchMoveElapsed += 0.1;
    if (this.SearchMoveElapsed >= this.SearchMoveTick) {
        this.SearchMoveTick = RandomBetween(5, 25);
        this.SearchMoveElapsed = 0;

        this.Target.X = RandomBetween(map.X, map.Width - this.Bounds.Width);
        this.Target.Y = RandomBetween(map.Y, map.Height - this.Bounds.Height);
    }
}

Bot.prototype.UpdateHarvesting = function (modifier) {
    if (this.CurrentResource == null) {
        this.States.Searching = 1;
        this.States.Harvesting = 0;
        return;
    }

    if (this.PayloadUnits < this.MaxPayload) {
        // Perform harvest.
        if (IntersectRect(this.CurrentResource.Bounds, this.Bounds)) {
            if (this.CurrentResource.Units == 0) {
                // Resource depleted				
                this.CurrentResource = null;
            }
            else if (this.CurrentResource.Units < this.MaxPayload && this.CurrentResource.Units > 0) {
                // Resource partially depleted				
                // TODO:
                // Since this is only a partial harvest, the harvest tick should also
                // only be partial of the normal. Full time will apply until fixed.
                this.HarvestTick = this.CurrentResource.HarvestingModifier;
                this.PayloadUnits += this.CurrentResource.Units;
                this.CurrentResource.Units = 0;
                if (this.CurrentResource.Type == "Iron") {
                    this.PayloadType.Iron = 1;
                }
                this.CurrentResource = null;
            }
            else {
                // Max Units collected.
                this.HarvestTick = this.CurrentResource.HarvestingModifier;
                this.CurrentResource.Units -= this.MaxPayload;
                this.PayloadUnits += this.MaxPayload;
                if (this.CurrentResource.Type == "Iron") {
                    this.PayloadType.Iron = 1;
                }
            }
        }
        else {
            // Move towards resource until bounds intersect.
            this.Target = new Point(this.CurrentResource.Bounds.X, this.CurrentResource.Bounds.Y);
        }
    }
    else if (this.PayloadUnits >= this.MaxPayload || (this.PayloadUnits > 0 && this.CurrentResource == null)) {
        if (IntersectRect(this.ParentCPU.Bounds, this.Bounds)) {
            if (this.PayloadType.Iron == 1) {
                this.ParentCPU.Resources.Iron += this.PayloadUnits;
                this.PayloadUnits = 0;
                this.PayloadsCollected += 1;
                this.CheckAwareness();
            }

            if (this.CurrentResource == null) {
                this.States.Harvesting = 0;
                this.States.Searching = 1;
            }
            else {
                this.Target = this.CurrentResource.Centre;
            }
        }
        else {
            // Units collected at this point.
            // Before returning to cpu, apply a wait time to simulate a harvest duration.
            this.HarvestElapsed += 0.1;
            if (this.HarvestElapsed >= this.HarvestTick) {
                this.Target = this.ParentCPU.Centre;
                this.HarvestElapsed = 0;
            }
        }
    }
}

Bot.prototype.UpdateDefending = function (modifier) {
    // Bot moves back to cpu.
    // Bot attacks any target flagged by parent cpu.
}

Bot.prototype.UpdateMovement = function (modifier) {
    var speed = this.Speed;
    if (this.PayloadUnits > 0) {
        speed = speed / 2;
    }

    this.DesiredVelocity = GetVelocityFromPointsAndSpeed(
        this.Target, new Point(this.Bounds.X, this.Bounds.Y), (speed * modifier));

    if (this.Velocity == null) {
        this.Velocity = new Point(this.DesiredVelocity.X, this.DesiredVelocity.Y);
    }

    var updateSteer = false;
    if (this.Velocity.X < this.DesiredVelocity.X) {
        this.Velocity.X += this.SteerForce;
    }
    if (this.Velocity.X > this.DesiredVelocity.X) {
        this.Velocity.X -= this.SteerForce;
    }
    if (this.Velocity.Y < this.DesiredVelocity.Y) {
        this.Velocity.Y += this.SteerForce;
    }
    if (this.Velocity.Y > this.DesiredVelocity.Y) {
        this.Velocity.Y -= this.SteerForce;
    }

    this.Bounds.X += this.Velocity.X;
    this.Bounds.Y += this.Velocity.Y;
}

Bot.prototype.UpdateDamangeImmunity = function (modifier) {
    if (this.ImmuneToDamage) {
        this.DamageImmunityValue += 0.1;
        if (this.DamageImmunityValue >= this.DamageImmunityCount) {
            this.DamageImmunityValue = 0;
            this.ImmuneToDamage = false;
        }
    }
}

Bot.prototype.Draw = function () {
    if (!this.InVisualBounds) {
        return;
    }

    ctx.save();
    if (this.Image) {
        var multiplier = this.States.Mutating == 1 ? 2 : 1;

        ctx.drawImage(this.Image,
			this.Bounds.X + map.X,
			this.Bounds.Y + map.Y,
			this.Bounds.Width * multiplier,
			this.Bounds.Height * multiplier);

        // Mark bot with color by drawing color rect over image
        var w = this.Bounds.Width / 4;
        var h = this.Bounds.Height / 4;
        var x = this.Centre.X + map.X - (w / 2);
        var y = this.Centre.Y + map.Y - (h / 2);

        ctx.save();
        ctx.fillStyle = this.Color;
        ctx.fillRect(x, y, w, h);
        ctx.restore();
    }
    else {
        ctx.fillStyle = this.Color;
        ctx.fillRect(this.Bounds.X + map.X, this.Bounds.Y + map.Y, this.Bounds.Width, this.Bounds.Height);
    }
    ctx.restore();

    if (this.Selected) {
        drawSelectionOrb(this.Bounds, this.Radius, this.Color);
        this.DrawHPBar();
    }

    this.DrawDebug();
}

Bot.prototype.DrawHPBar = function () {
    // Formula for calculation hp bar length
    // bar% = hp * 100 / maxMonsterHP
    // hpLength = maxBarLength * bar% / 100
    var percentage = this.HP * 100 / this.MaxHP;
    var hpLength = this.Bounds.Width * percentage / 100;

    ctx.fillStyle = "gray";
    ctx.fillRect(
		this.Bounds.X + map.X,
		this.Bounds.Y - 8 + map.Y,
		this.Bounds.Width,
		4);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "lime";
    ctx.fillRect(
		this.Bounds.X + map.X,
		this.Bounds.Y - 8 + map.Y,
		hpLength,
		4);
}

Bot.prototype.DrawDebug = function () {
    if (showDebug) {

        if (this.States.Searching === 1) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = 'violet';
            ctx.fillRect(
                this.ScanRect.X + map.X, 
                this.ScanRect.Y + map.Y, 
                this.ScanRect.Width, 
                this.ScanRect.Height);
            ctx.restore();
        }


        ctx.strokeStyle = 'red';
        ctx.strokeRect(
            this.Bounds.X + map.X,
            this.Bounds.Y + map.Y,
            this.Bounds.Width, 
            this.Bounds.Height);

        if (this.Target) {
            ctx.strokeStyle = 'blue';
            ctx.beginPath();
            ctx.moveTo(
                this.Bounds.X + (this.Bounds.Width / 2) + map.X, 
                this.Bounds.Y + (this.Bounds.Height / 2) + map.Y);
            ctx.lineTo(
                this.Target.X + map.X, 
                this.Target.Y + map.Y);
            ctx.stroke();
        }
    }
}

Bot.prototype.TakeDamage = function () {
    if (!this.ImmuneToDamage) {
        this.HP -= 1;
        this.ImmuneToDamage = true;
    }
}

Bot.prototype.CheckAwareness = function () {
    var luckyNumber = RandomBetween(1, 7);
    if (luckyNumber == 7) {
        this.Awareness += 1;
    }
}
