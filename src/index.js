import Bootloader from './bootloader.js';
import Scene_play from './scenes/scene_play.js';

const config = {
    width: 800,
    height: 400,
    backgroundColor: 0x000000,
    parent: 'container',
    scene: [
        Bootloader, 
        Scene_play
    ],
    physics: {
        default: 'arcade',
    }
}

var game = new Phaser.Game(config);
