var TankGame = TankGame || {};

// -----------------------
// Entities
// - update(dt) where dt is seconds since last frame
// - bodySpr : the entity's main sprite
// - dead : set to true if entity has been killed
// - type : type of entity

TankGame.EntityType = {
    TANK: 0,
    SHOT: 1,
};

// -------------------------------------
//
// -------------------------------------

TankGame.Shot = function(game, x, y, rotation, faction, speed) {
    this.type = TankGame.EntityType.SHOT;
    this.game = game;
    this.faction = faction;
    this.dead = false;
    this.bodySpr = new Phaser.Sprite(this.game, x, y, 'shot');
    this.bodySpr.anchor.setTo(0.5, 0.5);
    this.bodySpr.rotation = rotation;
    this.timeToLive = 1;
    this.game.physics.velocityFromAngle(this.bodySpr.angle, speed, this.bodySpr.body.velocity);
};

TankGame.Shot.prototype = {
    update: function (dt) {
        this.timeToLive -= dt;
        if (this.timeToLive <= 0) {
            this.dead = true;
        }
    },
};

// -------------------------------------
//
// -------------------------------------

TankGame.TankObject = function(game, x, y, rotation, tankGame, life, faction) {
    this.type = TankGame.EntityType.TANK;
    this.game = game;
    this.tankGame = tankGame;
    this.life = life;
    this.faction = faction;

    this.dead = false;

    this.bodySpr = new Phaser.Sprite(this.game, x, y, 'tankbody');
    this.bodySpr.anchor.setTo(0.5, 0.5);
    this.bodySpr.rotation = rotation;
    this.turretSpr = new Phaser.Sprite(this.game, -this.bodySpr.width*0.1, 0, 'tankturret');
    this.turretSpr.anchor.setTo(0.25, 0.5);
    this.bodySpr.addChild(this.turretSpr);

    this.linearVelocity = 0;
    this.targetMove = null;
    this.targetTurret = null;

    this.shotCooldown = 0;
};

TankGame.TankObject.prototype = {

    MoveTo: function(target) {
        this.targetMove = target;
    },

    AttackTo: function(target) {
        this.targetAttack = target;
    },

    // Rotate sprite towards target angle
    turnSprite: function(spr, angleDiff) {
        spr.body.angularDrag = 0;
        if (Math.abs(angleDiff) < 0.05) {
            spr.body.angularAcceleration = 0;
            spr.body.angularVelocity = 0;
            spr.rotation += angleDiff;
        } else if (angleDiff < 0) {
            spr.body.angularVelocity = Math.max(spr.body.angularVelocity - 3, -60);
        } else {
            spr.body.angularVelocity = Math.min(spr.body.angularVelocity + 3, 60);
        }
    },

    updateAttack: function(dt) {
        // Check if we lost our target
        if (this.targetAttack) {
            if (this.targetAttack.dead) {
                this.targetAttack = null;
            } else {
                var targetDist = this.game.physics.distanceBetween(this.bodySpr, this.targetAttack.bodySpr);
                if (targetDist > 400) {
                    this.targetAttack = null;
                }
            }
        }
        // Rotate turret towards target if there is one, or ahead otherwise
        var targetAngle;
        if (this.targetAttack) {
            targetAngle = this.game.physics.angleBetween(this.turretSpr.world, this.targetAttack.bodySpr);
        } else {
            targetAngle = this.bodySpr.rotation;
        }
        var angleDiff = this.game.math.normalizeAngle(targetAngle - this.turretSpr.rotation - this.bodySpr.rotation);
        this.turnSprite(this.turretSpr, angleDiff);

        // If pointing at target, shoot
        if (this.targetAttack) {
            if (this.shotCooldown > 0) {
                this.shotCooldown -= dt;
            } else if (Math.abs(angleDiff) < 0.1) {
                var rot = this.turretSpr.rotation+this.bodySpr.rotation;
                var x = this.turretSpr.world.x + this.turretSpr.width*0.75*Math.cos(rot);
                var y = this.turretSpr.world.y + this.turretSpr.width*0.75*Math.sin(rot);
                var shot = new TankGame.Shot(this.game, x, y, rot, this.faction, (this.faction == TankGame.Faction.PLAYER)? 450 : 200);
                this.tankGame.layerAir.add(shot.bodySpr);
                this.tankGame.entities.push(shot);
                this.shotCooldown = 2;
            }
        }
    },

    updateMove: function() {
        var angleDiff;
        var targetDist;
        var targetAngle;
        // Compute relative distances to target
        if (this.targetMove) {
            targetDist = this.game.physics.distanceBetween(this.bodySpr, this.targetMove);
            targetAngle = this.game.physics.angleBetween(this.bodySpr, this.targetMove);
            angleDiff = this.game.math.normalizeAngle(targetAngle - this.bodySpr.rotation);

            if (targetDist < 20) {
                this.targetMove = null;
            }
        }

        // Move towards target if there is one, decelerate otherwise
        if (!this.targetMove) {
            // Decelerate
            this.linearVelocity = Math.max(this.linearVelocity - 3, 0);
            this.bodySpr.body.angularAcceleration = 0;
            this.bodySpr.body.angularVelocity = 0;
        } else {

            // Move in reverse if target is behind, otherwise forward
            var desiredLinearVelocity;
            if (Math.abs(angleDiff) > Math.PI/2) {
                desiredLinearVelocity = -20; // Reverse
            } else {
                // Use cos() to lower our top speed if we're not looking straight at target
                desiredLinearVelocity = 80*Math.cos(angleDiff);
            }
            if (desiredLinearVelocity < this.linearVelocity) {
                this.linearVelocity = Math.max(this.linearVelocity - 3, desiredLinearVelocity);
            } else {
                this.linearVelocity = Math.min(this.linearVelocity + 1, desiredLinearVelocity);
            }

            this.turnSprite(this.bodySpr, angleDiff);
        }

        // Set velocity from rotation and linear velocity
        this.game.physics.velocityFromAngle(this.bodySpr.angle, this.linearVelocity, this.bodySpr.body.velocity);

    },

    updateAI: function(dt) {
        // Generate a random target destination if we don't have one yet
        if (this.targetMove === null) {
            this.targetMove = new Phaser.Point(this.game.world.randomX, this.game.world.randomY);
        }
    },

    updateAttackAI: function() {
        // If we don't have a target to attack, choose the closest enemy tank
        if (!this.targetAttack) {
            var minDist = 10000; // Some large enough number
            for (var i = 0; i < this.tankGame.entities.length; ++i) {
                var e = this.tankGame.entities[i];
                // If this entity is not dead, an enemy of mine and a Tank
                if (!e.dead && e.faction != this.faction && e.type == TankGame.EntityType.TANK) {
                    var targetDist = this.game.physics.distanceBetween(this.bodySpr, e.bodySpr);
                    // Keep the one that's closest to me.
                    if (targetDist < minDist) {
                        minDist = targetDist;
                        this.targetAttack = e;
                    }
                }
            }
        }
    },

    update: function (dt) {
        if (this.faction == TankGame.Faction.ENEMY) {
            this.updateAI(dt);
        }
        this.updateAttackAI();
        this.updateMove();
        this.updateAttack(dt);
    },
};

