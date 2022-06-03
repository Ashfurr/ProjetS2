import {sharedInstance as events} from "~/scenes/EventCenter";
import Phaser, { Textures } from 'phaser'
import Game from './Game'

export default class Mechanic
{

private scene : Game
private previous!: MatterJS.BodyType
private current!: MatterJS.BodyType
private graphics!: Phaser.GameObjects.Graphics
private platform: MatterJS.BodyType[]
private platformDisplay: Phaser.GameObjects.Image[]
private constraint!: MatterJS.ConstraintType
private trace = true
private delayerase
private nbplatform=5
private lock!:boolean
private soundbloc!:Phaser.Sound.BaseSound
    constructor(scene: Game)
    {
     
        this.lock=false
        
        this.scene= scene
        this.soundbloc=this.scene.sound.add('soundbloc')
        this.platform=[]
        this.platformDisplay=[]
        this.scene.input.mouse.disableContextMenu();
        const sides = 6;
        const size = 32;
        const distance = size * 2;
        const stiffness = 0.3;
        const lastPosition = new Phaser.Math.Vector2();
        const Options = { friction: 0, frictionAir: 0, restitution: 0, ignoreGravity: true,inertia: Infinity };
        const pinOptions = { friction: 0, frictionAir: 0, restitution: 0, ignoreGravity: true, inertia: Infinity, isStatic: true,label:'floor'};
        events.on('mech-augment',()=>{
            this.scene.sound.add('powerup',{volume:0.3}).play()
            this.nbplatform+=1
        },this)
        events.on("erase",()=>{
            if(this.trace===false && this.lock===false){
                this.scene.sound.add('clicup',{volume:0.2}).play()
                console.log("erase")
            this.erasePlatform(this.platform)
            this.eraseDisplayPlatform(this.platformDisplay)
            }
        })
        
        
        this.scene.input.on('pointerdown', (pointer)=> 
            {
                
                if(this.platform.length<=this.nbplatform && this.trace===true)
                {
                    
                    
                    lastPosition.x = pointer.worldX;
                    lastPosition.y = pointer.worldY;
                    this.previous = this.scene.matter.add.polygon(pointer.worldX, pointer.worldY, sides, size, pinOptions);
                    const image= this.scene.add.image(pointer.worldX, pointer.worldY,'mechanic',"Calque "+Phaser.Math.Between(1,8)).setDisplaySize(60,60).setPipeline('Light2D').setAngle(Phaser.Math.Between(0,180))
                    this.soundbloc.play()
                    this.platform.push(this.previous)
                    this.platformDisplay.push(image)
                    events.emit('mech-changed',(((this.nbplatform-this.platform.length)*100)/this.nbplatform))

                   
                }
            }, this);

            this.scene.input.on('pointermove',  (pointer)=> {
                if (pointer.isDown && this.trace===true)
                {
                    const x =  pointer.worldX;
                    const y =  pointer.worldY;
                

                    if (Phaser.Math.Distance.Between(x, y, lastPosition.x, lastPosition.y) > distance && Phaser.Math.Distance.Between(x, y, lastPosition.x, lastPosition.y)<distance*3 && this.platform.length<=this.nbplatform)
                    {
                        lastPosition.x = x;
                        lastPosition.y = y;

                        this.current = this.scene.matter.add.polygon(pointer.worldX, pointer.worldY, sides, size, pinOptions);
                        const image =this.scene.add.image(pointer.worldX, pointer.worldY,'mechanic',"Calque "+Phaser.Math.Between(1,8)).setDisplaySize(60,60).setPipeline('Light2D').setAngle(Phaser.Math.Between(0,180))
                        this.soundbloc.play()

                        this.previous = this.current;
                        this.platform.push(this.previous)
                        this.platformDisplay.push(image)
                        events.emit('mech-changed',(((this.nbplatform-this.platform.length)*100)/this.nbplatform))

                        
                    }
                }

            }, this);
            this.scene.input.on('pointerup',  (pointer)=> {
                if(this.trace===true && this.platform.length>0)
                {
                    events.emit('active')
                    this.trace=false
                }
                
            })
            this.scene.input.on('gameout',  (pointer)=> {
                if(this.trace===true && this.platform.length>1)
                {
                    events.emit('active')
                    this.trace=false
                }
                
            })
            
            
    }
       

    private erasePlatform(platform: MatterJS.BodyType[])
    {
        this.lock=true
        
        const time=this.scene.time.addEvent(
        {
            delay: 100,
            callback: () => 
            {
                this.scene.sound.add('woosh').play()
                this.scene.matter.world.remove(platform[0])
                
                if(platform.length>1)
                {
                platform.shift()
                }
                events.emit('mech-changed',(((this.nbplatform-(this.platform.length-1))*100)/this.nbplatform))
               
                
            },
                repeat: platform.length ,     
        })
        this.scene.time.delayedCall(platform.length*100, ()=> 
        {
            
            time.destroy()
            events.emit('disactive')
            this.trace=true 
            this.lock=false
        })
    }
    private eraseDisplayPlatform(platform: Phaser.GameObjects.Image[])
    {
        const time=this.scene.time.addEvent(
        {
            
            delay: 100,
            callback: () => 
            {
                platform[0].setVisible(false)
                if(platform.length>0)
                {
                 platform.shift()
                }
                
            },
                repeat: platform.length ,
        })
        this.scene.time.delayedCall(platform.length*100, ()=> 
        {
            time.destroy()
        })
    }
    update(dt: number)
    {
        
    } 

}