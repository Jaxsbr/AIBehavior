// Game 

var canvas;
var ctx;
var then;
var showDevText = false;

var _keys = {};
var _leftMouseDown = false;
var _mousePoint = { x: 0, y: 0 };
var _mouseOutSide = false;
var _canvasCenter;
var _screenRect;
var _previousKey = 0;

var map;
var mapView;
var leftScreenMoveRect;
var topScreenMoveRect;
var rightScreenMoveRect;
var bottomScreenMoveRect;
var screenMoveTick = 3;
var screenMoveElapsed = 0;
var screenMoveStates = { left: 0, top: 0, right: 0, bottom: 0 };
var showMap = false;

var grass1Image = new Image();
var grass1Ready = false;

var maxResources;
var resourceSize = 15;
var resourceImageDataList = [];
var resourceImage = new Image();
var resourceReady = false;

var horizontalScreenMoveImage = new Image();
var horizontalScreenMoveReady = false;

var verticalScreenMoveImage = new Image();
var verticalScreenMoveReady = false;

var cpuImage = new Image();
var cpuReady = false;

var bot1Image = new Image();
var bot1Ready = false;

var bot2Image = new Image();
var bot2Ready = false;

var rogue1Image = new Image();
var rogue1Ready = false;

var cpuList = [];
var resources = [];
var rogueBots = [];

var selectedGameObject = null;
var actionMenu = null;


var init = function () {
    then = Date.now();
    initCanvas();
    initKeyboardEvents();
    initMouseEvents();
    initImages();
    intiGameVariables();
    main();
}

var initCanvas = function () {
    canvas = document.getElementById('game-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");

    _canvasCenter = new Point(canvas.width / 2, canvas.height / 2);
    _screenRect = new Rect(0, 0, canvas.width, canvas.height);

    addEventListener("resize", function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        _screenRect = new Rect(0, 0, canvas.width, canvas.height);
        initMap();
    }, false);

    addEvent(document, "mouseout", function (e) {
        e = e ? e : window.event;
        var from = e.relatedTarget || e.toElement;
        if (!from || from.nodeName == "HTML") {
            // The cursor left the window.
            _mouseOutSide = true;
        }
    });
}

var addEvent = function (obj, evt, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evt, fn, false);
    }
    else if (obj.attachEvent) {
        obj.attachEvent("on" + evt, fn);
    }
}

var initKeyboardEvents = function () {
    addEventListener("keydown", function (e) {
        _keys[e.keyCode] = true;
    }, false);

    addEventListener("keyup", function (e) {
        delete _keys[e.keyCode];
    }, false);

    addEventListener("keypress", function (e) {
        keyPress(e.keyCode);
    }, false);
}

var initMouseEvents = function () {
    addEventListener("mousemove", function (event) {
        if (window.event)
            event = window.event; //IE

        _mousePoint.x = event.clientX;
        _mousePoint.y = event.clientY;
        _mouseOutSide = false;

    }, false);

    addEventListener("mouseup", function () {
        _leftMouseDown = false;
    }, false);

    addEventListener("mousedown", function (event) {
        _leftMouseDown = true;

        mouseDown(event.clientX, event.clientY);
    }, false);

    addEventListener("click", function () {
        click(window.event.clientX, window.event.clientY);
    }, false);
}

var initImages = function () {
    grass1Image.onload = function () {
        grass1Ready = true;
    }
    grass1Image.src = "img/grass3.png";

    resourceImage.onload = function () {
        resourceReady = true;
    }
    resourceImage.src = "img/resource1.png";

    horizontalScreenMoveImage.onload = function () {
        horizontalScreenMoveReady = true;
    }
    horizontalScreenMoveImage.src = "img/horizontalScreenMovement.png";

    verticalScreenMoveImage.onload = function () {
        verticalScreenMoveReady = true;
    }
    verticalScreenMoveImage.src = "img/verticalScreenMovement.png";

    cpuImage.onload = function () {
        cpuReady = true;
    }
    cpuImage.src = "img/cpu1.png";

    bot1Image.onload = function () {
        bot1Ready = true;
    }
    bot1Image.src = "img/bot1.png";

    bot2Image.onload = function () {
        bot2Ready = true;
    }
    bot2Image.src = "img/bot2.png";

    rogue1Image.onload = function () {
        rogue1Ready = true;
    }
    rogue1Image.src = "img/rogue1.png";
}

