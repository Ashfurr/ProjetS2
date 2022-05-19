import Phaser from 'phaser';
import { sharedInstance as events } from "~/scenes/EventCenter";
import ObstaclesController from "~/scenes/ObstaclesController";
export default class Save {

    private scene: Phaser.Scene
    private obstacles!: ObstaclesController


    constructor(scene: Phaser.Scene, rect: Phaser.Physics.Matter.Sprite) {
        this.scene = scene
        const {x = 0, y = 0, width = 0, height = 0} = rect

        const fxSave = this.scene.add.particles('fx_blue')
        const emmiterSave = fxSave.createEmitter(
            {
                x: {min: x - width / 2, max: x + width / 2},
                y: y + height / 2,
                speed: {min: 200, max: 600},
                angle: [-85, -95, 85, 95],
                scale: {min: 0.2, max: 0.6},
                lifespan: {min: 1000, max: 5000},
                blendMode: 'ADD',
                frequency: 50,
                bounds: {x: x - width / 2, y: y - height / 2, w: width, h: height},
                alpha: {min: 1, max: 0.8},
                tint: [0x0178EE, 0xB801EE, 0xDD9D00],
                bounce: 0.5,
            })
        events.on('save-taken', this.handleFx)
    }
    handleFx(){}
}


        
        
}