

Goomba = function(mario){
	    game.load.spritesheet('goomba', 'assets/images/enemies/goomba.gif', 32, 32);
}

Goomba.prototype.create = function(){

    this.goomba = game.add.sprite(game.world.width/2+Math.random()*400, 32, 'goomba');

    // Goomba tiene física
    game.physics.arcade.enable(this.goomba);

    this.goomba.body.bounce.y = 0.2;
    this.goomba.body.bounce.x = 1;    
    this.goomba.body.gravity.y = 600;
    this.goomba.body.collideWorldBounds = true;

    this.goomba.animations.add('walk', [0, 1], 10, true);
    this.goomba.animations.play('walk');
    this.goomba.body.velocity.x = 100;
}

Goomba.prototype.update = function(plataformas,mario){
    
    game.physics.arcade.collide(this.goomba, plataformas);

    this.mario = mario;
    if(mario.alive())
    	game.physics.arcade.overlap(mario.sprite(), this.goomba, this.killMario, null, this);
}


Goomba.prototype.killMario = function(mariosprite,goomba){
    //Si le damos con los pies muere goomba
    if(mariosprite.body.y<goomba.body.y-16)
    {
        mariosprite.body.velocity.y=-500;
        goomba.kill();
    }
    else
        this.mario.kill();

}
