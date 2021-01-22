function CollisionEntity(bounds, isDynamic) {
    this.Bounds = bounds;
    this.IsDynamic = isDynamic;
    collisionEntityIndex += 1;
    this.Id = collisionEntityIndex;
    collisionEntities.push(this);
}

CollisionEntity.prototype.ApplyVelocity = function(velocity) {
    this.Bounds.X += velocity.X;
    this.Bounds.Y += velocity.Y;
}