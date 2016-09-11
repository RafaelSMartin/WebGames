// JS Game Sample

// -----------------------
// Util functions

// Helper to provides requestAnimationFrame in a cross browser way.
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
            window.setTimeout( callback, 1000 / 60 );
        };
    } )();
}
/**
 * [CheckDistance description]
 * @param {[type]} x
 * @param {[type]} y
 * @param {[type]} r
 */
var CheckDistance = function(x,y,r) {
    return (x*x + y*y < r*r);
}

// -----------------------
// Sample game microengine

var canvas, ctx; // Rendering

// Assign to this object to receive callbacks:
// - tick(dt) where dt is seconds since last frame
// - click(x, y) where x, y are click coordinates
var handler;

var InitCanvas = function(container, width, height, className) {
    var containerElement = document.getElementById(container);
    canvas = document.createElement('canvas');
    // Handle error here for old browsers
    canvas.width = width;
    canvas.height = height;
    canvas.className = className;
    ctx = canvas.getContext("2d");
    containerElement.appendChild(canvas);
}

var InitMainLoop = function() {
    var oldTime = Date.now();
    (function tick() {
        var newTime = Date.now();
        if (handler && handler.tick) {
            handler.tick.apply(handler, [(newTime-oldTime)/1000]);
        }
        oldTime = newTime;
        window.requestAnimationFrame(tick);
    })();
}

var InitInput = function() {
    var hasTouch = false; // Touch devices also emulate click(). Avoid duplicates.
    var clientToCanvas = function(x,y) {
        return [(x-canvas.clientLeft)*canvas.width/canvas.clientWidth,
                (y-canvas.clientTop)*canvas.height/canvas.clientHeight];
    }
    var handleMouse = function(evt) {
        if (hasTouch)
            return;
        if (handler && handler.click)
            handler.click.apply(handler, clientToCanvas(evt.clientX, evt.clientY));
    }
    var handleTouch = function(evt) {
        hasTouch = true;
        if (handler && handler.click)
            handler.click.apply(handler, clientToCanvas(evt.touches[0].pageX, evt.touches[0].pageY));
        evt.preventDefault();
    }
    window.addEventListener("click", handleMouse);
    window.addEventListener("touchstart", handleTouch);
}

// -----------------------
// Entities
// - tick(dt) where dt is seconds since last frame
// - draw(dt) to render

var Enemy = function(x, y) {
    this.dead = false;
    this.x = x;
    this.y = y;
    this.radius = 10;
    // Velocidad aleatoria
    this.v = Math.random()*40 + 40;
    this.RandomAngle();
}

Enemy.prototype.RandomAngle = function() {
    var a = Math.random()*3.1415*2;
    this.vx = Math.cos(a)*this.v;
    this.vy = Math.sin(a)*this.v;
} 

Enemy.prototype.tick = function(dt) {
    /**
     * Actualizamos la posición x e y: pos = pos + v·t
     */
    var x = this.x + dt*this.vx;
    var y = this.y + dt*this.vy;
    // Rebotamos de manera aleatoria si nos salimos por los lados
    if (   (this.vx < 0 && x < 0)
        || (this.vx > 0 && x >= canvas.width)
        || (this.vy < 0 && y < 0)
        || (this.vy > 0 && y >= canvas.height)) {
        this.RandomAngle();
    } else {
        this.x = x;
        this.y = y;
    }
}

Enemy.prototype.draw = function(dt) {
    /**
     * Pintamos el enemigo en la posición adecuada
     */
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
    ctx.fill();
}

// -----------------------
// Explosion

var Explosion = function(x, y, score) {
    this.dead = false;
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.time = 0;
    this.score = score;
}

Explosion.prototype.tick = function(dt) {
    /**
     * Actualizamos el tiempo que ha transcurrido
     */
    this.time += dt;
    var t = 1 - this.time;
    this.radius = Math.max(0, (1-t*t)*t)*100;

    /**
     * La ponemos como muerta si ha pasado un segundo
     */
    this.dead = (this.time >= 1);
}

Explosion.prototype.draw = function(dt) {
    /**
     * Dibujamos la explosión
     */
    ctx.fillStyle = "#F80";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
    ctx.fill();
}

// -----------------------
// Menu
// 
/**
 * El MainMenu guarda la puntuación más alta y se crea con ella (añadelo al constructor)
 */
