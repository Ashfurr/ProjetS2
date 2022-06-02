import Phaser from "phaser";
import * as MatterJS from 'matter-js';
import {sharedInstance as events} from "~/scenes/EventCenter";
export default class Projectil
{
    private scene:Phaser.Scene
    private projectil:Phaser.Physics.Matter.Sprite
    private lastSnowmen?: Phaser.Physics.Matter.Sprite
    private tween!:Phaser.Tweens.Tween
    constructor(scene:Phaser.Scene,x:number,y:number,angle:number){
        const vitesse=10
        this.scene=scene
        let canBedestroy=false
    
        this.projectil=this.scene.matter.add.sprite(x,y,'projectil',undefined,{label:'projectil',ignoreGravity:true,frictionAir:0,isSensor:true}).setDisplaySize(50,50)
        this.projectil.setBounce(1)
        this.projectil.setTintFill(0x000000)
        this.projectil.setVelocity(vitesse*Math.cos(angle),vitesse*Math.sin(angle))

        this.tween=this.scene.tweens.add({
            targets: this.projectil,
            scale:0.15,
            ease: 'Linear',
            yoyo:true,
            duration: 500,
            repeat:-1
        })
        const circlezone= new Phaser.Geom.Circle(0,0,50)
        const rectContain=this.scene.add.group()
        rectContain.add(this.projectil)
        let starsFxContainer=this.scene.add.container();
        rectContain.children.iterate((projectil)=>{
        const fxSave = this.scene.add.particles('partproj')
        const emmiterproj = fxSave.createEmitter(
            {
                tint:[0x18022F,0x0C022F,0x030662],
                speed: {min: 250, max: 300},
                //angle:{start:0,end:360,steps:64},
                scale: {start: 0.1, end: 0.4},
                lifespan: 500,
                blendMode: 'ADD',
                frequency: 1,
                quantity:1,
                rotate:{start:360,end:0},
                alpha: {start:1,end:1},
                //emitZone:{type: 'random',source:circlezone}
                

            });
            projectil.on("disabled",function(){
                emmiterproj.on=false
            })
            emmiterproj.startFollow(projectil)
            
            starsFxContainer.add(fxSave);
        });
        

        const life=this.scene.time.delayedCall(3000,()=>{
            this.tween.off
            this.projectil.emit('disabled')
            this.projectil.destroy()
            
            
        })
        const time=this.scene.time.delayedCall(40,()=>{
            canBedestroy=true
            this.projectil.setSensor(false)
        })
        this.projectil.setOnCollide((data: MatterJS.ICollisionPair) => {
            const body = data.bodyA 
            const bodyB = data.bodyB
            if(body.label==='player'){
                console.log(body.isSensor)
                this.tween.off
                this.projectil.emit('disabled')
                life.destroy()
                time.destroy()
                this.projectil.destroy()
            }
            if(body.label==='bodyEnnemy'&& canBedestroy===true){
                this.lastSnowmen= body.gameObject
                events.emit('snowmen-stomped',this.lastSnowmen)
                this.tween.off
                this.projectil.emit('disabled')
                this.projectil.destroy()
                life.destroy()
            }
        })
    }
}