
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