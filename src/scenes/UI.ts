import Phaser from "phaser"
import{sharedInstance as events} from "~/scenes/EventCenter";

export default class UI extends Phaser.Scene
{
    private starsLabel!: Phaser.GameObjects.Text
    private starsCollected=0
    private graphics!: Phaser.GameObjects.Graphics
    private lastHealth=100
    private fpsText!: Phaser.GameObjects.Text
    constructor() {
        super({
            key: "ui"
        });
    }
    init()
    {
        this.starsCollected=0
    }
   
    create()
    {

        this.fpsText = this.add.text(10, 120, 'FPS: --', {
            font: 'bold 26px Arial',
            color: '#ffffff'
        });
        const cursor=this.add.image(0,0,'cursor').setDisplaySize(50,50)
        this.graphics = this.add.graphics()
        this.setHealthBar(100)

        this.starsLabel =this.add.text(10,35,"Stars : 0 ",{
            fontSize: "32px"
        })
        events.on('star-collected',this.handleStarCollected,this)
        events.on('health-changed',this.handleHealthChanged,this)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN,() => {
            events.off('star-collected',this.handleStarCollected,this )
        })
        this.input.on('pointermove',  (pointer)=> {
            cursor.setPosition(pointer.worldX,pointer.worldY)
        });
    }
    
    private setHealthBar(value: number)
    {
        const width=200
        const percent = Phaser.Math.Clamp(value,0,100)/100

        this.graphics.clear()
        this.graphics.fillStyle(0x808080)
        this.graphics.fillRoundedRect(10,10,width,20,5)
       if(percent >0)
       {
           this.graphics.fillStyle(0x00ff00)
           this.graphics.fillRoundedRect(10,10,width*percent,20,5)
       }
    }
    private handleHealthChanged(value: number)
    {
        this.tweens.addCounter({
            from: this.lastHealth,
            to : value,
            duration:200,
            ease : Phaser.Math.Easing.Sine.InOut,
            onUpdate: tween => {
                const value = tween.getValue()
                this.setHealthBar(value)
            }
        })
        this.setHealthBar(value)
        this.lastHealth = value
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