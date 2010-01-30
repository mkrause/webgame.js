/*
 * WebGame.js v0.2
 * Basic 2D game framework using HTML5 <canvas>
 * 
 * Copyright (c) 2010 Maikel Krause
 * Released under the MIT license.
 * 
 * Date: Januari 2010
 */

(function() {
var WebGame = window.WebGame = function(canvas)
{
    if (typeof(canvas) === 'string') {
        canvas = document.getElementById(canvas);
    }
    
    if (!canvas || !canvas.getContext) {
        throw 'WebGame: could not obtain a rendering context';
    }
    
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    
    if (!this.ctx) {
        throw 'WebGame: canvas 2D rendering context not supported';
    }
    
    //FIXME: don't always want to catch events like mousemove, 
    // perhaps only when a mousemove handler is defined?
    this.catchKeyEvents();
    this.catchMouseEvents();
    this.catchMouseMove();
};

WebGame.prototype =
{
    version: '0.2',
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    loopHandle: null,
    controller: null,
    frameDelay: 20,     // Target delay (ms) between frames
    updateDelay: 10,    // Target delay (ms) between updates
    lastDelay: 0,       // Measured delay of the last frame
    frames: 0,
    updates: 0,
    frameTime: 0,       // Time stamp as of start of the current frame
    accumulator: 0,     // Accumulates the time (ms) left to perform updates
    
    //-------------------------------------------------------
    // Game loop
    //-------------------------------------------------------
    
    setController: function(controller)
    {
        this.controller = controller;
        
        if (this.controller && typeof(this.controller.wakeUp) === 'function') {
            this.controller.wakeUp();
        }
    },
    
    getController: function()
    {
        return this.controller;
    },
    
    setFrameRate: function(fps)
    {
        if (fps <= 0) return;
        this.frameDelay = 1000 / fps;
        if (this.isRunning()) {
            // Reset the interval
            this.stop();
            this.run();
        }
    },
    
    setUpdateRate: function(updateRate)
    {
        this.updateDelay = 1000 / updateRate;
    },
    
    isRunning: function()
    {
        return !!this.loopHandle;
    },
    
    run: function()
    {
        var that = this;
        if (this.isRunning()) {
            return;
        }
        this.frameTime = (new Date).getTime();
        this.loopHandle = window.setInterval(function() { that.frame() }, this.frameDelay);
        // Besides the interval, we also want a frame right away (but async, so use a time-out)
        window.setTimeout(function() { that.frame() }, 0);
    },
    
    stop: function()
    {
        window.clearInterval(this.loopHandle);
        this.loopHandle = null;
    },
    
    frame: function()
    {
        // Get the time since the last frame in ms
        var now = (new Date).getTime();
        var delay = now - this.frameTime;
        this.frameTime = now;
        // Save delay (for instance, to calculate the frame rate)
        this.lastDelay = delay;
        
        var alpha = false;
        
        if (this.controller && typeof(this.controller.update) === 'function') {
            // If we have an abnormally long delay, clamp to prevent overprocessing.
            // This means that, during a long delay (low FPS), the game slows down.
            delay = Math.min(delay, 2 * this.frameDelay);
            
            var dt = this.updateDelay;
            
            // Accumulate another 'delay' ms worth of updates to perform
            this.accumulator += delay;
            
            // Perform as many updates as can fit in the accumulated time
            while (this.accumulator >= dt) {
                this.controller.update(dt);
                this.accumulator -= dt;
                this.updates++;
            }
            
            // Interpolation alpha (e.g. when we're halfway between updates, alpha is 0.5)
            // This allows for predictive drawing to smooth out animations
            alpha = this.accumulator / dt;
        }
        
        if (this.controller && typeof(this.controller.draw) === 'function') {
            this.ctx.save();
            this.controller.draw(this.ctx, alpha);
            this.ctx.restore();
        }
        
        this.frames++;
    },
    
    //-------------------------------------------------------
    // I/O, events
    //-------------------------------------------------------
    
    // NOTE: intentionally ignoring event handling in IE for now
    
    keys: {
        0: 48, 1: 49, 2: 50, 3: 51, 4: 52, 5: 53, 6: 54, 7: 55, 8: 56, 9: 57,
        a: 65, b: 66, c: 67, d: 68, e: 69, f: 70, g: 71, h: 72, i: 73, j: 74, k: 75, 
        l: 76, m: 77, n: 78, o: 79, p: 80, q: 81, r: 82, s: 83, t: 84, u: 85, v: 86, 
        w: 87, x: 88, y: 89, z: 90, up: 38, left: 37, down: 40, right: 39, enter: 13, 
        shift: 16, ctrl: 17, alt: 18, escape: 27, space: 32
    },
    
    catchingKeyEvents: false,
    catchingMouseEvents: false,
    catchingMouseMove: false,
    
    keyStates: {},
    mouseState: false,
    
    catchKeyEvents: function()
    {
        var that = this;
        if (!this.catchingKeyEvents) {
            this.canvas.addEventListener('keydown', function(evt) { that.handleKeyEvent(evt, true); }, false);
            this.canvas.addEventListener('keyup', function(evt) { that.handleKeyEvent(evt, false); }, false);
        }
        this.catchingKeyEvents = true;
    },
    
    catchMouseEvents: function()
    {
        var that = this;
        if (!this.catchingMouseEvents) {
            this.canvas.addEventListener('mousedown', function(evt) { that.handleMouseEvent(evt, true); }, false);
            this.canvas.addEventListener('mouseup', function(evt) { that.handleMouseEvent(evt, false); }, false);
        }
        this.catchingMouseEvents = true;
    },
    
    catchMouseMove: function()
    {
        var that = this;
        if (!this.catchingMouseMove) {
            this.canvas.addEventListener('mousemove', function(evt) { that.handleMouseMove(evt, false); }, false);
        }
        this.catchingMouseMove = true;
    },
    
    handleKeyEvent: function(evt, pressed)
    {
        // Prevent arrow keys scrolling the page
        if (evt.keyCode == this.keys.up || evt.keyCode == this.keys.down ||
            evt.keyCode == this.keys.left || evt.keyCode == this.keys.right) {
            evt.preventDefault();
        }
        
        if (pressed) {
            this.keyStates[evt.keyCode] = true;
        } else {
            delete this.keyStates[evt.keyCode];
        }
        
        if (this.controller && typeof(this.controller.keyEvent) === 'function') {
            this.controller.keyEvent(evt.keyCode, pressed);
        }
    },
    
    // TODO: track which mouse button was pressed
    handleMouseEvent: function(evt, pressed)
    {
        this.mouseState = !!pressed;
        if (this.controller && typeof(this.controller.mouseEvent) === 'function') {
            this.controller.mouseEvent(pressed);
        }
    },
    
    // http://www.quirksmode.org/js/events_properties.html
    handleMouseMove: function(evt)
    {
        var mouseX = 0;
        var mouseY = 0;
        
        if (evt.pageX || evt.pageY) {
            mouseX = evt.pageX;
            mouseY = evt.pageY;
        }
        else if (evt.clientX || evt.clientY) {
            mouseX = evt.clientX + document.body.scrollLeft
                + document.documentElement.scrollLeft;
            mouseY = evt.clientY + document.body.scrollTop
                + document.documentElement.scrollTop;
        }
        
        // Find position of this.canvas
        // http://www.quirksmode.org/js/findpos.html
        var elmt = this.canvas;
        var curleft = 0;
        var curtop = 0;
        
        if (elmt.offsetParent) {
            do {
                curleft += elmt.offsetLeft;
                curtop += elmt.offsetTop;
            } while (elmt = elmt.offsetParent);
        }
        
        // Mouse coordinates relative to this.canvas
        var relX = mouseX - curleft;
        var relY = mouseY - curtop;
        
        if (this.controller && typeof(this.controller.mouseMoveEvent) === 'function') {
            this.controller.mouseMoveEvent(relX, relY);
        }
    },
    
    keyPressed: function(key)
    {
        return !!this.keyStates[this.keys[key]];
    },
    
    mouseDown: function()
    {
        return this.mouseState;
    },
    
    //-------------------------------------------------------
    // Resources/preloading
    //-------------------------------------------------------
    
    imageCache: {},
    audioCache: {},
    
    loadingImage: function()
    {
        for (var i in this.imageCache) {
            if (!this.imageCache[i].complete) {
                return true;
            }
        }
        
        return false;
    },
    
    loadImage: function(filePath)
    {
        var cachedFiles = this.imageCache;
        
        // Did we already load this file?
        if (cachedFiles[filePath]) {
            return cachedFiles[filePath];
        }
        
        var file = new Image();
        
        //file.onload = function() { trace("Resource loaded: " + filePath); };
        //file.onerror = function() { trace("No dice: " + filePath); };
        file.src = filePath;
        
        cachedFiles[filePath] = file;
        return file;
    },
    
    loadAudio: function(filePath, loadFunc)
    {
        //TODO
    }
};
})();
