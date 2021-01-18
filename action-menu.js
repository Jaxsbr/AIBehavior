function ActionItem(text, action) {
    this.Text = text;
    this.Action = action;
    this.Bounds = new Rect(0, 0, 0, 0);
    this.TextLength = 0;
}


function InfoItem(key, value) {
    this.Key = key;
    this.Value = value;
    this.Bounds = new Rect(0, 0, 0, 0);
}


function ActionMenu(object) {
    this.Title = object.Title;
    this.Description = object.Description;
    this.PortraitImage = object.Image;
    this.Infos = object.Infos; // List of InfoItem 
    this.Actions = object.Actions; // List of ActionItem
    this.Bounds;
    this.CalculateBounds();
    this.Ready = false;
    this.Object = object;
}

ActionMenu.prototype.CalculateBounds = function () {
    var padding = 20;
    var itemPadding = 2;
    var totalHeight = padding;
    totalHeight += 20; // Title
    totalHeight += padding;
    totalHeight += this.Description.length * 15; // Description
    totalHeight += padding;
    totalHeight += 100;
    totalHeight += itemPadding;

    // Calculate InfoItem bounds, font 12px
    for (var i = 0; i < this.Infos.length; i++) {
        this.Infos[i].Bounds.X = 5;
        this.Infos[i].Bounds.Y = totalHeight;
        totalHeight += 12 + itemPadding;
    }

    totalHeight += padding;

    // Calculate ActionItem bounds
    ctx.save();
    ctx.font = "12px Calibri";
    for (var i = 0; i < this.Actions.length; i++) {
        this.Actions[i].TextLength = ctx.measureText("<CLICK> " + this.Actions[i].Text).width;

        this.Actions[i].Bounds = new Rect(5, totalHeight, this.Actions[i].TextLength, 12);
        totalHeight += 12 + itemPadding;
    }
    ctx.restore();

    this.Bounds = new Rect(0, -totalHeight, 220, totalHeight);
}

ActionMenu.prototype.Update = function () {
    // Update the current object.
    if (this.Object) {
        this.PortraitImage = this.Object.Image;

        for (var i = 0; i < this.Infos.length; i++) {
            this.Infos[i].Value = this.Object.Infos[i].Value;
        }
    }

    if (this.Ready) {
        return;
    }

    // Slide open menu
    if (this.Bounds.Y < 0) {
        this.Bounds.Y += 20;
        // Add deceleration.
    }
    else {
        this.Ready = true;
        this.Bounds.Y = 0;
    }
}

ActionMenu.prototype.Draw = function () {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "blue";
    ctx.fillRect(this.Bounds.X, this.Bounds.Y, this.Bounds.Width, this.Bounds.Height);
    ctx.restore();

    var padding = 20;
    var itemPadding = 2;
    var totalHeight = padding;
    ctx.fillStyle = "white";

    // Title	
    ctx.font = "bold 20px Calibri";
    ctx.fillText(this.Title, 5, totalHeight);
    totalHeight += padding;

    // Description
    ctx.font = "bold 15px Calibri";
    for (var i = 0; i < this.Description.length; i++) {
        ctx.fillText(this.Description[i], 5, totalHeight);
        totalHeight += 15;
    }
    totalHeight += itemPadding;

    // Image
    if (this.PortraitImage) {
        ctx.drawImage(this.PortraitImage, 5, totalHeight, 100, 100);
    }

    // Information/Stats
    for (var i = 0; i < this.Infos.length; i++) {
        ctx.fillText(this.Infos[i].Key + ": " + this.Infos[i].Value.toString(),
			this.Infos[i].Bounds.X, this.Infos[i].Bounds.Y);
    }

    // Actions
    for (var i = 0; i < this.Actions.length; i++) {
        var defaultColor = ctx.fillStyle;
        var mouseRect = new Rect(_mousePoint.x, _mousePoint.y + 12, 1, 1);

        if (IntersectRect(mouseRect, this.Actions[i].Bounds)) {
            ctx.fillStyle = "yellow";
        }

        ctx.fillText("<CLICK> " + this.Actions[i].Text,
			this.Actions[i].Bounds.X, this.Actions[i].Bounds.Y);

        ctx.fillStyle = defaultColor;
    }
}

ActionMenu.prototype.Click = function (x, y) {
    for (var i = 0; i < this.Actions.length; i++) {
        if (IntersectRect(this.Actions[i].Bounds, new Rect(_mousePoint.x, _mousePoint.y + 12, 1, 1))) {
            // Pass in the original object that this function was
            // retrieved from.
            this.Actions[i].Action(this.Object);
            break;
        }
    }

    return IntersectRect(this.Bounds, new Rect(_mousePoint.x, _mousePoint.y, 1, 1));
}