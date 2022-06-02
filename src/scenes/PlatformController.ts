import Phaser, { Tweens } from "phaser";

export default class PlatformController{

private scene:Phaser.Scene
private sprite:Phaser.Physics.Matter.Sprite

    constructor(scene:Phaser.Scene,sprite:Phaser.Physics.Matter.Sprite,destination:number,type:String,velocity:number){
            this.scene=scene
            this.sprite=sprite

            if(type==='platform-A'){
                this.platformX(sprite,destination,velocity)
            }
            if(type==='platform-B'){
                this.platformY(sprite,destination,velocity)
            }

            
    }
    platformX(sprite:Phaser.Physics.Matter.Sprite,destination:number,velocity){
        let move=false
            const {x,y}=sprite
            let active=true
            const tweens=this.scene.tweens.addCounter({
                from:0,
                to:1,
                yoyo:true,
                duration:500,
                onUpdate:tween => {
                    if(active) {
                        this.sprite.setVelocityX(velocity)
                        if(this.sprite.x>=destination)
                        {
                            active=false
                        }
                    }
                    else if(!active){
                        this.sprite.setVelocityX(-velocity)
                    }
                    if(this.sprite.x<x)
                    {
                        active=true
                    }
                    if(sprite.y>y){
                        sprite.setVelocityY(-1)
                    }
                    if(sprite.y<y){
                        sprite.setVelocityY(1)
                    }
                    
                },
                loop:-1
                
            })
    }
    platformY(sprite:Phaser.Physics.Matter.Sprite,destination:number,velocity){
        let move=false
            const {x,y}=sprite
            let active=true
            const tweens=this.scene.tweens.addCounter({
                from:0,
                to:100,
                yoyo:true,
                duration:1000,
                onUpdate:tween => {
                    if(active) {
                        this.sprite.setVelocityY(-velocity)
                        if(this.sprite.y<=destination)
                        {
                            active=false
                        }
                    }
                    else if(!active){
                        this.sprite.setVelocityY(velocity)
                    }
                    if(this.sprite.y>y)
                    {
                        active=true
                    }
                    if(sprite.x>x){
                        sprite.setVelocityX(-1)
                    }
                    if(sprite.x<x){
                        sprite.setVelocityX(1)
                    }
                    
                },
                loop:-1
                
            })
    }
}