var init = function () {
    then = Date.now();
    initCanvas();
    initKeyboardEvents();
    initMouseEvents();
    initImages();
    initMap();
    initCPUs();
    initResources();
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
    grass1Image.src = "img/grass1.jpg";

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
    cpuImage.src = "img/cpu3.png";

    bot1Image.onload = function () {
        bot1Ready = true;
    }
    bot1Image.src = "img/bot3.png";

    bot2Image.onload = function () {
        bot2Ready = true;
    }
    bot2Image.src = "img/bot3.png";

    rogue1Image.onload = function () {
        rogue1Ready = true;
    }
    rogue1Image.src = "img/rogue2.png";
}

var initCPUs = function () {
    cpuList.push(new CPU(400, 400, cpuStartSize, cpuStartSize, "yellow", cpuImage));
    cpuList.push(new CPU(800, 800, cpuStartSize, cpuStartSize, "blue", cpuImage));
    cpuList.push(new CPU(1200, 1200, cpuStartSize, cpuStartSize, "red", cpuImage));
    cpuList.push(new CPU(1600, 1400, cpuStartSize, cpuStartSize, "purple", cpuImage));
    cpuList.push(new CPU(2900, 1900, cpuStartSize, cpuStartSize, "orange", cpuImage));
}

var initMap = function () {
    map = new Rect(0, 0, mapWidth, mapHeight);
    mapView = new Rect(
		_screenRect.Width - 150 - 10, _screenRect.Height - 100 - 10, 150, 100);

    leftScreenMoveRect = new Rect(_screenRect.X, _screenRect.Y, 25, _screenRect.Height);
    topScreenMoveRect = new Rect(_screenRect.X, _screenRect.Y, _screenRect.Width, 25);
    rightScreenMoveRect = new Rect(_screenRect.Width - 25, _screenRect.Y, 25, _screenRect.Height);
    bottomScreenMoveRect = new Rect(_screenRect.X, _screenRect.Height - 25, _screenRect.Width, 25);
}

var initResources = function () {
    maxResources = RandomBetween(minRandomResourceCount, maxRandomResourceCount);

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
    var cols = map.Width / backgroundTileWidth;
    var rows = map.Height / backgroundTileHeight;

    for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
            if (grass1Ready) {
                ctx.drawImage(grass1Image, c * backgroundTileWidth + map.X, r * backgroundTileHeight + map.Y);
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

    if (keyCode == 100) { // D
        showDebug = !showDebug;
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
		location.X + map.X, location.Y + map.Y, rogueBotStartSize, rogueBotStartSize, rogue1Image);
    rogue.Selected = selected;
    rogueBots.push(rogue);
}