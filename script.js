// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    size: ballSize,
    speed: 5
};

let playerScore = 0;
let computerScore = 0;

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height / 2;
});

// Update player position with arrow keys
function updatePlayerPosition() {
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y += player.speed;
    }

    // Keep player paddle in bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// AI for computer paddle
function updateComputerPosition() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const difference = ballCenter - computerCenter;

    if (Math.abs(difference) > 35) {
        if (difference > 0) {
            computer.y += computer.speed;
        } else {
            computer.y -= computer.speed;
        }
    }

    // Keep computer paddle in bounds
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Ball physics
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        // Keep ball in bounds
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Paddle collision
    checkPaddleCollision(player);
    checkPaddleCollision(computer);

    // Score points
    if (ball.x - ball.size < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    } else if (ball.x + ball.size > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

// Paddle collision detection
function checkPaddleCollision(paddle) {
    if (
        ball.x - ball.size < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y - ball.size < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y
    ) {
        // Ball hit the paddle
        if (ball.dx > 0) {
            // Ball coming from left
            ball.dx = -ball.dx;
            ball.x = paddle.x - ball.size;
        } else {
            // Ball coming from right
            ball.dx = -ball.dx;
            ball.x = paddle.x + paddle.width + ball.size;
        }

        // Add spin based on where the ball hit the paddle
        const paddleCenter = paddle.y + paddle.height / 2;
        const collisionPoint = ball.y - paddleCenter;
        const normalizedCollisionPoint = collisionPoint / (paddle.height / 2);

        ball.dy += normalizedCollisionPoint * 3;
        ball.speed = Math.min(Math.abs(ball.dx) + 0.5, 8);
        ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 4;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
    ctx.shadowBlur = 10;
}

function drawBall() {
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
    ctx.shadowBlur = 15;
}

function drawCenter() {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = 'transparent';

    // Draw game elements
    drawCenter();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Game loop
function gameLoop() {
    updatePlayerPosition();
    updateComputerPosition();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();