var intiGameVariables = function () {
    initMap();

    cpuList.push(new CPU(400, 400, 50, 50, "yellow", cpuImage));
    cpuList.push(new CPU(800, 800, 50, 50, "blue", cpuImage));
    cpuList.push(new CPU(1200, 1200, 50, 50, "red", cpuImage));
    cpuList.push(new CPU(1600, 1400, 50, 50, "purple", cpuImage));
    cpuList.push(new CPU(2900, 1900, 50, 50, "orange", cpuImage));

    maxResources = RandomBetween(150, 250);


    for (var i = 0; i < maxResources; i++) {
        // Prevent resource from spawning on a cpu.
        var match = false;
        while (!match) {
            var rect = new Rect(
				RandomBetween(map.X, map.Width - resourceSize),
				RandomBetween(map.Y, map.Height - resourceSize),
				resourceSize,
				resourceSize);

            for (var j = 0; j < cpuList.length; j++) {
                if (!IntersectRect(rect, cpuList[j].Bounds)) {
                    var resource = new Resource(
						"Iron",
						rect.X,
						rect.Y,
						rect.Width,
						rect.Height,
						resourceImage);
                    resources.push(resource);
                    match = true;
                    break;
                }
            }
        }
    }
}

var initMap = function () {
    map = new Rect(0, 0, 3000, 2000);
    mapView = new Rect(
		_screenRect.Width - 150 - 10, _screenRect.Height - 100 - 10, 150, 100);

    leftScreenMoveRect = new Rect(_screenRect.X, _screenRect.Y, 25, _screenRect.Height);
    topScreenMoveRect = new Rect(_screenRect.X, _screenRect.Y, _screenRect.Width, 25);
    rightScreenMoveRect = new Rect(_screenRect.Width - 25, _screenRect.Y, 25, _screenRect.Height);
    bottomScreenMoveRect = new Rect(_screenRect.X, _screenRect.Height - 25, _screenRect.Width, 25);
}

var main = function () {
    var now = Date.now();
    var delta = now - then;

    update(delta / 1000);
    draw(delta / 1000);

    then = now;

    requestAnimationFrame(main);
}

var update = function (modifier) {
    updateGameVariables(modifier);
    updateScreenViewMovement(modifier);
    updateKeysDown();
}

var updateGameVariables = function (modifier) {
    for (var i = 0; i < cpuList.length; i++) {
        cpuList[i].Update(modifier);
    }

    for (var i = 0; i < resources.length; i++) {
        resources[i].Update(modifier);
    }

    for (var i = 0; i < rogueBots.length; i++) {
        rogueBots[i].Update(modifier);
    }

    if (!(actionMenu == "undefined" || actionMenu == null)) {
        actionMenu.Update();
    }
}

var updateScreenViewMovement = function (modifier) {
    var moveValue = 500 * modifier;

    screenMoveStates.left = 0;
    screenMoveStates.top = 0;
    screenMoveStates.right = 0;
    screenMoveStates.bottom = 0;

    var mouseRect = new Rect(_mousePoint.x, _mousePoint.y, 1, 1);
    if (_mouseOutSide) {
        // Prevent screen movement if mouse is outside browser.
        return;
    }

    if (IntersectRect(leftScreenMoveRect, mouseRect)) {
        if (map.X + moveValue < 0) {
            screenMoveStates.left = 1;
            map.X += moveValue;
        }
    }

    if (IntersectRect(topScreenMoveRect, mouseRect)) {
        if (map.Y + moveValue < 0) {
            screenMoveStates.top = 1;
            map.Y += moveValue;
        }
    }

    if (IntersectRect(rightScreenMoveRect, mouseRect)) {
        if (map.X - moveValue - _screenRect.Width > -map.Width) {
            screenMoveStates.right = 1;
            map.X -= moveValue;
        }
    }

    if (IntersectRect(bottomScreenMoveRect, mouseRect)) {
        if (map.Y - moveValue - _screenRect.Height > -map.Height) {
            screenMoveStates.bottom = 1;
            map.Y -= moveValue;
        }
    }
}

