var TankGame = TankGame || {};

// -------------------------------------
//
// -------------------------------------
TankGame.Preloader = function (game) {
    this.game = game;
    console.log("preloader");
};

TankGame.Preloader.prototype = {
    preload: function () {
        this.game.load.image('menubkg', 'images/MenuBackground.png');
        this.game.load.spritesheet('startbtn', 'images/StartGameBtn.png', 0, -3);
        this.game.load.spritesheet('quitbtn', 'images/QuitGameBtn.png', 0, -3);
        this.game.load.spritesheet('creditsbtn', 'images/CreditsBtn.png', 0, -3);
        this.game.load.spritesheet('pausebtn', 'images/PauseBtn.png', 0, -3);
        this.game.load.spritesheet('explosion', 'images/explosion.png', -5, -5);

        this.game.load.bitmapFont('Gunplay', 'fonts/gunplay36_0.png', 'fonts/gunplay36.fnt');
        this.game.load.bitmapFont('Gunplay80', 'fonts/gunplay80_0.png', 'fonts/gunplay80.fnt');

        this.game.load.image('empty', 'images/empty.png');

        this.game.load.image('target', 'images/Target.png');
        this.game.load.image('tankbody', 'images/GreenTankBody.png');
        this.game.load.image('tankturret', 'images/GreenTankTurret.png');
        this.game.load.image('shot', 'images/Shot.png');
        this.game.load.image('crater', 'images/Crater.png');

        this.game.load.tilemap('desert', 'maps/desert.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.tileset('desertgfx', 'maps/tmw_desert_spacing.png', 32, 32, -1, 1, 1);
    },
    update: function () {
        console.log("preloader created");
        this.game.state.start('mainmenu');
    }
};

// -------------------------------------
//
// -------------------------------------

TankGame.MainMenu = function (game) {
    this.game = game;
    console.log("mainmenu");
};

TankGame.MainMenu.prototype = {
    create: function () {
        console.log("mainmenu created");

        // Reset boundaries and camera
        this.game.world.bounds.setTo(0, 0, this.game.width, this.game.height);
        this.game.world.boot();

        // Create background
        var bg = this.game.add.sprite(0, 0, 'menubkg');

        // Create tank and attached turret
        var tank = this.game.add.sprite(100, 250, 'tankbody');
        tank.anchor.setTo(0.5, 0.5);
        var turret = new Phaser.Sprite(this.game, -tank.width*0.1, 0, 'tankturret');
        turret.anchor.setTo(0.25, 0.5);
        tank.addChild(turret);

        // Give some automatic looping movement to tank & turret
        this.game.add.tween(tank).to({ x: 700 }, 2000, Phaser.Easing.Quadratic.InOut)
            .to({ rotation: Math.PI/2 }, 1000, Phaser.Easing.Linear.None)
            .to({ y: 500 }, 1000, Phaser.Easing.Quadratic.InOut)
            .to({ rotation: Math.PI }, 1000, Phaser.Easing.Linear.None)
            .to({ x: 100 }, 2000, Phaser.Easing.Quadratic.InOut)
            .to({ rotation: -Math.PI/2 }, 1000, Phaser.Easing.Linear.None)
            .to({ y: 250 }, 1000, Phaser.Easing.Quadratic.InOut)
            .to({ rotation: 0 }, 1000, Phaser.Easing.Linear.None)
            .loop()
            .start();

        this.game.add.tween(turret)
            .to({ rotation: Math.PI/4 }, 1000, Phaser.Easing.Linear.None)
            .to({ rotation: -Math.PI/4 }, 1000, Phaser.Easing.Linear.None)
            .loop()
            .start();

        // Menu buttons
        var button;
        button = this.game.add.button(this.game.width/2, 325, 'startbtn', this.startGame, this, 1, 0, 2);
        button.anchor.setTo(0.5, 0.5);
        button = this.game.add.button(this.game.width/2, 425, 'creditsbtn', this.credits, this, 1, 0, 2);
        button.anchor.setTo(0.5, 0.5);
    },

    startGame: function () {
        this.game.state.start('game');
    },
    credits: function () {
        this.game.state.start('creditsmenu');
    }
};

// -------------------------------------
//
// -------------------------------------

TankGame.CreditsMenu = function (game) {
    this.game = game;
    console.log("creditsmenu");
};

TankGame.CreditsMenu.prototype = {
    create: function () {
        console.log("creditsmenu created");

        this.stage.backgroundColor = "#F9CA8D";
        this.game.add.text(this.game.world.centerX, 100, 'Credits', { font: '96px GunplayTTF', fill: "#FFFFFF", align: 'center' }).anchor.setTo(0.5, 0.5);
        this.creditsText = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, 'Tank Game\nby\nJavier Arevalo\nyeah', { font: 'Gunplay', fill: "#FFFFFF", align: 'center' });
        this.creditsText.anchor.setTo(0.5, 0.5);

        this.game.input.onUp.add(this.quitCredits, this);
    },

    update: function() {
        this.creditsText.rotation += 0.03;
    },

    quitCredits: function () {
        this.game.state.start('mainmenu');
    }
};
