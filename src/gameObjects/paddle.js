class Paddle extends Phaser.GameObjects.Sprite {
    constructor(scene, x , y, type){
        super(scene, x, y, type);
        scene.add.existing(this); // Make existing in scene
        scene.physics.world.enable(this); // Enable physics
        this.body.immovable = true; // Make paddle immovable
        this.speed = 300;
        this.body.setCollideWorldBounds(true);
        let extend = 4;
        this.body.setSize(this.width, this.height + extend);
    }
}

export default Paddle;