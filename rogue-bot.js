
function RogueBot(x, y, width, height, image) {
    CollisionEntity.call(this, new Rect(x, y, width, height), true);
    this.Centre = new Point(this.Bounds.X + (this.Bounds.Width / 2), this.Bounds.Y + (this.Bounds.Height / 2));
    this.Image = image;
    this.States = { Neutral: 1, Aggressive: 0 };
    this.Speed = 35;
    this.Selected = false;

    this.Target = new Point(0, 0);
    this.SteerForce = 0.05;
    this.Velocity = null;
    this.DesiredVelocity = new Point(0, 0);

    this.SearchMoveTick = 20;
    this.SearchMoveElapsed = 20;

    this.NeutralElapsed = 0;
    this.NeutralTick = 200;

    this.AttackRange = 235;
    this.AttackTarget = null; // This is a bot.
}

RogueBot.prototype = Object.create(CollisionEntity.prototype);

RogueBot.prototype.Update = function (modifier) {
    this.Centre = new Point(this.Bounds.X + (this.Bounds.Width / 2), this.Bounds.Y + (this.Bounds.Height / 2));

    if (this.States.Neutral == 1) {
        this.UpdateNeutral(modifier);
    }

    if (this.States.Aggressive == 1) {
        this.UpdateAggressive(modifier);
    }

    this.UpdateMovement(modifier);
}

RogueBot.prototype.UpdateNeutral = function (modifier) {
    this.NeutralElapsed += 0.1;
    this.SearchMoveElapsed += 0.1;

    if (this.SearchMoveElapsed >= this.SearchMoveTick) {
        this.SearchMoveTick = RandomBetween(5, 25);
        this.SearchMoveElapsed = 0;

        this.Target.X = RandomBetween(map.X, map.Width - this.Bounds.Width);
        this.Target.Y = RandomBetween(map.Y, map.Height - this.Bounds.Height);
    }

    if (this.NeutralElapsed >= this.NeutralTick) {
        this.SearchMoveElapsed = 0;
        this.States.Neutral = 0;
        this.States.Aggressive = 1;
    }
}

RogueBot.prototype.UpdateAggressive = function (modifier) {
    // Find and follow the closest target containing a payload.	
    if (this.AttackTarget == null) {
        for (var i = 0; i < cpuList.length; i++) {
            for (var x = 0; x < cpuList[i].Bots.length; x++) {
                var dist = DistanceBetweenPoints(
					cpuList[i].Bots[x].Centre, this.Centre);

                // Target the first bot within range.
                // This will often chose a bot that is not the closest
                // possible match, but this will prevent looping all bots.
                if (dist <= this.AttackRange) {
                    this.AttackTarget = cpuList[i].Bots[x];
                    break;
                }
            }

            if (this.AttackTarget) {
                break;
            }
        }
    }
    else {
        // Check intersection points.
        if (IntersectRect(this.Bounds, this.AttackTarget.Bounds)) {
            this.AttackTarget.TakeDamage();
        }

        // Check if bot hp is 0.
        if (this.AttackTarget.HP <= 0) {
            this.AttackTarget = null;
        }
    }

    if (this.AttackTarget == null) {
        // No bots where in range.
        // Move randomly.
        this.Target.X = RandomBetween(map.X, map.Width - this.Bounds.Width);
        this.Target.Y = RandomBetween(map.Y, map.Height - this.Bounds.Height);
    }
    else {
        this.Target = this.AttackTarget.Centre;
    }


}

RogueBot.prototype.UpdateMovement = function (modifier) {
    this.DesiredVelocity = GetVelocityFromPointsAndSpeed(
	this.Target, new Point(this.Bounds.X, this.Bounds.Y), (this.Speed * modifier));

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

    this.ApplyVelocity(this.Velocity);
}

RogueBot.prototype.Draw = function () {
    ctx.drawImage(this.Image,
		this.Bounds.X + map.X,
		this.Bounds.Y + map.Y,
		this.Bounds.Width,
        this.Bounds.Height);
        
    this.DrawDebug();    
}

RogueBot.prototype.DrawDebug = function () {
    if (showDebug) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(
            this.Bounds.X + map.X,
            this.Bounds.Y + map.Y,
            this.Bounds.Width, 
            this.Bounds.Height);

            if (this.Target) {
                ctx.strokeStyle = 'yellow';
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

RogueBot.prototype.constructor = RogueBot;