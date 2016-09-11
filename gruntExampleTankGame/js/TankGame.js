var TankGame = TankGame || {};


// -------------------------------------
//
// -------------------------------------

TankGame.Faction = {
    PLAYER: 0,
    ENEMY:  1
};

// -------------------------------------
//
// -------------------------------------

TankGame.Game = function (game) {
    this.game = game;
    console.log("game");
};

TankGame.Game.prototype = {
    create: function () {

        console.log("game created");

        this.game.world.boot();
        this.entities = [];
        this.score = 0;

        // Create the layers where objects will reside, the layers will be rendered in order
        this.layerGround = this.game.add.group();
        this.layerObjects = this.game.add.group();
        this.layerAir = this.game.add.group();
        this.layerGUI = this.game.add.group();
        this.rootGUI = this.layerGUI.add(new Phaser.Sprite(this.game, 0, 0, "empty"));
        this.rootGUI.fixedToCamera = true;

        // Create the ground map that we loaded and resize the world to be that size
        var map = this.game.add.tilemap("desert");
        var tileset = this.game.add.tileset("desertgfx");
        tileset.setCollisionRange(0, 2, true, true, true, true);
        tileset.setCollisionRange(8, 10, true, true, true, true);
        tileset.setCollisionRange(16, 20, true, true, true, true);
        tileset.setCollisionRange(27, 28, true, true, true, true);

        this.mapLayer = new Phaser.TilemapLayer(this.game, 0, 0, this.game.width, this.game.height, tileset, map, 0);
        this.mapLayer.resizeWorld();
        this.layerGround.add(this.mapLayer);

        // Create the appropriate gameobjects
        // Player
        this.player = new TankGame.TankObject(this.game, 300, 300, 45, this, 10, TankGame.Faction.PLAYER);
        this.layerObjects.add(this.player.bodySpr);
        this.entities.push(this.player);
        // One enemy
        this.SpawnEnemyTank();

        // Create GUI
        var button = new Phaser.Button(this.game, 0, 0, 'pausebtn', this.quitGame, this, 1, 0, 2);
        this.rootGUI.addChild(button);
        this.scoreLabel = new Phaser.BitmapText(this.game, 200, 0, '', { font: 'Gunplay80', fill: "#FFFFFF" });
        this.rootGUI.addChild(this.scoreLabel);
        this.playerLifebar = new Phaser.Graphics(this.game, 400, 10);
        this.rootGUI.addChild(this.playerLifebar);
        this.gameOverLabel = null;

        // Hook input
        this.game.input.onUp.add(this.onClick, this);
        this.game.camera.follow(this.player.bodySpr);
    },

    SpawnEnemyTank: function () {
        var enemyTank = new TankGame.TankObject(this.game, this.game.world.randomX, this.game.world.randomY, Math.random()*Phaser.Math.PI2, this, 1, TankGame.Faction.ENEMY);
        enemyTank.AttackTo(this.player);
        this.layerObjects.add(enemyTank.bodySpr);
        this.entities.push(enemyTank);
    },

    update: function () {
        var dt = this.game.time.elapsed/1000;
        var i;
        // Check collisions with map
        //this.game.physics.collide(this.player.sprite, this.mapLayer);

        // Run entities
        var numEntities = this.entities.length;
        for (i = 0; i < numEntities; ++i) {
            if (!this.entities[i].dead)
                this.entities[i].update(dt);
        }

        // Collisions
        numEntities = this.entities.length;
        for (i = 0; i < numEntities; ++i) {
            var e1 = this.entities[i];
            if (!e1.dead && e1.type == TankGame.EntityType.SHOT) {
                for (var j = 0; j < numEntities; ++j) {
                    var e2 = this.entities[j];

                    // Check for collisions if the entities are different faction, the first is a SHOT and the second a TANK
                    if (!e2.dead && e1.faction != e2.faction && e2.type == TankGame.EntityType.TANK) {
                        if (Phaser.Math.distance(e1.bodySpr.x, e1.bodySpr.y, e2.bodySpr.x, e2.bodySpr.y) < (30 + 8)) {
                            // Kill the shot, damage the TANK
                            e1.dead = true;
                            e2.life -= 1;
                            // Show an explosion
                            var explosion = new Phaser.Sprite(this.game, e2.bodySpr.x, e2.bodySpr.y, 'explosion', 0, true);
                            explosion.anchor.setTo(0.5, 0.5);
                            explosion.scale.setTo(1.5, 1.5);
                            explosion.animations.add('kaboom');
                            explosion.play('kaboom', 30, false, true);
                            this.layerObjects.add(explosion);
                            // If the TANK is dead, kill it too
                            if (e2.life <= 0) {
                                var crater = new Phaser.Sprite(this.game, e2.bodySpr.x, e2.bodySpr.y, 'crater');
                                crater.anchor.setTo(0.5, 0.5);
                                this.layerGround.add(crater);
                                e2.dead = true;
                                if (e1.faction == TankGame.Faction.PLAYER) {
                                    // Player killed an enemy, spawn two more
                                    this.score += 1;
                                    this.SpawnEnemyTank();
                                    this.SpawnEnemyTank();
                                }
                            }
                        }
                    }
                }
            }
        }

        // Destroy dead entities
        // Scan from the end because we're removing from the array
        for (i = this.entities.length-1; i >= 0; --i) {
            var e = this.entities[i];
            if (e.dead) {
                e.bodySpr.destroy();
                this.entities.splice(i, 1);
            }
        }

        // Update GUI controls
        this.scoreLabel.setText('' + this.score);
        this.playerLifebar.clear();
        this.playerLifebar.beginFill(0xFF0000, 1);
        this.playerLifebar.drawRect(0, 0, 300, 40);
        this.playerLifebar.beginFill(0x00FF00, 1);
        this.playerLifebar.drawRect(0, 0, 300*this.player.life/10, 40);
        // Create game over logo if needed
        if (this.player.dead && this.gameOverLabel === null) {
            this.gameOverLabel = new Phaser.Text(this.game, this.game.width/2, this.game.height/2, 'Game Over', { font: '96px GunplayTTF', fill: "#FF0000", align:"center" });
            this.gameOverLabel.anchor.setTo(0.5, 0.5);
            this.rootGUI.addChild(this.gameOverLabel);
        }
    },

    onClick: function() {
        if (!this.player.dead) {
            // Create and animate target sprite
            var target = this.layerGround.add(new Phaser.Sprite(this.game, this.game.input.worldX, this.game.input.worldY, "target"));
            target.anchor.setTo(0.5, 0.5);
            this.game.add.tween(target).to({}, 500, Phaser.Easing.Quadratic.In, true)
                .onUpdateCallback(function(t) { this.scale.setTo(1-t, 1-t); })
                .onCompleteCallback(function() { this.destroy(); });

            // Command the player tank to go there
            this.player.MoveTo(target.position);
        }
    },

    quitGame: function () {
        this.game.state.start('mainmenu');
    }
};