var MainMenu = function(highscore) {
    handler = null;
    this.time = 0;
    var self = this;
    this.highscore = highscore;
    // Cargamos la imagen de fondo para poder pintarla.
    // La carga se hace mediante un callback 
    this.bg = new Image();
    this.bg.onload = function() { handler = self; };
    this.bg.src = "bg.jpg";
}

MainMenu.prototype.tick = function(dt) {
    this.time += dt;

    /**
     * Dibuja la imagen
     * Dibuja el título
     * Haz el blink del Tap to Start
     */

    ctx.drawImage(this.bg, 0, 0);

    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FA6";
    ctx.fillText("Chain Reaction!", canvas.width/2, 100);
    ctx.fillStyle = "#FFF";
    ctx.fillText("High:\n"+this.highscore, canvas.width/2, 250);
    if (Math.floor(this.time*2) % 2 == 0) {
        ctx.fillText("Tap to Start", canvas.width/2, 380);
    }
}

MainMenu.prototype.click = function(x, y) {
    /**
     * Empezamos el juego: crea un SampleGame
     */
    
    /**
     * El juego se crea con la puntuación más alta actualmente
     */
    new SampleGame(this.highscore);
}

// -----------------------
// Game

/**
 * El Game guarda la puntuación más alta y se crea con ella (añadelo al constructor)
 */
var SampleGame = function(highscore) {
    handler = this;
    this.time = 0;
    this.score = 0;
    this.entities = [];
    this.timeToNextEntity = 0;
    this.highscore = highscore;
}

SampleGame.prototype.tick = function(dt) {
    this.time += dt;

    this.timeToNextEntity -= dt;
    if (this.timeToNextEntity <= 0) {
        this.timeToNextEntity = 1;
        var x = Math.random()*canvas.width;
        var y = Math.random()*canvas.height;
        this.entities.push(new Enemy(x,y));
    }

    var i;
    for (i=0; i<this.entities.length; i++) {
        this.entities[i].tick(dt);
    }

    /**
     * Comprobamos las colisiones
     */
    for (var i = 0; i < this.entities.length; ++i) {
      var e1 = this.entities[i];
      // Si la entidad en cuestión no está muerta y es una Explosión...
      if (!e1.dead && e1.constructor == Explosion) {
        /**
         * Comprueba si colisiona con alguna de las demás entidades
         * (de tipo enemigo y que no estén muertas)
         */
        for (var j = 0; j < this.entities.length; ++j) {
          var e2 = this.entities[j];
          if (!e2.dead && e2.constructor == Enemy) {
            if (CheckDistance(e1.x - e2.x, e1.y - e2.y, e1.radius + e2.radius)) {
              this.score += e1.score;
              this.entities.push(new Explosion(e2.x, e2.y, e1.score + 1));
              e2.dead = true;
              break;
            }
          }
        }
      }
    }

    /**
     * Borramos las entidades muertas
     * Para sacarlas del array usamos el método splice de los arrays
     */    
    for (var i = this.entities.length-1; i >= 0; --i) {
        if (this.entities[i].dead)
            this.entities.splice(i, 1);
    }

    ctx.fillStyle = "#024";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (i=0; i<this.entities.length; i++) {
        this.entities[i].draw(dt);
    }

    /**
     * Dibujamos la puntuación en el canvas
     */
    ctx.fillStyle = "#FFF";
    ctx.font = "24px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Score: " + this.score, canvas.width, 30);

    /**
     * Dibujamos el tiempo que llevamos en el canvas
     */
    ctx.textAlign = "left";
    ctx.fillText("Time: " + Math.floor(this.time), 0, 30);

    /**
     * Comprobamos si se ha acabado el tiempo de juego. En caso afirmativo, volvemos al menú
     */
    if (this.time > 6)
      /**
       * Al volver al menú, comprueba si hemos mejorado la puntuación más alta para crear el menú
       * Con la nueva puntuación más alta (en caso de haberla superado)
       */
      new MainMenu(Math.max(this.score, this.highscore));

}

SampleGame.prototype.click = function(x, y) {
    /**
     * Sustituye este código de dibujado de la explosión
     * por crear la entidad y añadirla a la lista de entidades
     */
    this.entities.push(new Explosion(x,y,1));
}

// -----------------------
// Startup

window.addEventListener("load", function() {
    InitCanvas("gamecontainer", 320, 460, "canvas");
    InitMainLoop();
    InitInput();

    /**
     * Comenzamos con la puntuación más alta a 0
     */
    new MainMenu(0);
});