import Phaser from 'phaser'

import Game from './scenes/Game'
import UI from './scenes/UI'
import GameOver from "./scenes/GameOver";
import Start from './scenes/Start';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	width: 1920,
	height: 1080,
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
	physics: {
		default: 'matter',
		matter: {
			debug: true
		}
	},
	scene: [Start,Game,UI,GameOver]
}

export default new Phaser.Game(config)
