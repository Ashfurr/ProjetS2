import StateMachine from "~/statemachine/StateMachine";
import {sharedInstance as events} from "~/scenes/EventCenter";

export default class SnowmanController
{
    private sprite: Phaser.Physics.Matter.Sprite
    private scene: Phaser.Scene
    private stateMachine: StateMachine

    private moveTime = 0

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        this.scene = scene
        this.sprite= sprite
        this.createAnimations()
        this.stateMachine= new StateMachine(this, 'snowman')

        this.stateMachine.addState('idle',{
            onEnter: this.idleOnEnter
        })
            .addState('move-left',{
                onEnter: this.moveLeftOnEnter,
                onUpdate:this.moveLeftOnUpdate
            })
            .addState('move-right',{
                onEnter: this.moveRightOnEnter,
                onUpdate:this.moveRightOnUpdate
            })
            .addState('dead')
            .setState('idle')
        events.on('snowmen-stomped', this.handleStomped, this)
    }
    destroy()
    {
        events.off('snowmen-stomped', this.handleStomped,this)
    }
    private idleOnEnter()
    {
        const r = Phaser.Math.Between(1,100)
        this.sprite.play('snowmen-idle')
        if(r < 50)
        {
            this.stateMachine.setState('move-left')
        }
        else
        {
            this.stateMachine.setState('move-right')
        }
    }
    private moveLeftOnEnter()
    {
        this.sprite.flipX=true
        this.moveTime= 0
        this.sprite.play('snowmen-walk')

    }
    private moveLeftOnUpdate(dt: number)
    {
        this.sprite.setVelocityX(-3)
        this.moveTime += dt
        if(this.moveTime>2000)
        {
            this.stateMachine.setState('move-right')
        }
    }
    private moveRightOnEnter()
    {
        this.moveTime= 0


    }
    private moveRightOnUpdate(dt: number)
    {
        this.sprite.flipX=false
        this.sprite.setVelocityX(3)
        this.moveTime += dt
        if(this.moveTime>2000)
        {
            this.stateMachine.setState('move-left')
        }
    }
    private handleStomped(snowmen: Phaser.Physics.Matter.Sprite)
    {
        if(this.sprite!== snowmen)
        {
            return
        }

        events.off('snowmen-stomped', this.handleStomped,this)

        this.scene.tweens.add({
            targets: this.sprite,
            displayHeight:0,
            y: this.sprite.y+(this.sprite.displayHeight*0.5),
            duration: 200,
            onComplete:()=> {
                this.sprite.destroy()
            }
        })

        this.stateMachine.setState('dead')
    }
    private createAnimations()
    {
        this.sprite.anims.create({
            key: "snowmen-idle",
            frameRate: 4,
            frames: [{key: 'player', frame: 'robo_player_0'}],
            repeat: -1,
        })
        this.sprite.anims.create({
            key: 'snowmen-walk',
            frameRate: 4,
            frames: this.sprite.anims.generateFrameNames('player', {start: 2, end: 3, prefix: 'robo_player_'}),
            repeat: -1,
        })
    }
    update(dt: number)
    {
        this.stateMachine.update(dt)
    }
}