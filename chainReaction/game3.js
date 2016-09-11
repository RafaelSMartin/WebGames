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
     * TODO: Creamos y actualizamos las variables x e y: (x,y) = pos + v·t
     */
    // var x...
    // var y...
    
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
     * TODO: Pintamos el enemigo en la posición adecuada
     */
}

// -----------------------
// Game

var SampleGame = function() {
    handler = this;
    this.time = 0;
    this.score = 0;
    this.entities = [];
    this.timeToNextEntity = 0;
}

SampleGame.prototype.tick = function(dt) {
    this.time += dt;

    this.timeToNextEntity -= dt;
    if (this.timeToNextEntity <= 0) {
        this.timeToNextEntity = 1;
        var x = Math.random()*canvas.width;
        var y = Math.random()*canvas.height;
        /**
         * TODO: Sustituye esto por crear un nuevo enemigo y añadirlo a la lista de entidades
         */
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2*Math.PI, false);
        ctx.fill();
    }

    /**
     * TODO: 
     * 1. Hacemos el tick de cada entidad
     * 2. Repintamos el fondo del canvas (rectángulo con el tamaño del canvas y color #024)
     * 3. Pintamos cada una de las entidades (llamando a su método draw)
     */

}

SampleGame.prototype.click = function(x, y) {
    ctx.fillStyle = "#F80";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2*Math.PI, false);
    ctx.fill();
}

// -----------------------
// Startup

window.addEventListener("load", function() {
    InitCanvas("gamecontainer", 320, 460, "canvas");
    InitMainLoop();
    InitInput();
    new SampleGame();
});