var updateKeysDown = function () {
    if (65 in _keys) { // A
    }
    if (68 in _keys) { // D
    }
    if (83 in _keys) { // S
    }
    if (87 in _keys) { // W
    }
}

var draw = function (modifier) {
    ctx.clearRect(_screenRect.X, _screenRect.Y, _screenRect.Width, _screenRect.Height);

    drawBackground();
    drawGameVariables();
    drawMap();
    drawScreenMovementBars();
    drawDevText();
}

var drawBackground = function () {
    var cols = map.Width / 300;
    var rows = map.Height / 200;

    for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
            if (grass1Ready) {
                ctx.drawImage(grass1Image, c * 300 + map.X, r * 200 + map.Y);
            }
        }
    }
}

var drawGameVariables = function () {
    for (var i = 0; i < resources.length; i++) {
        resources[i].Draw();
    }

    for (var i = 0; i < cpuList.length; i++) {
        cpuList[i].Draw();
    }

    for (var i = 0; i < rogueBots.length; i++) {
        rogueBots[i].Draw();
    }

    if (!(actionMenu == "undefined" || actionMenu == null)) {
        actionMenu.Draw();
    }
}

var drawMap = function () {
    if (!showMap) {
        return;
    }

    ctx.save();

    // Background/Border
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "black";
    ctx.fillRect(mapView.X, mapView.Y, mapView.Width, mapView.Height);

    // Game Landmarks
    for (var i = 0; i < cpuList.length; i++) {
        ctx.fillStyle = cpuList[i].Color;
        ctx.fillRect(
			(cpuList[i].Bounds.X / 20) + mapView.X,
			(cpuList[i].Bounds.Y / 20) + mapView.Y,
			cpuList[i].Bounds.Width / 10,
			cpuList[i].Bounds.Height / 10);
    }

    // View Rect
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "lightblue";
    var x = map.X < 0 ? map.X * -1 : map.X;
    var y = map.Y < 0 ? map.Y * -1 : map.Y;
    var w = (_screenRect.Width * 150) / (map.Width);
    var h = (_screenRect.Height * 100) / (map.Height);
    ctx.fillRect(x / 20 + mapView.X, y / 20 + mapView.Y, w, h);

    ctx.restore();
}

var drawScreenMovementBars = function () {
    ctx.save();
    ctx.globalAlpha = 0.7;

    if (screenMoveStates.left == 1) {
        if (verticalScreenMoveReady) {
            ctx.drawImage(verticalScreenMoveImage,
				leftScreenMoveRect.X, leftScreenMoveRect.Y,
				leftScreenMoveRect.Width, leftScreenMoveRect.Height);
        }
    }

    if (screenMoveStates.top == 1) {
        if (horizontalScreenMoveReady) {
            ctx.drawImage(horizontalScreenMoveImage,
				topScreenMoveRect.X, topScreenMoveRect.Y,
				topScreenMoveRect.Width, topScreenMoveRect.Height);
        }
    }

    if (screenMoveStates.right == 1) {
        if (verticalScreenMoveReady) {
            ctx.drawImage(verticalScreenMoveImage,
				rightScreenMoveRect.X, rightScreenMoveRect.Y,
				rightScreenMoveRect.Width, rightScreenMoveRect.Height);
        }
    }

    if (screenMoveStates.bottom == 1) {
        if (horizontalScreenMoveReady) {
            ctx.drawImage(horizontalScreenMoveImage,
				bottomScreenMoveRect.X, bottomScreenMoveRect.Y,
				bottomScreenMoveRect.Width, bottomScreenMoveRect.Height);
        }
    }

    ctx.restore();
}

