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

        this.physics.world.setBoundsCollision(false, false, true, true);

        // Add collision between ball and paddles
        [this.left, this.right].map(paddle => {
            this.physics.add.collider(this.ball, paddle, () => { this.hitPaddle(this.ball, paddle) }, null, this);
        }, this);

        // Controls
        // Left
        this.cursor = this.input.keyboard.createCursorKeys();

        // Right
        let keyCodes = Phaser.Input.Keyboard.KeyCodes;
        this.cursor.w = this.input.keyboard.addKey(keyCodes.W);
        this.cursor.s = this.input.keyboard.addKey(keyCodes.S);
        this.cursor.space = this.input.keyboard.addKey(keyCodes.SPACE);

        this.left.up = this.cursor.up;
        this.left.down = this.cursor.down;

        this.right.up = this.cursor.w;
        this.right.down = this.cursor.s;

        // Choose random player to start
        if (Math.random() > 0.5) this.placeOnPaddle(this.ball, this.left, 'right');
        else this.placeOnPaddle(this.ball, this.right, 'left');

        this.hits = 0;
    }

    hitPaddle(ball, paddle) {
        let randomSpeed = ball.randomSpeed();
        if (ball.y < paddle.y) ball.body.setVelocityY(-randomSpeed);
        else ball.body.setVelocityY(randomSpeed);
        this.hits++;

        // Get faster each 10 hits
        if (this.hits % 10 == 0){
            this.ball.speed += 50;
            [this.left, this.right].map(paddle =>{
                paddle.speed += 50
                if(paddle.speed > 450) paddle.speed = 450;
            });
        }

        if (this.hits === 100) this.cameras.main.setBackgroundColor('#A30000');
    }

    update() {
        let { config } = this.sys.game;
        let { width, height } = config;

        if (this.ball.x < 0) this.placeOnPaddle(this.ball, this.left, 'right');
        if (this.ball.x > width) this.placeOnPaddle(this.ball, this.right, 'left');

        // Players movement
        [this.left, this.right].map(paddle => {
            if (paddle.up.isDown) paddle.body.setVelocityY(-paddle.speed);
            else if (paddle.down.isDown) paddle.body.setVelocityY(paddle.speed);
            else paddle.body.setVelocityY(0);
        });

        if (this.ball.stuck) {
            this.ball.y = this.ball.target.y;
            this.ball.body.setVelocityY(this.ball.target.body.velocity.y);
            if (this.cursor.space.isDown) {
                this.ball.stuck = false;
                if (this.ball.target == this.left) this.ball.body.setVelocityX(this.ball.speed);
                else this.ball.body.setVelocityX(this.ball.speed * -1);
                let randomSpeed = this.ball.randomSpeed();
                if (this.ball.y < height / 2) this.ball.body.setVelocityY(randomSpeed);
                else this.ball.body.setVelocityY(-randomSpeed);
            }
        }
        
    }

    placeOnPaddle(ball, paddle, side) {
        ball.body.setVelocity(0, 0);
        ball.stuck = true;
        ball.target = paddle;
        ball.y = paddle.y - ball.height / 2;
        let x = paddle.width + ball.width;
        if (side == 'left') x = -x;
        ball.x = paddle.x + x;
    }

    positionCenter(gameObject, config) {
        gameObject.x = config.width / 2;
        gameObject.y = config.height / 2;
    }
}

export default Scene_play;