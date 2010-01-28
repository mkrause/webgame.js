/*
 * pong.js v0.1
 * Pong demo using WebGame.js
 * Date: Januari 2010
 */

function pong()
{
    function TitleController()
    {
        var titleImage;
        
        this.init = function()
        {
            webgame.setFrameRate(1);
            titleImage = webgame.loadImage('images/pong.jpg');
        }
        
        this.keyEvent = function(key, pressed)
        {
            if (key == webgame.keys.enter) {
                webgame.setController(playController);
            }
        };
        
        this.draw = function(ctx)
        {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, webgame.width, webgame.height);
            
            ctx.drawImage(titleImage, webgame.width / 2 - titleImage.width / 2, 50);
            
            ctx.font = "16px 'Lucida Granda', Verdana, sans-serif";
            ctx.fillStyle = 'white';
            var text = "Press enter to play";
            ctx.fillText(text, webgame.width / 2 - ctx.measureText(text).width / 2, 220);
        }
    }
    
    function PlayController()
    {
        var paddle1; // Player
        var paddle2; // AI
        var ball;
        
        this.init = function()
        {
            webgame.setFrameRate(50);
            webgame.setUpdateRate(100);
            
            paddle1 = {
                score: 0,
                width: 5,
                height: 60,
                x: 20,
                y: webgame.height / 2 - (60 / 2),
                speed: 0.5 // pixels/ms
            };
            
            paddle2 = {
                score: 0,
                width: 5,
                height: 60,
                x: webgame.width - 20 - 5,
                y: webgame.height / 2 - (60 / 2),
                speed: 0.3 // pixels/ms
            };

            ball = {
                x: webgame.width / 2,
                y: webgame.height / 2,
                radius: 5,
                speed: 0.5, // pixels/ms
                v: [1,0] // Velocity vector (x,y)
            };
        };
        
        this.keyEvent = function(key, pressed)
        {
            if (pressed) {
                switch (key) {
                case webgame.keys.q:
                    webgame.setController(titleController);
                    break;
                }
            }
        };
        
        this.draw = function(ctx)
        {
            // Draw field
            //ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, webgame.width, webgame.height);
            
            ctx.beginPath();
            for (var lineY = 5; lineY < webgame.height; lineY += 20) {
                ctx.moveTo(webgame.width / 2, lineY);
                ctx.lineTo(webgame.width / 2, lineY + 10);
            }
            ctx.closePath();
            ctx.lineWidth = '1';
            ctx.strokeStyle = 'white';
            ctx.stroke();
            
            // Paddles
            ctx.fillStyle = 'white';
            ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
            ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
            
            // Ball
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
        };
        
        this.update = function(dt)
        {
            if (webgame.updates % 20 == 0) {
                traceVar('FPS', Math.round(1000 / webgame.lastDelay));
            }
            traceVar('score1', paddle1.score);
            traceVar('score2', paddle2.score);
            
            // Update player
            var paddle1_dy = paddle1.speed * dt;
            if (webgame.keyPressed('up') && paddle1.y > 0) {
                paddle1.y -= paddle1_dy;
            }
            else if (webgame.keyPressed('down') && paddle1.y + paddle1.height < webgame.height) {
                paddle1.y += paddle1_dy;
            }
            
            // Update AI
            var paddle2_dy = paddle2.speed * dt;
            if (ball.v[0] > 0) {
                if (ball.y < paddle2.y) {
                    paddle2.y -= paddle2_dy;
                } else if (ball.y > (paddle2.y + paddle2.height)) {
                    paddle2.y += paddle2_dy;
                }
            }
            
            // Update ball
            ball.x += ball.v[0] * (ball.speed * dt);
            ball.y += ball.v[1] * (ball.speed * dt);
            
            var collision1 = ball.x < (paddle1.x + paddle1.width)
                && ball.y > paddle1.y
                && ball.y < (paddle1.y + paddle1.height);
            
            var collision2 = ball.x > paddle2.x
                && ball.y > paddle2.y
                && ball.y < (paddle2.y + paddle2.height);
            
            if (collision1) {
                ball.v[0] = -ball.v[0];
                ball.v[1] += 0.5 * (Math.random() - 0.5);
                ball.x = paddle1.x + paddle1.width;
            }
            if (collision2) {
                ball.v[0] = -ball.v[0];
                ball.x = paddle2.x;
            }
            if (ball.y < 0 || ball.y > webgame.height) {
                ball.v[1] = -ball.v[1];
            }
            
            // New velocities when regenerating ball
            var newX = 0.5 + 0.5 * Math.random();
            newX = Math.random() > 0.5 ? newX : -newX;
            var newY = -1 + 2 * Math.random();
            
            if (ball.x < 0) {
                ball.x = webgame.width / 2;
                ball.y = webgame.height / 2;
                ball.v = [newX, newY];
                paddle2.score++;
            }
            if (ball.x > webgame.width) {
                ball.x = webgame.width / 2;
                ball.y = webgame.height / 2;
                ball.v = [newX, newY];
                paddle1.score++;
            }
        };
    }
    
    //-------------------------------------------------------
    // Init
    //-------------------------------------------------------
    
    var webgame;
    var canvas = document.getElementById('game-canvas');
    canvas.width = 600;
    canvas.height = 400;
    canvas.focus();
    
    try {
        webgame = new WebGame(canvas);
    }
    catch (e) {
        // Handle exceptions like Canvas 2D not being supported
        trace(e);
        return;
    }
    
    var titleController = new TitleController();
    var playController = new PlayController();
    webgame.setController(titleController);
    webgame.run();
}

window.addEventListener('load', pong, false);
