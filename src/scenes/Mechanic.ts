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
private nbplatform=10
private trace = true
private delayerase

    constructor(scene: Game)
    {
        
        this.scene= scene
        this.platform=[]
        this.platformDisplay=[]
        this.scene.input.mouse.disableContextMenu();
        const nbplatform=15
        const sides = 6;
        const size = 32;
        const distance = size * 2;
        const stiffness = 0.3;
        const lastPosition = new Phaser.Math.Vector2();
        const Options = { friction: 0, frictionAir: 0, restitution: 0, ignoreGravity: true,inertia: Infinity };
        const pinOptions = { friction: 0, frictionAir: 0, restitution: 0, ignoreGravity: true, inertia: Infinity, isStatic: true,label:'floor'};
        
        events.on("erase",()=>{
            if(this.trace===false){
            this.delayerase.destroy()
            this.erasePlatform(this.platform)
            this.eraseDisplayPlatform(this.platformDisplay)
            }
        })
        
        
        this.scene.input.on('pointerdown', (pointer)=> 
            {
                if(this.platform.length<nbplatform && this.trace===true)
                {
                    lastPosition.x = pointer.worldX;
                    lastPosition.y = pointer.worldY;
                    this.previous = this.scene.matter.add.polygon(pointer.worldX, pointer.worldY, sides, size, pinOptions);
                    const image= this.scene.add.image(pointer.worldX, pointer.worldY,'mechanic',"Calque "+Phaser.Math.Between(1,8)).setDisplaySize(60,60).setPipeline('Light2D').setAngle(Phaser.Math.Between(0,180))
                    this.platform.push(this.previous)
                    this.platformDisplay.push(image)

                    this.delayerase=this.scene.time.delayedCall(3000, () => 
                        {
                            this.erasePlatform(this.platform)
                            this.eraseDisplayPlatform(this.platformDisplay)
                        })
                }
            }, this);

            this.scene.input.on('pointermove',  (pointer)=> {
                if (pointer.isDown && this.trace===true)
                {
                    const x =  pointer.worldX;
                    const y =  pointer.worldY;
                

                    if (Phaser.Math.Distance.Between(x, y, lastPosition.x, lastPosition.y) > distance && Phaser.Math.Distance.Between(x, y, lastPosition.x, lastPosition.y)<distance*3 && this.platform.length<nbplatform)
                    {
                        this.delayerase.destroy()

                        lastPosition.x = x;
                        lastPosition.y = y;

                        this.current = this.scene.matter.add.polygon(pointer.worldX, pointer.worldY, sides, size, pinOptions);
                        const image =this.scene.add.image(pointer.worldX, pointer.worldY,'mechanic',"Calque "+Phaser.Math.Between(1,8)).setDisplaySize(60,60).setPipeline('Light2D').setAngle(Phaser.Math.Between(0,180))
                    
                        

                        this.previous = this.current;
                        this.platform.push(this.previous)
                        this.platformDisplay.push(image)

                        this.delayerase=this.scene.time.delayedCall(3000, () => 
                        {
                            events.emit('active')
                            this.erasePlatform(this.platform)
                            this.eraseDisplayPlatform(this.platformDisplay)
                        })
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
                if(this.trace===true && this.platform.length>0)
                {
                    events.emit('active')
                    this.trace=false
                }
                
            })
            
            
    }
       

    private erasePlatform(platform: MatterJS.BodyType[])
    {
        const time=this.scene.time.addEvent(
        {
            delay: 100,
            callback: () => 
            {
                this.scene.matter.world.remove(platform[0])
                if(platform.length>1)
                {
                platform.shift()
                }
            },
                repeat: platform.length ,     
        })
        this.scene.time.delayedCall(platform.length*100, ()=> 
        {
            time.destroy()
            events.emit('disactive')
            this.trace=true 
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