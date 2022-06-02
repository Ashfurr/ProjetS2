import Phaser from "phaser"
import{sharedInstance as events} from "~/scenes/EventCenter";

export default class UI extends Phaser.Scene
{

    private starsLabel!: Phaser.GameObjects.Text
    private starsCollected=0
    private graphics!: Phaser.GameObjects.Graphics
    private graphicsMech!: Phaser.GameObjects.Graphics
    private lastHealth=100
    private fpsText!: Phaser.GameObjects.Text
    private tween!:Phaser.Tweens.Tween
    private mechWidth=300
    private current=0
    constructor() {
        super({
            key: "ui"
        });
    }
    init()
    {
        this.starsCollected=0
    }
    preload(){
        this.load.bitmapFont('myfont', 'assets/desyrel-pink.png','assets/desyrel-pink.xml')
        this.load.image('vie', 'assets/images/vie.png')
       
    }
   
    create()
    {
        
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff)
        const endColor = Phaser.Display.Color.ValueToColor(0x0000ff)
        this.tween=this.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 200,
            repeat: -1,
            paused:true,
            loop:-1,
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
                cursor.setTint(color)
            }
        })
        events.on("active",()=>{
            console.log(this.tween.isPlaying())
        if(this.tween.isPlaying()===false){   
            this.tween.resume()
        }
        })
        events.on("disactive",()=>{
            if(this.tween.isPlaying()===true){   
            this.tween.pause()
            cursor.setTint(undefined)
            cursor.setTexture('cursor')
            
            }
        })
    
    



        this.fpsText = this.add.text(10, 200, 'FPS: --', {
            font: 'bold 26px Arial',
            color: '#ffffff'
        });
        const cursor=this.add.image(0,0,'cursor').setScale(0.2)
        this.graphics = this.add.graphics()
        this.graphicsMech=this.add.graphics()
        this.setHealthBar(100)
        this.setMechaBar(100)

        this.starsLabel =this.add.bitmapText(10,100,"myfont","Light : 0 ",64)
        events.on('star-collected',this.handleStarCollected,this)
        events.on('health-changed',this.handleHealthChanged,this)
        events.on('mech-changed',this.handleMechChanged,this)
        events.on('mech-augment',()=>{
            const fxSave = this.add.particles('partproj')
            const emmiterproj = fxSave.createEmitter(
            {
                x:this.game.canvas.width/2-this.mechWidth/2+this.mechWidth,
                y:this.graphicsMech.y+20,
                
                speed: {min: 250, max: 300},
                //angle:{start:0,end:360,steps:64},
                scale: {start: 0.1, end: 0.4},
                lifespan: 500,
                blendMode: 'ADD',
                quantity:1,
                rotate:{start:360,end:0},
                alpha: {start:1,end:1},
                //emitZone:{type: 'random',source:circlezone}
            });
        emmiterproj.explode(20)
            this.mechWidth+=50
            this.handleMechChanged(this.current)


        },this)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN,() => {
            events.off('star-collected',this.handleStarCollected,this )
        })
        this.input.on('pointermove',  (pointer)=> {
            cursor.setPosition(pointer.worldX,pointer.worldY-10)
        });
        this.input.on('pointerdown',  (pointer)=> {
            cursor.setTexture('cursorA')
        }); 
    }
    
    private setHealthBar(value: number)
    {
        const percent = Phaser.Math.Clamp(value,0,100)/100

        this.graphics.clear()
        const vie= this.add.image(270,50,'vie').setDepth(0).setTint(0x000000)
        const width=vie.width+5
       if(percent >0)
       {
           this.graphics.fillStyle(0x00ff00)
           this.graphics.fillRoundedRect(10,10,width*percent,vie.height,5).setBlendMode('ADD').setDepth(1).mask= new Phaser.Display.Masks.BitmapMask(this,vie)
       }
    }
    private setMechaBar(value:number){
        this.current=value
        this.graphicsMech.clear()
        this.graphicsMech.fillStyle(0x808080)
        this.graphicsMech.fillRoundedRect(this.game.canvas.width/2-this.mechWidth/2,10,this.mechWidth,40,10)
         
        const percent = Phaser.Math.Clamp(value,0,500)/100
        
        if(percent >0)
        {
            
            this.graphicsMech.fillStyle(0xF97500)
            this.graphicsMech.fillRoundedRect(this.game.canvas.width/2-this.mechWidth/2,10,this.mechWidth*percent,40,10)
        }
    }
    private handleHealthChanged(value: number)
    { 
        
        this.setHealthBar(value)
        
    }
    private handleMechChanged(value: number)
    { 
        this.setMechaBar(value)
        
    }
    private handleStarCollected()
    {
        ++this.starsCollected
        this.starsLabel.text= `Stars: ${this.starsCollected}`
    }
    update(time: number, delta: number): void {
        this.fpsText.setText('FPS: ' + (1000/delta).toFixed(3))
    }
    
}