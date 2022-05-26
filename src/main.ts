import Phaser from 'phaser'
import Game from './scenes/Game'
import UI from './scenes/UI'
import GameOver from "./scenes/GameOver";
import Start from './scenes/Start';
import RaycasterPlugin from 'phaser3-rex-plugins/plugins/raycaster-plugin.js'

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
            width: 720,
            height: 680
        },
        max: {
            width: 1280,
            height: 720,
        }
	},
	/*fps:{
		min:120,
		target:140,
		forceSetTimeOut:true,
	},*/
	physics: {
		default: 'matter',
		matter: {
			gravity:{
				y:0.9
			},
			debug: {
				showVelocity: true,
				showBody: true,
                showStaticBody: true,
                showInternalEdges: true,
				showSensors: true,
                sensorFillColor: 0x0d177b,
                sensorLineColor: 0x1327e4,
			}
		}
	},
	plugins: {
        global: [{
            key: 'rexRaycaster',
            plugin: RaycasterPlugin,
            start: true
        },
        ]},
	scene: [Game,UI,GameOver]
}

export default new Phaser.Game(config)
