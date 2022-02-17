import Paddle from '../gameObjects/paddle.js';
import Ball from '../gameObjects/ball.js';

class Scene_play extends Phaser.Scene {
    constructor() {
        super({ key: 'Scene_play' });
    }


    create() {
        let { config } = this.sys.game;
        let { width, height } = config;

        this.ball = new Ball(this, 400, 300, 'ball');
        this.left = new Paddle(this, 100, 300, 'left');
        this.right = new Paddle(this, 600, 300, 'right');
        this.separator = this.add.image(0, 0, 'separator');
        [this.ball, this.left, this.right, this.separator].map(obj => this.positionCenter(obj, config)); // Center all objects

        let space = width * 0.1;
        this.left.x = 0 + space + this.left.width / 2;
        this.right.x = width - space - this.right.width / 2;

        this.hitSound = this.sound.add('hit');
        this.paddleHitSound = this.sound.add('paddleHit');

        this.physics.world.setBoundsCollision(false, false, true, true);

        // Add collision between ball and paddles
        [this.left, this.right].map(paddle => {
            this.physics.add.collider(this.ball, paddle, () => { this.hitPaddle(this.ball, paddle) }, null, this);
        }, this);

        // Controls
        // Left
        this.cursor = this.input.keyboard.createCursorKeys();
        let keyCodes = Phaser.Input.Keyboard.KeyCodes;
        this.cursor.numpad0 = this.input.keyboard.addKey(keyCodes.NUMPAD_ZERO);

        // Right
        this.cursor.w = this.input.keyboard.addKey(keyCodes.W);
        this.cursor.s = this.input.keyboard.addKey(keyCodes.S);
        this.cursor.space = this.input.keyboard.addKey(keyCodes.SPACE);
        this.cursor.g = this.input.keyboard.addKey(keyCodes.G);

        this.left.up = this.cursor.up;
        this.left.down = this.cursor.down;
        this.left.slow = this.cursor.numpad0;

        this.right.up = this.cursor.w;
        this.right.down = this.cursor.s;
        this.right.slow = this.cursor.g;

        // Choose random player to start
        if (Math.random() > 0.5) this.placeOnPaddle(this.ball, this.left, 'right');
        else this.placeOnPaddle(this.ball, this.right, 'left');

        this.hits = 0;
        this.botplay = true;

        this.left.color = '#00FFFF';
        this.right.color = '#FF00FF';

        // If ball collides with world bounds, create particles
        this.physics.world.on('worldbounds', (body, up, down, left, right) => {
            if (body.gameObject == this.ball) this.createParticles(body.x, body.y);
            this.playRandom(this.hitSound);
        });

    }

    playRandom(sound){
        let pitch = Phaser.Math.FloatBetween(0.9, 1.2);
        console.log(pitch);
        sound.setRate(pitch);
        sound.play();
    }

    hitPaddle(ball, paddle) {
        let randomSpeed = ball.randomSpeed();
        if (ball.y < paddle.y) ball.body.setVelocityY(-randomSpeed);
        else ball.body.setVelocityY(randomSpeed);
        ball.hit = paddle;

        this.hits++;
        this.createParticles(ball.x, ball.y, paddle.color);
        this.playRandom(this.paddleHitSound);

        // Get faster each 10 hits
        if (this.hits % 10 == 0) {
            this.ball.speed += 50;
            [this.left, this.right].map(paddle => {
                paddle.speed += 50
                if (paddle.speed > 460) paddle.speed = 460;
            });
        }

        if (this.hits === 100) this.cameras.main.setBackgroundColor('#A30000');
    }

    createParticles(x, y, color = '#FFFFFF') {
        // Make particles appear once 
        this.particles = this.add.particles('ball');

        let colorInt = parseInt(color.replace('#', '0x'), 16);

        this.emitter = this.particles.createEmitter({
            speed: 50,
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            x: x,
            y: y,
            lifespan: 1000,
            tint: colorInt,
            maxParticles: 10,
        });


    }

    update() {
        let { config } = this.sys.game;
        let { width, height } = config;

        if (this.ball.x < 0) this.placeOnPaddle(this.ball, this.left, 'right');
        if (this.ball.x > width) this.placeOnPaddle(this.ball, this.right, 'left');

        // Players movement
        [this.left, this.right].map(paddle => {
            let speed = paddle.speed;
            if (paddle.slow.isDown) speed = speed * 0.5;
            if (paddle.up.isDown) paddle.body.setVelocityY(-speed);
            else if (paddle.down.isDown) paddle.body.setVelocityY(speed);
            else paddle.body.setVelocityY(0);
        });

        if (this.ball.stuck) {
            this.ball.y = this.ball.target.y;
            this.ball.body.setVelocityY(this.ball.target.body.velocity.y);
            if (this.cursor.space.isDown) {
                this.ball.stuck = false;
                if (this.ball.target == this.left) this.ball.body.setVelocityX(this.ball.getSpeed());
                else this.ball.body.setVelocityX(this.ball.getSpeed() * -1);
                let randomSpeed = this.ball.randomSpeed();
                if (this.ball.y < height / 2) this.ball.body.setVelocityY(randomSpeed);
                else this.ball.body.setVelocityY(-randomSpeed);
                this.ball.hit = this.ball.target;
            }
        }

        // Bot play. Maybe needs to know which direction the ball is going. B to deactivate

        this.input.keyboard.on('keydown-B', () => {
            this.botplay = !this.botplay;
        });

        if (!this.ball.stuck && this.botplay) {
            if (this.ball.x > width / 2 && this.ball.hit == this.left) {
                let half = this.right.height / 2;
                let { y } = this.right;
                let offset = 12;

                if (this.ball.y < y - half + offset || this.ball.y > y + half - offset) {
                    if (this.ball.y > this.right.y) this.right.body.setVelocityY(this.right.speed);
                    else if (this.ball.y < this.right.y) this.right.body.setVelocityY(this.right.speed * -1);
                }
            }
        }
    }

    placeOnPaddle(ball, paddle, side) {
        ball.body.setVelocity(0, 0);
        ball.stuck = true;
        ball.target = paddle;
        ball.y = paddle.y - ball.height / 2;
        let x = paddle.width + ball.width + 5;
        if (side == 'left') x = -x;
        ball.x = paddle.x + x;
    }

    positionCenter(gameObject, config) {
        gameObject.x = config.width / 2;
        gameObject.y = config.height / 2;
    }
}

export default Scene_play;