var drawDevText = function () {
    if (!showDevText) {
        return;
    }

    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "black"
    ctx.fillRect(_screenRect.X, _screenRect.Y, _screenRect.Width, _screenRect.Height);
    ctx.restore();

    ctx.save();

    ctx.fillStyle = "gray"

    ctx.font = "bold 15px serif";
    ctx.fillStyle = "yellow";
    ctx.fillText("FPS: " + fps.getFPS(), 225, 20);
    ctx.fillText("Mouse Outside: " + _mouseOutSide, 285, 20);
    ctx.fillText(
		"x: " + Math.round(_mousePoint.x).toString() +
		" y: " + Math.round(_mousePoint.y).toString(), 225, 40);

    ctx.font = "bold 18px Consolas";
    ctx.fillStyle = "yellow";
    ctx.fillText("TODO:", 225, 60);
    ctx.fillText("* Implement resource harvesting delay", 225, 80);
    ctx.fillText("* Add hp selection bar", 225, 100);
    ctx.fillText("* Mark cpu's and bots with color to identify them form each other", 225, 120);
    ctx.fillText("* Implement selection bar/effect for cpu/bot/resource", 225, 140);
    ctx.fillText("* Bot map collision, prevent out of bounds movement", 225, 160);
    ctx.fillText("* Implement wait time on screen move rects", 225, 180);
    ctx.fillText("* Implement bot defend action. Bots gather around CPU, giving them offence", 225, 200);
    ctx.fillText("* Implement bot speed change on payload empty/full", 225, 220);
    ctx.fillText("- Implement rogue/enemy bots. Mature bot leaves CPU and convert to predator.", 225, 240);
    ctx.fillText("- Implement neural network that bots use to find resources.", 225, 260);
    ctx.fillText("  Rogue bots will turn into advanced CPU, that passes down search data.", 225, 280);
    ctx.fillText("  The new CPU will spawn more intelligent bots.", 225, 300);
    ctx.fillText("* Performance improvement, only draw objects in screen rect.", 225, 320);
    ctx.fillText("* Resources, regenerate mode(prevent harvesting), restore units.", 225, 340);
    ctx.fillText("* Resource must not spawn in cpu bounds.", 225, 360);
    ctx.fillText("- Bot collision and avoidance checking with other bots.", 225, 380);
    ctx.fillText("* Move grass tiles when map moves.", 225, 400);
    ctx.fillText("* Use duplicate image data to create shadow image at offset", 225, 420);
    ctx.restore();
}

