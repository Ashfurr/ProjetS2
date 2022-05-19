import Phaser from "phaser"
import StateMachine from "~/statemachine/StateMachine";
import {sharedInstance as events} from "~/scenes/EventCenter";
import ObstaclesController from "~/scenes/ObstaclesController";


type CursorsKeys= Phaser.Types.Input.Keyboard.CursorKeys

export default class PlayerController {
    private scene: Phaser.Scene
    private sprite: Phaser.Physics.Matter.Sprite
    private stateMachine: StateMachine
    private cursors: CursorsKeys
    private obstacles: ObstaclesController
    private health = 100
    private keys
    private center = true
    private save={x:0,y:0}
    private lastSnowmen?: Phaser.Physics.Matter.Sprite
    private lastSave?: Phaser.Physics.Matter.Sprite

    constructor(scene: Phaser.Scene,sprite: Phaser.Physics.Matter.Sprite, cursors: CursorsKeys, obstacles: ObstaclesController) {
        
        this.scene = scene
        this.sprite = sprite
        this.cursors = cursors
        this.obstacles = obstacles
        this.createAnimations()
        this.keys = this.scene.input.keyboard.addKeys('Z,Q,S,D')
        this.scene.cameras.main.startFollow(this.sprite)
		this.scene.cameras.main.setDeadzone(200,130);
        this.sprite.setFixedRotation()
        
        this.stateMachine = new StateMachine(this, 'player')


        this.stateMachine.addState('idle', {
            onEnter: this.idleOnEnter,
            onUpdate: this.idleOnUpdate,
            onExit:this.idleOnExit
            
        })
            .addState('walk', {
                onEnter: this.walkOnEnter,
                onUpdate: this.walkOnUpdate,
                onExit: this.walkOnExit
            })
            .addState('jump', {
                onEnter: this.jumpOnEnter,
                onUpdate: this.jumpOnUpdate
            })
            .addState('descent',{
                onEnter: this.descentOnEnter,
                onUpdate: this.descentOnUpdate,
            })
            .addState('spike-hit',{
                onEnter: this.spikeHitOnEnter
        })
            .addState('snowmen-hit',{
                onEnter:this.snowmenHitOnEnter,
            })
            .addState('snowmen-stomp',{
                onEnter:this.snowmenStompOnEnter,
            })
            .addState('death',{
                onEnter: this.deadOnEnter,
            })
            .addState('saved',{
                onEnter: this.saveOnEnter,
                
            })
            .setState('idle')

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
            const body = data.bodyB as MatterJS.BodyType
            const bodyB = data.bodyA as MatterJS.BodyType
            const gameObject = body.gameObject
            const gameObject1=bodyB.gameObject
        
         
            if (this.obstacles.is('spikes', body))
            {
                this.stateMachine.setState('spike-hit')
            
                return
            }

            if(this.obstacles.is('snowman', body))
            {
                this.lastSnowmen= body.gameObject
                if(this.sprite.y+60 < body.position.y)
                {
                    this.stateMachine.setState('snowmen-stomp')
                }
                else
                {
                    this.stateMachine.setState('snowmen-hit')
                }
                return
            }
          
            // @ts-ignore
            if(bodyB.name==='floor'||body.label==='floor')
            { 
                if (this.stateMachine.isCurrentState('descent'))
                {
                    this.stateMachine.setState('idle')
                }
                return
            }
            
            
            const sprite = gameObject as Phaser.Physics.Matter.Sprite
            const type = sprite.getData('type')
            switch(type)
            {
                case "star":
                {
                    events.emit('star-collected')
                    sprite.destroy()
                    break
                }
                case "health":
                {
                    const value= sprite.getData('healthPoints') ?? 10
                    this.health= Phaser.Math.Clamp(this.health + value, 0 ,100)
                    events.emit('health-changed', this.health)
                    sprite.destroy()
                    break
                }
                case "rect":
                    this.stateMachine.setState('saved')
                    sprite.emit("disabled")
                    sprite.destroy()
            }
        })
    }
   

    update(dt: number) {
        this.stateMachine.update(dt)
        
        if(this.sprite.body.velocity.y>10){
            this.stateMachine.setState('descent')
        }


    }
    private setHealth(value: number)
    {
        this.health = Phaser.Math.Clamp(value,0,100)

        events.emit('health-changed', this.health)
        //check for death
        if(this.health <= 0 )
        {
            this.stateMachine.setState('death')
        }
    }

    private idleOnEnter() {

        this.sprite.play('player-idle')
        //this.sprite.setFriction(1)

    }
    private idleOnUpdate(){

        if (this.keys.Q.isDown || this.keys.D.isDown){
            this.stateMachine.setState('walk')
        }
        if(this.keys.Z.isDown){
            if(this.scene.cameras.main.zoom>0.4)
            {
                this.scene.cameras.main.zoom-=0.001
            }

            this.center=false

        }
        if(this.keys.Z.isUp  && this.center === false){
            this.scene.cameras.main.zoom=1
            this.center=true

        }


        const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space)
        if (spaceJustPressed) {
            this.stateMachine.setState('jump')
        }
    }
    private idleOnExit(){
       // this.sprite.setFriction(0)
        //this.sprite.setFrictionStatic(10)
    }

    private walkOnEnter() {
        this.sprite.play('player-walk')
    }
    private walkOnUpdate() {
        const speed = 4
        if (this.keys.Q.isDown) {
            this.sprite.setVelocityX(-speed)
            this.sprite.flipX = true
        } else if (this.keys.D.isDown) {
            this.sprite.setVelocityX(speed)
            this.sprite.flipX = false
        } else {
            this.sprite.setVelocityX(0)
            this.stateMachine.setState('idle')
        }
        const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space)
        if (spaceJustPressed) {
            this.stateMachine.setState('jump')
        }
    }
    private walkOnExit(){
        this.sprite.stop()
    }
    private jumpOnEnter()
    {
        this.sprite.setVelocityY(-12)
        this.sprite.play('player-ascent',true)
    }
    private jumpOnUpdate()
    {
        this.sprite.setRotation(0)
        const speed = 5

        if (this.keys.Q.isDown) {
            this.sprite.setVelocityX(-speed)
            this.sprite.flipX = true
        } else if (this.keys.D.isDown) {
            this.sprite.setVelocityX(speed)
            this.sprite.flipX = false
        }
        if (this.sprite.body.velocity.y>=0){
            this.stateMachine.setState('descent')
        }
    }
    private descentOnEnter(){
        this.sprite.play('player-descent',true)
    }
    private descentOnUpdate(){
        const speed = 5

        if (this.keys.Q.isDown) {
            this.sprite.setVelocityX(-speed)
            this.sprite.flipX = true
        } else if (this.keys.D.isDown) {
            this.sprite.setVelocityX(speed)
            this.sprite.flipX = false
        }

        if(this.sprite.body.velocity.y<0.2){
            this.stateMachine.setState('idle')
        }

    }
    private deadOnEnter()
    {
        this.sprite.x=this.save.x
        this.sprite.y=this.save.y
        this.health=100
        events.emit('health-changed', this.health)
        this.stateMachine.setState('idle')

    }
    private saveOnEnter(){
        this.save.x = this.sprite.x
        this.save.y= this.sprite.y
        this.stateMachine.setState('idle')
    }

    private spikeHitOnEnter(){
        this.sprite.setVelocityY(-12)
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff)
        const endColor = Phaser.Display.Color.ValueToColor(0xff0000)

        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: 2,
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
                this.sprite.setTint(color)
            }
        })

        this.stateMachine.setState('idle')
        this.setHealth(this.health-50)
    }
    private snowmenHitOnEnter()
    {
        if(this.lastSnowmen)
        {
            if (this.sprite.x < this.lastSnowmen.x)
            {
                this.sprite.setVelocityX(-20)
            } else
            {
                this.sprite.setVelocityX(20)
            }
        }
        else
        {
            this.sprite.setVelocityY(-20)
        }

            this.setHealth(this.health-10)

            const startColor = Phaser.Display.Color.ValueToColor(0xffffff)
            const endColor = Phaser.Display.Color.ValueToColor(0x0000ff)

            this.scene.tweens.addCounter({
                from: 0,
                to: 100,
                duration: 100,
                repeat: 2,
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
                    this.sprite.setTint(color)
                }
            })
        this.stateMachine.setState('idle')
    }
    private snowmenStompOnEnter()
    {
        this.sprite.setVelocityY(-10)
        events.emit('snowmen-stomped',this.lastSnowmen)
        this.stateMachine.setState('idle')
    }

    private createAnimations() {
        this.sprite.anims.create({
            key: "player-idle",
            frameRate: 1,
            frames: [{key: 'player', frame: 'chibiDefJ.(1).png'}],
            repeat: -1,
        })
        this.sprite.anims.create({
            key: 'player-walk',
            frameRate: 90,
            frames: this.sprite.anims.generateFrameNames('player', {start: 1, end: 55, prefix: 'chibiDef.',suffix:'.png',zeroPad:2}),
            repeat: -1,
            
        })
        this.sprite.anims.create({
            key: 'player-ascent',
            frameRate: 200    ,
            frames: this.sprite.anims.generateFrameNames('player', {start: 1, end: 35, prefix: 'chibiDefJ.(',suffix:').png',zeroPad:1}),
        })
        this.sprite.anims.create({
            key: 'player-descent',
            frameRate: 120,
            frames: this.sprite.anims.generateFrameNames('player', {start: 36, end: 59, prefix: 'chibiDefJ.(',suffix:').png',zeroPad:1}),
        })

    }
}