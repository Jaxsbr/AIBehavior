function CollisionEntity(bounds) {
    this.Bounds = bounds;
}

CollisionEntity.prototype.ApplyVelocity = function(velocity) {
    this.Bounds.X += velocity.X;
    this.Bounds.Y += velocity.Y;
}