var drawSelectionOrb = function (rect, radius, color) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(rect.X + (rect.Width / 2) + map.X, rect.Y + (rect.Height / 2) + map.Y, radius + 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

var keyPress = function (keyCode) {
    if (keyCode == 109) { // M	
        showMap = !showMap;
    }

    if (keyCode == 110) { // N
        showDevText = !showDevText;
    }
}

var mouseDown = function (x, y) {
    var mouseRect = new Rect(x, y, 1, 1);

    if (!(actionMenu == "undefined" || actionMenu == null)) {
        if (actionMenu.Click(x, y)) {
            return;
        }
    }

    selectedGameObject = null

    // Deselect CPU
    for (var i = 0; i < cpuList.length; i++) {
        cpuList[i].Selected = false;

        // Deselect Bot
        for (var j = 0; j < cpuList[i].Bots.length; j++) {
            cpuList[i].Bots[j].Selected = false;
        }
    }

    // Deselect Resources
    for (var i = 0; i < resources.length; i++) {
        resources[i].Selected = false;
    }


    // Check CPU selection
    for (var i = 0; i < cpuList.length; i++) {
        if (checkObjectSelection(cpuList[i], mouseRect)) {
            selectedGameObject = cpuList[i];
            break
        }

        // Check Bot selection
        for (var j = 0; j < cpuList[i].Bots.length; j++) {
            if (checkObjectSelection(cpuList[i].Bots[j], mouseRect)) {
                selectedGameObject = cpuList[i].Bots[j];
                break;
            }
        }
    }

    // Check Resources
    for (var i = 0; i < resources.length; i++) {
        if (checkObjectSelection(resources[i], mouseRect)) {
            selectedGameObject = resources[i];
            break;
        }
    }

    if (selectedGameObject == null) {
        actionMenu = null;
    }
    else {
        actionMenu = new ActionMenu(selectedGameObject);
    }
}

var checkObjectSelection = function (obj1, mouseRect) {
    // obj.Bounds must be adjusted to the current screen view.
    var bounds = new Rect(
		obj1.Bounds.X + map.X,
		obj1.Bounds.Y + map.Y,
		obj1.Bounds.Width,
		obj1.Bounds.Height)

    if (IntersectRect(mouseRect, bounds)) {
        obj1.Selected = true;
        actionMenu = new ActionMenu(obj1);
    }
    else {
        obj1.Selected = false;
    }

    return obj1.Selected;
}

var click = function (x, y) {
    var mouseRect = new Rect(x, y, 1, 1);

    if (showMap) {
        clickMapView(mouseRect);
    }
}

var clickMapView = function (mouseRect) {
    if (IntersectRect(mapView, mouseRect)) {
        var x = (mouseRect.X - mapView.X) * 20;
        var y = (mouseRect.Y - mapView.Y) * 20;

        // Prevent out of bounds movement.
        if (x > map.Width || y > map.Height) {
            return;
        }

        // Not entirely out of bounds, but
        // new screen rect would be.
        if (x + _screenRect.Width > map.Width) {
            x = map.Width - _screenRect.Width;
        }

        if (y + _screenRect.Height > map.Height) {
            y = map.Height - _screenRect.Height;
        }

        map.X = -x;
        map.Y = -y;

        screenMoveStates.left = 0;
        screenMoveStates.top = 0;
        screenMoveStates.right = 0;
        screenMoveStates.bottom = 0;
    }
}

var addRogueBot = function (location, selected) {
    var rogue = new RogueBot(
		location.X + map.X, location.Y + map.Y, 20, 20, rogue1Image);
    rogue.Selected = selected;
    rogueBots.push(rogue);
}


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

    this.HP = 1000;
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

CPU.prototype.CreateBot = function (cpu) {
    var botCost = 100;

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


function Bot(parentCPU) {
    this.Title = "BOT"
    this.Image = null;
    this.Selected = false;
    this.Bounds = new Rect(0, 0, 10, 10);
    this.PayloadUnits = 0;
    this.MaxPayload = 10;
    this.CurrentResource = null;
    this.PayloadType = { Iron: 0 };
    this.ParentCPU = parentCPU;
    this.Color = this.ParentCPU.Color;
    this.States = { Searching: 1, Harvesting: 0, Defending: 0, Mutating: 0 };
    this.Speed = 50;
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
    // Bot will search for resource objects by random movements
    // and scanning areas. When resource found, it will be added
    // to the CPU's resource list.
    // Bot will change states to harvesting.
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
        // TODO: Ensure resource is in harvest range.
        // Perform harvest.
        if (IntersectRect(this.CurrentResource.Bounds, this.Bounds)) {
            if (this.CurrentResource.Units == 0) {
                this.CurrentResource = null;
            }
            else if (this.CurrentResource.Units < this.MaxPayload && this.CurrentResource.Units > 0) {
                // Resource depleted				
                // TODO:
                // Since this is only a partial harvest, the harvest tick should also
                // only be partial of the normal. Full time will apply until fixed.
                this.HarvestTick = this.CurrentResource.HarvestingModifier;
                this.PayloadUnits += this.CurrentResource.Units;
                this.CurrentResource.Units -= this.CurrentResource.Units;
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

Bot.prototype.CheckAwareness = function () {
    var luckyNumber = RandomBetween(1, 7);
    if (luckyNumber == 7) {
        this.Awareness += 1;
    }
}


function RogueBot(x, y, width, height, image) {
    this.Bounds = new Rect(x, y, width, height);
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
            var targetFound = false;
            for (var x = 0; x < cpuList[i].Bots.length; x++) {
                var dist = DistanceBetweenPoints(
					cpuList[i].Bots[x].Centre, this.Centre);

                // Target the first bot within range.
                // This will often chose a bot that is not the closest
                // possible match, but this will prevent looping all bots.
                if (dist <= this.AttackRange) {
                    targetFound = true;
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
        // Roque follows and intersects bot, points are added
        // for each successfull intersect. After x point deduct
        // bot health.

        // Check if bot hp is 0.
        if (true) {
            //this.AttackTarget = null;
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

    this.Bounds.X += this.Velocity.X;
    this.Bounds.Y += this.Velocity.Y;
}

RogueBot.prototype.Draw = function () {
    ctx.drawImage(this.Image,
		this.Bounds.X + map.X,
		this.Bounds.Y + map.Y,
		this.Bounds.Width,
		this.Bounds.Height);
}


function Resource(type, x, y, width, height, image) {
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
        return;
    }


    var percentage = this.Units * 100 / this.MaxUnits;
    var capacityHeight = this.Bounds.Height * percentage / 100;

    ctx.fillStyle = "maroon";
    ctx.fillRect(this.Bounds.X + map.X, this.Bounds.Y + map.Y, this.Bounds.Width, this.Bounds.Height);

    ctx.fillStyle = "gold";
    ctx.fillRect(this.Bounds.X + map.X, this.Bounds.Y + map.Y, this.Bounds.Width, capacityHeight);
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



// Utils

function Point(x, y) {
    this.X = x;
    this.Y = y;
}

function Rect(x, y, width, height) {
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;
}

var fps = {
    startTime: 0,
    frameNumber: 0,
    getFPS: function () {
        this.frameNumber++;
        var d = new Date().getTime(),
			currentTime = (d - this.startTime) / 1000,
			result = Math.floor((this.frameNumber / currentTime));

        if (currentTime > 1) {
            this.startTime = new Date().getTime();
            this.frameNumber = 0;
        }
        return result;

    }
};

var ColorizeImage = function (image, width, height, r, g, b) {
    var memCanvas = document.createElement('canvas');
    memCanvas.height = '500';
    memCanvas.width = '500';
    var memCtx = memCanvas.getContext('2d');

    memCtx.drawImage(image, 0, 0, width, height);

    var imageData = memCtx.getImageData(0, 0, width, height);
    var pixels = imageData.data;
    var numPixels = pixels.length;

    memCtx.clearRect(0, 0, width, height);

    for (var i = 0; i < numPixels; i++) {
        var average = (pixels[i * 4] + pixels[i * 4 + 1] + pixels[i * 4 + 2]) / 3;
        // set red green and blue pixels to the average value
        pixels[i * 4] = average + r;
        pixels[i * 4 + 1] = average + g;
        pixels[i * 4 + 2] = average + b;
    }

    return imageData;
    //ctx.putImageData(imageData, imageRect.X, imageRect.Y);
}

var IntersectRect = function (r1, r2) {
    return !(r2.X > (r1.X + r1.Width) ||
             (r2.X + r2.Width) < r1.X ||
             r2.Y > (r1.Y + r1.Height) ||
             (r2.Y + r2.Height) < r1.Y);
}

var CalculateAngle = function (ax, ay, bx, by) {
    var ra = Math.PI / 180;
    var deg = 180 / Math.PI;
    var x = bx - ax;
    var y = ay - by;

    var angle = 0;

    y = y * ra;
    x = x * ra;

    if (x >= 0 && y >= 0) {
        angle = 90 - Math.atan(y / x) * deg;

    }
    else if (x >= 0 && y <= 0) {
        angle = 90 + Math.abs(Math.atan(y / x) * deg);

    }
    else if (x <= 0 && y <= 0) {
        angle = 270 - Math.atan(y / x) * deg;

    }
    else if (x <= 0 && y >= 0) {
        angle = 270 + Math.abs(Math.atan(y / x) * deg);
    }

    return angle;
}

var RandomBetween = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

var DistanceBetweenPoints = function (p1, p2) {
    var tx = p1.X - p2.X;
    var ty = p1.Y - p2.Y;
    return Math.sqrt(tx * tx + ty * ty);
}

var GetRadiansFromPoints = function (p1, p2) {
    var tx = p1.X - p2.X;
    var ty = p1.Y - p2.Y;
    return Math.atan2(ty, tx);
}

var GetVelocityFromPointsAndSpeed = function (p1, p2, speed) {
    var tx = p1.X - p2.X;
    var ty = p1.Y - p2.Y;
    var dist = Math.sqrt(tx * tx + ty * ty);
    var rad = Math.atan2(ty, tx);
    var angle = rad / Math.PI * 180;
    var velX = (tx / dist) * speed;
    var velY = (ty / dist) * speed;
    return new Point(velX, velY);
}
