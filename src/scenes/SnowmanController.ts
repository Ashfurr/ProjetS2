import Phaser from "phaser";
import * as MatterJS from 'matter-js';
import StateMachine from "~/statemachine/StateMachine";
import {sharedInstance as events} from "~/scenes/EventCenter";
import ObstaclesController from "./ObstaclesController";
import Projectil from "./projectile";
export default class SnowmanController
{
    
    private sprite: Phaser.Physics.Matter.Sprite
    private scene: Phaser.Scene
    private stateMachine: StateMachine
    private obstacles!: ObstaclesController
    private moveTime = 0
    private attackspeed=0
    private cible={x:0,y:0}
    private projectil!:Phaser.Physics.Matter.Sprite
    private timerFire?=Phaser.Time.TimerEvent
    private alive=true
    private timerAttackSpeed=Phaser.Time.TimerEvent
    private angle!:number
   
    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        this.scene = scene
        this.sprite= sprite
        this.createAnimations()
        const circlezone= new Phaser.Geom.Circle(0,0,50)
        const fxSave = this.scene.add.particles('ennemy')
        const emmiterproj = fxSave.createEmitter(
            {
                //tint:[0x18022F,0x0C022F,0x030662],
                speed: {min: 150, max: 300},
                angle:{start:0,end:360,steps:15},
                scale: {start: 0.1, end: 0.2},
                lifespan: {min:50,max:450},
                blendMode: 'SCREEN',
                frequency: 1,
                quantity:2,
                rotate:{start:360,end:0},
                alpha: {start:1,end:0},
                emitZone:{type: 'random',source:circlezone}
                

            });
        emmiterproj.startFollow(sprite)
        const ennemyController={
            sprite,
            sensors: {
                center: MatterJS.BodyType
            },
        }
        const ennemybody=this.scene.matter.bodies.circle(sprite.x,sprite.y,50,{label:'bodyEnnemy'})
        ennemyController.sensors.center = this.scene.matter.bodies.circle(sprite.x,sprite.y,450,{isSensor:true})
        const compoundenemy = this.scene.matter.body.create({parts:[ennemybody,ennemyController.sensors.center ]})
        ennemyController.sprite.setExistingBody(compoundenemy)
        ennemyController.sprite.setFixedRotation()
        //ennemyController.sprite.setStatic(true)


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
                onUpdate:this.fireOnUpdate,
                onExit:this.fireOnExit
            
            })
            .addState('dead')
            .setState('idle')
        events.on('snowmen-stomped', this.handleStomped, this)
        this.scene.matter.world.on('collisionstart',(event, bodyA, bodyB)=> {
            if(bodyA.label==='player'&& bodyB===ennemyController.sensors.center){
                this.stateMachine.setState('fire')
                this.cible.x=bodyA.position.x
                this.cible.y=bodyA.position.y
                
            }
            
        });
        this.scene.matter.world.on('collisionend',(event, bodyA, bodyB)=> {
            if(bodyA.label==='player'&& bodyB===ennemyController.sensors.center && this.alive===true){
                this.stateMachine.setState('idle')
  
            }
        })
           
    }
    tracking(x:number,y:number){
        this.cible.x=x 
        this.cible.y=y
        this.angle=(Phaser.Math.Angle.Between(this.sprite.x,this.sprite.y,this.cible.x,this.cible.y))
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
        this.attackspeed=0
        events.emit('targuet') 
    }
private fireOnUpdate(dt:number){
         
        this.attackspeed+=dt
        if(this.attackspeed>2000){
            new Projectil(this.scene,this.sprite.x,this.sprite.y,this.angle)
            this.attackspeed=0
        }
    }
    private fireOnExit(){
        events.emit('targuet') 
    }
    private handleStomped(snowmen: Phaser.Physics.Matter.Sprite)
    {
        this.alive=false
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
                this.sprite.active=false
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
        if(this.sprite.active===true){
        this.stateMachine.update(dt)  } 
    }
}