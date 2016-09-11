

Coins = function(texto){
    game.load.image('moneda', 'assets/images/tiles/basement/6.gif');
    game.load.audio('snd_moneda', ['assets/audio/coin.mp3', 'assets/audio/coin.ogg']);
    this.text = texto;
}

Coins.prototype.create = function(){
    this.monedas = game.add.group();
    this.monedas.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var coin = this.monedas.create(i * 70, 0, 'moneda');

        //  Let gravity do its thing
        coin.body.gravity.y = 1000;
        coin.body.gravity.x = Math.random()*100-50;
        coin.body.collideWorldBounds = true;

        //  This just gives each star a slightly random bounce value
        coin.body.bounce.y = 0.7 + Math.random() * 0.2;
        coin.body.bounce.x = 1;
    }

    this.snd_moneda = game.add.audio('snd_moneda');

}

Coins.prototype.update = function(plataformas,mario){
    game.physics.arcade.collide(this.monedas,plataformas);
    game.physics.arcade.overlap(mario.sprite(), this.monedas, this.getmoneda, null, this);

}

Coins.prototype.getmoneda = function(spritemario, moneda){
    moneda.kill();
    this.snd_moneda.play();
    
    this.text.addscore(100);

    this.creaReward(moneda.body.center.x,moneda.body.center.y);
}

Coins.prototype.creaReward = function(x, y)
{
    reward = game.add.bitmapText(x,y,'snes','100', 20);
    timer = game.time.create(true);
    timer.repeat(10,50, 
        function (reward){
            reward.y-=2;
        },null,reward);

    timer.add(600,
        function (reward){
            reward.destroy(true);
        },null,reward);

    timer.start();
}
