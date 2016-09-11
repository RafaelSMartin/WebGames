
Mario = function(){
        game.load.spritesheet('mario', 'assets/images/character/mario_small.gif', 32, 32);
}

Mario.prototype.create = function(){
 // The player and its settings
    this.player = game.add.sprite(32, game.world.height - 150, 'mario');

   // El jugador tiene física
    game.physics.arcade.enable(this.player);

    //  Player physics properties. Give the little guy a slight bounce.
    this.player.body.bounce.y = 0.2;
    this.player.body.gravity.y = 600;
    this.player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    this.player.animations.add('right', [0, 1, 2, 3], 10, true);
    this.player.animations.add('left', [14, 15, 16, 17], 10, true);

	this.cursors = game.input.keyboard.createCursorKeys();

    this.killed = false;
    this.direccion = 'right';
}

Mario.prototype.sprite = function(){
	return this.player;
}

Mario.prototype.kill = function(mario, goomba){
	this.player.body.velocity.x=0;
    this.player.body.velocity.y=-500;
    this.killed=true;
    this.player.body.collideWorldBounds = false;
    
    snd_main.stop();
    snd_die.play();
}

Mario.prototype.alive = function()
{
	return !this.killed;
}

Mario.prototype.update = function(plataformas){
    if(!this.killed)
        game.physics.arcade.collide(this.player, plataformas);

        //  Reset the players velocity (movement)
   this.player.body.velocity.x = 0;

    if(this.killed)
    {
        this.player.frame = 12;
        return;
    }

    if (this.cursors.left.isDown)
    {
        this.direccion = 'left';
        //  Move to the left
        this.player.body.velocity.x = -150;
        this.player.animations.play('left');
    }
    else if (this.cursors.right.isDown)
    {
        this.direccion = 'right';
        //  Move to the right
        this.player.body.velocity.x = 150;
        this.player.animations.play('right');
     }
    else
    {
        //  Stand still
        this.player.animations.stop();

        if(this.direccion == 'right')
            this.player.frame = 0;
        else
            this.player.frame = 14;
    }

    if(!this.player.body.touching.down)
    {
        if(this.direccion == 'right')
            this.player.frame = 4;
        else
            this.player.frame = 18;
    }

    //  Allow the player to jump if they are touching the ground.
    if (this.cursors.up.isDown && this.player.body.touching.down)
    {
        this.player.body.velocity.y = -450;
    }

}
