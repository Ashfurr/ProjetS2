import Phaser from "phaser";
import * as MatterJS from 'matter-js';
import StateMachine from "~/statemachine/StateMachine";
import {sharedInstance as events} from "~/scenes/EventCenter";
import ObstaclesController from "./ObstaclesController";
export default class SnowmanController
{
    
    private sprite: Phaser.Physics.Matter.Sprite
    private scene: Phaser.Scene
    private stateMachine: StateMachine
    private obstacles!: ObstaclesController
    private moveTime = 0
    private cible={x:0,y:0}

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        
        this.scene = scene
        this.sprite= sprite
        this.createAnimations()
        const ennemyController={
            sprite,
            sensors: {
                center: MatterJS.BodyType
            },
        }
        const ennemybody=this.scene.matter.bodies.circle(sprite.x,sprite.y,50,{label:'bodyEnnemy'})
        ennemyController.sensors.center = this.scene.matter.bodies.rectangle(sprite.x,sprite.y,750,750,{isSensor:true})
        const compoundenemy = this.scene.matter.body.create({parts:[ennemybody,ennemyController.sensors.center ]})
        ennemyController.sprite
            .setExistingBody(compoundenemy)
            .setFixedRotation()
            

            
        

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
            .addState('fire',{
                onEnter: this.fireOnEnter,
            
            })
            .addState('dead')
            .setState('idle')
        events.on('snowmen-stomped', this.handleStomped, this)
        this.scene.matter.world.on('collisionstart',(event, bodyA, bodyB)=> {
            if(bodyA.label==='player'||bodyB===ennemyController.sensors.center){
                this.stateMachine.setState('fire')
                bodyA.x=this.cible.x
                bodyA.y=this.cible.y
            }
        });
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
    private fireOnEnter(){
        this.scene.matter.add.sprite(this.sprite.x,this.sprite.y,'projectil')
        //this.scene.physics.moveToObject()
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
            frames: [{key: 'snowman', frame: 'robo_player_0'}],
            repeat: -1,
        })
        this.sprite.anims.create({
            key: 'snowmen-walk',
            frameRate: 4,
            frames: this.sprite.anims.generateFrameNames('snowman', {start: 2, end: 3, prefix: 'robo_player_'}),
            repeat: -1,
        })
    }
    update(dt: number)
    {
        //this.stateMachine.update(dt)
        
    }
}