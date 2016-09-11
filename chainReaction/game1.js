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
// Startup

window.addEventListener("load", function() {
    InitCanvas("gamecontainer", 320, 460, "canvas");
    InitMainLoop();
    InitInput();
});
