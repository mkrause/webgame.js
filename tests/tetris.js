/*
 * tetris.js v0.1
 * Tetris demo using WebGame.js
 * Date: Januari 2010
 */

function tetris()
{
    var Tetromino = function(x, y, shapeIndex) {
        this.x = x;
        this.y = y;
        this.shapeIndex = shapeIndex;
    };
    
    // Describes the shape of each tetromino by giving the locations of the blocks in a grid.
    // The format is: [block1, block2, block3, block4, gridWidth, gridHeight, colors]
    Tetromino.shapeRef = [
        [], // Empty shape
        [[0,1], [1,1], [2,1], [3,1], 4, 3, ['#2fa2ac', '#29deee']], // I
        [[0,1], [1,1], [2,1], [0,2], 3, 3, ['#2e589d', '#376bc0']], // J
        [[0,1], [1,1], [2,1], [2,2], 3, 3, ['#c5841d', '#e09010']], // L
        [[0,0], [1,0], [1,1], [0,1], 2, 2, ['#e0cf14', '#f6e30c']], // O
        [[0,2], [1,2], [1,1], [2,1], 3, 4, ['#36c423', '#3ae423']], // S
        [[0,1], [1,1], [2,1], [1,2], 3, 3, ['#a01ecb', '#b60eed']], // T
        [[0,1], [1,1], [1,2], [2,2], 3, 4, ['#ce2222', '#ed0e0e']], // Z
    ];
    
    Tetromino.random = function(x, y)
    {
        var shapeIndex = 1 + Math.floor(Math.random() * (Tetromino.shapeRef.length - 1));
        return new Tetromino(x, y, shapeIndex);
    };
    
    Tetromino.drawBlock = function(i, j, index)
    {
        var ctx = webgame.ctx;
        var w = blockWidth;
        var h = blockHeight;
        
        if (index < 1) {
            return;
        }
        
        var color1 = Tetromino.shapeRef[index][6][0]; // Primary color
        var color2 = Tetromino.shapeRef[index][6][0]; // Secondary color
        
        var glass = ctx.createLinearGradient(i*w, j*h, i*w, j*h + h);
        glass.addColorStop(0, 'rgba(255,255,255,0.8)');
        glass.addColorStop(0.5, 'rgba(255,255,255,0.3)');
        glass.addColorStop(0.5, color2);
        
        ctx.fillStyle = color1;
        ctx.fillRect(i * w, j * h, w, h);
        
        ctx.fillStyle = color2;
        ctx.fillRect(i * w + 1, j * h + 1, w - 2, h - 2);
        
        ctx.fillStyle = glass;
        ctx.fillRect(i * w + 1, j * h + 1, w - 2, h - 2);
    };
    
    Tetromino.prototype =
    {
        x: 0,
        y: 0,
        shapeIndex: 0,
        
        fall: function()
        {
            this.y++;
        },
        
        collision: function()
        {
            return this.y + 1 >= mapHeight || map[this.y + 1][this.x] > 0;
        },
        
        freeze: function()
        {
            map[this.y][this.x] = this.shapeIndex;
        },
        
        draw: function(ctx)
        {
            Tetromino.drawBlock(this.x, this.y, this.shapeIndex);
        }
    };
    
    function TitleController()
    {
        this.init = function()
        {
        };
        
        this.wakeUp = function()
        {
            webgame.setFrameRate(1);
        };
        
        this.keyEvent = function(key, pressed)
        {
            if (key == webgame.keys.enter) {
                // We're (re)starting the game, so make a new PlayController
                playController = new PlayController();
                webgame.setController(playController);
            }
        };
        
        this.draw = function(ctx)
        {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, webgame.width, webgame.height);
            
            ctx.font = "16px 'Lucida Granda', Verdana, sans-serif";
            ctx.fillStyle = 'white';
            var text = "Press enter to play";
            ctx.fillText(text, webgame.width / 2 - ctx.measureText(text).width / 2, 220);
            
            ctx.font = "100px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
            ctx.fillStyle = 'white';
            var text = "TETRIS";
            ctx.fillText(text, webgame.width / 2 - ctx.measureText(text).width / 2, 150);
        }
        
        this.init();
    }
    
    function PlayController()
    {
        var paused;
        var score;
        var gameOver;
        var difficulty;
        
        this.init = function()
        {
            paused = false;
            score = 0;
            gameOver = false;
            difficulty = 3;
            
            // Positions/lengths are defined in block units
            map = [];
            mapWidth = 10;
            mapHeight = 20;
            blockWidth = 25;
            blockHeight = 25;
            
            // Initiate an empty map
            for (var i = 0; i < mapHeight; i++) {
                map[i] = [];
                for (var j = 0; j < mapWidth; j++) {
                    map[i][j] = 0;
                }
            }
            
            //map[6][5] = 1;
            
            tetromino = Tetromino.random(5, 1);
            nextTetromino = Tetromino.random(8, 1);
        };
        
        this.wakeUp = function()
        {
            webgame.setFrameRate(20);
            webgame.setUpdateRate(20);
        };
        
        this.clearLines = function()
        {
            
        };
        
        this.keyEvent = function(key, pressed)
        {
            if (pressed) {
                switch (key) {
                case webgame.keys.q:
                    webgame.setController(titleController);
                    break;
                case webgame.keys.p:
                    if (paused) {
                        paused = false;
                        webgame.run();
                    } else {
                        paused = true;
                        webgame.stop();
                        var ctx = webgame.ctx;
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                        ctx.fillRect(0, 0, webgame.width, webgame.height);
                    }
                    break;
                }
            }
        };
        
        this.draw = function(ctx)
        {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, webgame.width, webgame.height);
            
            // Draw map
            for (var v = 0; v < mapHeight; v++) {
                for (var h = 0; h < mapWidth; h++) {
                    Tetromino.drawBlock(h, v, map[v][h]);
                }
            }
            
            tetromino.draw(ctx);
            nextTetromino.draw(ctx);
        };
        
        this.update = function(dt)
        {
            if (webgame.updates % 2 == 0) {
                tetromino.fall();
            }
            
            if (tetromino.collision()) {
                tetromino.freeze();
                this.clearLines();
                tetromino = nextTetromino;
                tetromino.x = 5;
                tetromino.y = 1;
                nextTetromino = Tetromino.random(8, 1);
                if (map[1][5] > 0) {
                    webgame.stop(); // Game over
                }
            }
        };
        
        this.init();
    }
    
    //-------------------------------------------------------
    // Init
    //-------------------------------------------------------
    
    var webgame;
    var canvas = document.getElementById('game-canvas');
    canvas.width = 400;
    canvas.height = 600;
    canvas.focus();
    
    try {
        webgame = new WebGame(canvas);
    } catch (e) {
        // Handle exceptions like Canvas 2D not being supported
        trace(e);
        return;
    }
    
    var map;
    var mapWidth;
    var mapHeight;
    var blockWidth;
    var blockHeight;
    
    var tetromino;
    var nextTetromino;
    
    var titleController;
    var playController;
    
    // Show the title screen
    titleController = new TitleController();
    webgame.setController(titleController);
    webgame.run();
}

window.addEventListener('load', tetris, false);
