import Phaser from 'phaser'
import Button = Phaser.Input.Gamepad.Button;

export default class GameOver extends Phaser.Scene
{
    constructor() {
        super('game-over');
    }
    preload(){
        this.load.image("gameover", 'assets/images/gameover.png')
    }
    
    create()
    {
        this.add.image(0,0,'gameover').setOrigin(0,0).setScrollFactor(1,1)
    }
}
