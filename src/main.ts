import Phaser from 'phaser'
import Game from './scenes/Game'
import UI from './scenes/UI'
import GameOver from "./scenes/GameOver";
import Start from './scenes/Start';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	antialias:true,
	powerPreference: "high-performance",
	scale: {
		width: 1920,
		height: 1080,
        mode: Phaser.Scale.FIT,
        min: {
            width: 720,
            height: 680
        },
        max: {
            width: 1920,
            height: 1080,
        }
	},
	fps:{
		min:100,
		target:140,
		forceSetTimeOut:true,
	},
	physics: {
		default: 'matter',
		matter: {
			//gravity:{y:0.9},
			debug: false
		}
	}, 
	scene: [Start,Game,UI,GameOver]
}

export default new Phaser.Game(config)
