import Phaser from 'phaser'
import Button = Phaser.Input.Gamepad.Button;
import { GUI } from 'dat.gui';

export default class Start extends Phaser.Scene
{
    constructor() {
        super('Start');
    }
    preload(){
        this.load.image("bg", 'assets/images/ash_logo.png')
    }
    create()
    {
        const gui = new GUI();

        var p1 = gui.addFolder('Pointer');
        p1.add(this.input, 'x').listen();
        p1.add(this.input, 'y').listen();
        
        const {width, height}= this.scale
        const bg=this.add.image(0,0,'bg').setOrigin(0,0).setDisplaySize(width,height).setPipeline('Light2D');
        const button = this.add.rectangle(width*0.5005,height*0.6905,400,209,0x000000,0).setStrokeStyle(6,0x000000)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP,()=> 
            {
                this.tweencolor(bg)
            })
        const light = this.lights.addLight(228, 78, 150).setScrollFactor(0.0).setIntensity(3);
        const light2 = this.lights.addLight(228, 78, 150).setScrollFactor(0.0).setIntensity(3);
        
        this.lights.enable().setAmbientColor(0xffffff);
       

        this.input.mouse.disableContextMenu();
   
        this.tweenlight(light) 
        this.time.delayedCall(3000, () => 
        {
            this.tweenlight(light2) 
        })   
}
tweenlight(light){
    const right= this.tweens.add({
        targets: light,
        x:1950,
        y:249,
        scale:0.5,
        ease: 'Linear',
        duration: 1500,
        onComplete: tween=>
        {
            const down= this.tweens.add(
            {
                targets: light,
                x:1480,
                y:936,
                ease: 'Linear',
                duration: 1500,
                    onComplete: tween=>
                {
                    const left= this.tweens.add(
                    {
                        targets: light,
                        x:150,
                        y:990,
                        scale:0.7,
                        ease: 'Linear',
                        duration: 1500,
                        onComplete: tween=>
                        {
                            const up= this.tweens.add(
                            {
                                targets: light,
                                x:228,
                                y:78,
                                scale:0.4,
                                ease: 'Linear',
                                duration: 1500,
                                onComplete: tween=>
                                {
                                    this.tweenlight(light)
                                }
                            })
                        }
                    })
                }
            })
        }
    })
    
   
}
tweencolor(bg){
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
