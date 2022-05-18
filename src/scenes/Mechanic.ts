import Phaser from 'phaser'
import Game from './Game'

export default class Mechanic
{

private scene : Game
private previous!: MatterJS.BodyType
private current!: MatterJS.BodyType
private graphics!: Phaser.GameObjects.Graphics
private platform: MatterJS.BodyType[]
private platformDisplay:Phaser.GameObjects.Image[]
private constraint!: MatterJS.ConstraintType
private nbplatform=10
private trace = true
    constructor(scene: Game)
    {
        this.scene= scene
        this.platform=[]
        this.platformDisplay=[]
        this.scene.input.mouse.disableContextMenu();
        const nbplatform=15
        const sides = 16;
        const size = 14;
        const distance = size * 2;
        const stiffness = 0.3;
        const lastPosition = new Phaser.Math.Vector2();
        const Options = { friction: 0, frictionAir: 0, restitution: 0, ignoreGravity: true,inertia: Infinity };
        const pinOptions = { friction: 0, frictionAir: 0, restitution: 0, ignoreGravity: true, inertia: Infinity, isStatic: true,label:'floor'};

        this.scene.input.on('pointerdown', (pointer)=> 
            {
                if(this.platform.length<nbplatform && this.trace===true)
                {
                    lastPosition.x = this.scene.cursorX;
                    lastPosition.y = this.scene.cursorY;
                    this.previous = this.scene.matter.add.polygon(pointer.worldX, pointer.worldY, sides, size, pinOptions);
                    const image= this.scene.add.image(pointer.worldX, pointer.worldY,'cursor').setDisplaySize(32,32)
                    this.platform.push(this.previous)
                    this.platformDisplay.push(image)
                }
            }, this);

            this.scene.input.on('pointermove',  (pointer)=> {
                if (pointer.isDown)
                {
                    const x =  this.scene.cursorX;
                    const y =  this.scene.cursorY;
                

                    if (Phaser.Math.Distance.Between(x, y, lastPosition.x, lastPosition.y) > distance && Phaser.Math.Distance.Between(x, y, lastPosition.x, lastPosition.y)<distance*3 && this.platform.length<nbplatform)
                    {
                        lastPosition.x = x;
                        lastPosition.y = y;

                        this.current = this.scene.matter.add.polygon(pointer.worldX, pointer.worldY, sides, size, pinOptions);
                        const image =this.scene.add.image(pointer.worldX, pointer.worldY,'cursor').setDisplaySize(32,32)
                        
                        

                        this.constraint=this.scene.matter.add.constraint(this.previous, this.current, distance, stiffness);
                        console.log()

                        this.previous = this.current;
                        this.platform.push(this.previous)
                        this.platformDisplay.push(image)
                        console.log(this.platform)
                    }
                }

            }, this);
            this.scene.input.on('pointerup',  (pointer)=> {
                if(this.trace===true && this.platform.length>1)
                {
                    console.log("desactiver")
                    this.trace=false
                    this.scene.time.delayedCall(3000, () => 
                    {
                        this.erasePlatform(this.platform)
                        this.eraseDisplayPlatform(this.platformDisplay)
                    })
                }
                
            })
            this.scene.input.on('pointerdown',  (pointer)=>
            {
                if(pointer.rightButtonDown())
                {
                    //this.erasePlatform(this.platform)
                    //this.eraseDisplayPlatform(this.platformDisplay)
                }
                
            }
        )}
       

    private erasePlatform(platform: MatterJS.BodyType[])
    {
        this.scene.time.addEvent(
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
            this.trace=true  
            console.log(this.trace)
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
                if(platform.length>1)
                {
                 platform.shift()
                }
            },
                repeat: platform.length ,
        })
        if(time.hasDispatched)
        {
            this.trace=true
        }
    }
}