var UpdateAllEntityCollisions = function() {
    for (var index = 0; index < collisionEntities.length; index++) {
        var currentCollisionEntity = collisionEntities[index];
        if (!currentCollisionEntity.IsDynamic) { continue; }

        var nearestCollisionEntity = GetNearestCollisionEntity(currentCollisionEntity);
        UpdateCollision(currentCollisionEntity, nearestCollisionEntity);
    }
}

var GetNearestCollisionEntity = function(thisCollisionEntity) {
    // Assign nearest enemy to enemy collision
    var nearestIndex = -1;
    var nearestDistance = 0;
    var thisCollisionEntityCenter = new Point(
        thisCollisionEntity.Bounds.X - (thisCollisionEntity.Bounds.Width / 2),
        thisCollisionEntity.Bounds.Y - (thisCollisionEntity.Bounds.Height / 2),
    );

    for (var x = 0; x < collisionEntities.length; x++) {
        if (x == thisCollisionEntity.Id) { continue; } // Exclude entity self from check

        var currentCollisionEntity = collisionEntities[x];
        var currentCollisionEntityCenter = new Point(
            currentCollisionEntity.Bounds.X - (currentCollisionEntity.Bounds.Width / 2),
            currentCollisionEntity.Bounds.Y - (currentCollisionEntity.Bounds.Height / 2),
        );
        var distance = DistanceBetweenPoints(currentCollisionEntityCenter, thisCollisionEntityCenter);

        if (nearestIndex == -1) {
            nearestIndex = x;
            nearestDistance = distance;
        }

        if (nearestDistance > distance) {
            nearestIndex = x;
            nearestDistance = distance;
        }            
    }

    if (nearestIndex != -1) { //&& IntersectRect(thisCollisionEntity.Bounds, currentCollisionEntity.Bounds)) {
        return collisionEntities[nearestIndex];
    }
    return null;
}

var UpdateCollision = function (thisCollisionEntity, nearestCollisionEntity) {
    if (nearestCollisionEntity == null) { return; }

    var myRadius = thisCollisionEntity.Bounds.Height / 2;
    var myCentre = new Point(
        thisCollisionEntity.Bounds.X + thisCollisionEntity.Bounds.Width / 2,
        thisCollisionEntity.Bounds.Y + thisCollisionEntity.Bounds.Height / 2
    );
    var myForce = 0;
    var myReverse = 0;
    var obsRadius = nearestCollisionEntity.Bounds.Height / 2;
    var obsCentre = new Point(
        nearestCollisionEntity.Bounds.X + nearestCollisionEntity.Bounds.Width / 2,
        nearestCollisionEntity.Bounds.Y + nearestCollisionEntity.Bounds.Height / 2
    );
    var obsForce = 0;

    var betweenDistance = DistanceBetweenPoints(myCentre, obsCentre);
    var collideDistance = myRadius + obsRadius;

    // Collision based on sphere intersection.
    if (betweenDistance <= collideDistance) {
        var collisionVector = new Point(myCentre.X - obsCentre.X, myCentre.Y - obsCentre.Y);
        collisionVector.X = collisionVector.X == 0 || collideDistance == 0 ? 0 : collisionVector.X / collideDistance;
        collisionVector.Y = collisionVector.Y == 0 || collideDistance == 0 ? 0 : collisionVector.Y / collideDistance;

        //dot function
        myForce = myCentre.X * collisionVector.X + myCentre.Y * collisionVector.Y;
        obsForce = obsCentre.X * collisionVector.X + obsCentre.Y * collisionVector.Y;

        myReverse = obsForce;

        var myValue = myReverse - myForce;

        var myReverseVelocity = new Point(myValue * collisionVector.X, myValue * collisionVector.Y);

        if (myReverseVelocity.X < 0) {
            myReverseVelocity.X = myReverseVelocity.X < -baseCollisionForce ? -baseCollisionForce : myReverseVelocity.X;
        }
        else if (myReverseVelocity.X > 0) {
            myReverseVelocity.X = myReverseVelocity.X > baseCollisionForce ? baseCollisionForce : myReverseVelocity.X;
        }

        if (myReverseVelocity.Y < 0) {
            myReverseVelocity.Y = myReverseVelocity.Y < -baseCollisionForce ? -baseCollisionForce : myReverseVelocity.Y;
        }
        else if (myReverseVelocity.Y > 0) {
            myReverseVelocity.Y = myReverseVelocity.Y > baseCollisionForce ? baseCollisionForce : myReverseVelocity.Y;
        }

        thisCollisionEntity.ApplyVelocity(new Point(-myReverseVelocity.X, -myReverseVelocity.Y));
    }
}