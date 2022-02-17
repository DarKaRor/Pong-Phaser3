class Ball extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, type){
        super(scene, x, y, type);
        scene.add.existing(this); // Make existing in scene
        scene.physics.world.enable(this); // Enable physics
        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;
        this.body.setBounce(1);
        this.speed = 150;
        this.maxSpeed = 460;
    }

    randomSpeed(){
        if(this.speed == 0) return;
        let random = Math.random();
        let range = this.speed * 0.8;
        let maxSpeed = this.speed + range;
        let minSpeed = this.speed - range;
        let speed = Phaser.Math.Between(minSpeed, maxSpeed)
        if(speed > this.maxSpeed) speed = this.maxSpeed;
        return speed;
    }

    getSpeed = () => this.speed > this.maxSpeed ? this.maxSpeed : this.speed;
}

export default Ball;