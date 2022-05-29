import Phaser from 'phaser'
import Button = Phaser.Input.Gamepad.Button;
import { GUI } from 'dat.gui';

export default class Start extends Phaser.Scene
{
    constructor() {
        super('Start');
    }
    preload(){
        this.load.image("bg2", 'assets/images/ash_logo.png')
        this.load.image("cursor", 'assets/images/cursor.png')
    }
    create()
    {
        
        const gui = new GUI();

        var p1 = gui.addFolder('Pointer');
        p1.add(this.input, 'x').listen();
        p1.add(this.input, 'y').listen();
        
        const {width, height}= this.scale
        const bg=this.add.image(0,0,'bg2').setOrigin(0,0).setDisplaySize(width,height).setPipeline('Light2D');
        const button = this.add.rectangle(width*0.5005,height*0.6905,400,209,0x000000,0).setStrokeStyle(6,0x000000)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,()=> 
            {
                this.tweencolor(bg)
            })
        const light = this.lights.addLight(228, 78, 150).setScrollFactor(0.0).setIntensity(3);
        const light2 = this.lights.addLight(1480,936,150).setScrollFactor(0.0).setIntensity(3);
        
        this.lights.enable().setAmbientColor(0xffffff);
       

        this.input.mouse.disableContextMenu();
            
        this.tweenlight(light) 
        this.tweenlight2(light2) 
        const scale=this.tweens.add({
            targets:[light,light2],
            radius:5000,
            duration:500,
            yoyo:true,
            loop:-1
        })
        const cursor=this.add.image(0,0,'cursor').setScale(0.2)
        this.input.on('pointermove',  (pointer)=> {
            cursor.setPosition(pointer.worldX,pointer.worldY-10)
        });
        
          
}
tweenlight(light){
    const right= this.tweens.timeline({
        targets: light,
        tweens:[
            {
                x:1950,
            },
            {
                y:249,
                offset:'-=1000'
            },
            {
                x:1480,
                offset:1000
            },
            {
                y:936,
                offset:'-=1000'
            },
            {
                x:150,
                offset:2000
            },
            {
                y:990,
                offset:'-=1000'
            },
            {
                x:228,
                offset:3000
            },
            {
                y:78,
                offset:'-=1000'
            },

        ],
        ease: 'Power1',
        duration: 1000,
        loop:-1
    })
       
}
tweenlight2(light){
    const right= this.tweens.timeline({
        targets: light,
        tweens:[
            {
                x:150,
                offset:0
            },
            {
                y:990,
                offset:'-=1000'
            },
            {
                x:228,
                offset:1000
            },
            {
                y:78,
                offset:'-=1000'
            },
            {
                x:1950,
                offset:2000
            },
            {
                y:249,
                offset:'-=1000'
            },
            {
                x:1480,
                offset:3000
            },
            {
                y:936,
                offset:'-=1000'
            }
        ],
        ease: 'Power1',
        duration: 1000,
        loop:-1
    })
}
    tweencolor(bg)
    {
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff)
        const endColor = Phaser.Display.Color.ValueToColor(0x000000)

        this.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: 2,
            ease: Phaser.Math.Easing.Sine.InOut,
            yoyo:true,
            onUpdate: tween => {
            const value = tween.getValue()
            const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                    startColor,
                endColor,
                100,
                value
            )
                const color = Phaser.Display.Color.GetColor(
                    colorObject.r,
                    colorObject.g,
                    colorObject.b
                )
                bg.setTint(color)
            },
            onComplete: tween => {
                
                this.scene.start('game')
            }
        })
    }
}


