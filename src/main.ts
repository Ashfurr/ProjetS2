import Phaser from 'phaser'

import Game from './scenes/Game'
import UI from './scenes/UI'
import GameOver from "./scenes/GameOver";
import Start from './scenes/Start';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	
	width: 1920,
	height: 1080,
	antialias:true,
	powerPreference: "high-performance",
	scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 1280,
            height: 720
        },
        max: {
            width: 1280,
            height: 720,
        }
	},
	fps:{
		min:120,
		target:140,
		forceSetTimeOut:true,
	},
	physics: {
		default: 'matter',
		matter: {
			debug: true	
		}
	},
	scene: [Game,UI,GameOver]
}

export default new Phaser.Game(config)
