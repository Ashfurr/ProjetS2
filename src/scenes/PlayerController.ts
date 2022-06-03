import Phaser from "phaser"
import StateMachine from "~/statemachine/StateMachine";
import {sharedInstance as events} from "~/scenes/EventCenter";
import ObstaclesController from "~/scenes/ObstaclesController";
import SnowmanController from "./SnowmanController";



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
    private music:Phaser.Sound.BaseSound
    private blocked=false
    private constraint!:MatterJS.ConstraintType
    private lock:boolean

    constructor(scene: Phaser.Scene,sprite: Phaser.Physics.Matter.Sprite, cursors: CursorsKeys, obstacles: ObstaclesController) {
        this.scene = scene
        this.sprite = sprite
        this.cursors = cursors
        this.obstacles = obstacles
        this.createAnimations()
        this.music=this.scene.sound.add('moskau',{loop:true})
        
        this.keys = this.scene.input.keyboard.addKeys('Z,Q,S,D,E')
        this.lock=true
        
		

        this.sprite.setFixedRotation()
        //this.music.play()
        
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
                onExit:this.descentOnExit
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
            const gameObject1 = bodyB.gameObject
            const supports = data.collision.supports
            //const anglu=Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(body.position,normal))


            //console.log(normal.x.toFixed(3),normal.y.toFixed(3))

            if (body.label === 'bodyEnnemy' && this.sprite.isSensor() === false) {

                this.lastSnowmen = body.gameObject
                {
                    this.scene.sound.add('toucher', {volume: 1}).play()
                    this.stateMachine.setState('snowmen-hit')
                }
                return
            }
            if (body.label === 'projectil' && this.sprite.isSensor() === false) {
                this.stateMachine.setState('snowmen-hit')
                this.scene.sound.add('toucher', {volume: 1}).play()
                return
            }

            if (body.label === 'platform') {
                this.stateMachine.setState('idle')
                if (this.stateMachine.isCurrentState('idle')) {
                    if (this.lock === true && this.sprite.isSensor() === false) {
                        this.lock = false
                        this.constraint = this.scene.matter.add.constraint(body, bodyB, 110, 0.7)
                    }
                }
            }

            if (this.obstacles.is('spikes', bodyB) || this.obstacles.is('spikes', body)) {
                this.stateMachine.setState('spike-hit')

                return
            }
            if (this.obstacles.is('trigger', bodyB)) {
                return
            }


            if (body.label === 'floor') {
               
                if (this.stateMachine.isCurrentState('descent')) {

                    this.stateMachine.setState('idle')
                }
                return
            }
            if (bodyB.label === 'ground') {
                for (let i = 0; i < supports.length; i++) {
                    const anglu = Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(body.position, supports[i]))
                    if (anglu > 20 && anglu < 160) {
                        this.blocked = false

                    } else {

                        this.blocked = true

                    }
                }
                if (this.stateMachine.isCurrentState('descent')) {

                    this.stateMachine.setState('idle')
                }
                return
            }

            const sprite = gameObject as Phaser.Physics.Matter.Sprite
            const type = sprite.getData('type')
            switch (type) {
                case "star": {
                    events.emit('star-collected')
                    sprite.destroy()
                    break
                }
                case "rect": {
                    this.stateMachine.setState('saved')
                    sprite.emit("disabled")
                    sprite.destroy()
                    break
                }
                case "end": {
                    console.log("end")
                    this.scene.scene.start('game-over')
                    break
                }
            }
                    const sprite2 = gameObject1 as Phaser.Physics.Matter.Sprite
                    const type2 = sprite2.getData('type')
                    switch (type2) {
                        case "star": {
                            events.emit('star-collected')
                            sprite2.destroy()
                            break
                        }
                        case "rect": {
                            this.stateMachine.setState('saved')
                            sprite2.emit("disabled")
                            sprite2.destroy()
                            break
                        }
                        case "end": {
                            console.log("end")
                            this.scene.scene.start('game-over')
                            break
                        }
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
        
        this.music.resume()
        console.log(this.health)
        
        

    }
    private idleOnUpdate(){

        if (this.keys.Q.isDown || this.keys.D.isDown){
            if(this.blocked===false){
            this.stateMachine.setState('walk')}
        }
        /*if(this.keys.Z.isDown){
            if(this.scene.cameras.main.zoom>0.4)
            {
                this.scene.cameras.main.zoom-=0.001
            }

            this.center=false

        }
       if(this.keys.Z.isUp  && this.center === false){
            this.scene.cameras.main.zoom=1
            this.center=true

        }*/


        const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space)
        if (spaceJustPressed) {
            this.stateMachine.setState('jump')
        }
        const eJustPressed=Phaser.Input.Keyboard.JustDown(this.keys.E)
        if(eJustPressed){
            events.emit('erase')
        }
    }
    private idleOnExit(){
        if(this.lock===false){
            this.lock=true
            
            this.scene.matter.world.removeConstraint(this.constraint,true)
            
        }
        this.sprite.setStatic(false)
        
        this.music.pause()
    }

    private walkOnEnter() {
        this.sprite.play('player-walk')
    }
    private walkOnUpdate() {
        const speed = 4
        if (this.keys.Q.isDown ) {
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
        
        this.blocked=false
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
        const eJustPressed=Phaser.Input.Keyboard.JustDown(this.keys.E)
        if(eJustPressed){
            events.emit('erase')
        }
    }
    private descentOnEnter(){
        this.sprite.play('player-descent',true)
    }
    private descentOnUpdate(){
        const speed = 5

        if (this.keys.Q.isDown && this.blocked===false) {
            this.sprite.setVelocityX(-speed)
            this.sprite.flipX = true
        } else if (this.keys.D.isDown && this.blocked===false) {
            this.sprite.setVelocityX(speed)
            this.sprite.flipX = false
        }
        const eJustPressed=Phaser.Input.Keyboard.JustDown(this.keys.E)
        if(eJustPressed){
            events.emit('erase')
        }
    }
    private descentOnExit(){
        this.blocked=false
    }

    
    private deadOnEnter()
    {
        this.scene.sound.add('death',{volume:0.5}).play()
        this.health=100
        events.emit('health-changed', this.health)
        this.sprite.setToSleep()
        this.sprite.setSensor(true)
        this.sprite.setVisible(false)
        const light = this.scene.lights.addLight(undefined,undefined,400,undefined,6);
        this.scene.time.delayedCall(500,()=>{
            const fxSaveTravel = this.scene.add.particles('particleSave').setPipeline('Light2D').setDepth(2)
            const emmiterSave = fxSaveTravel.createEmitter(
                {
                    speed: {min: 400, max: 600},
                    angle: {min:0, max:360},
                    scale: {start: 0.1, end: 0.2},
                    lifespan: {min: 500, max: 1000},
                    frequency: 150,
                    tint: [0x003AFE, 0xB801EE, 0xDD9D00],
                    blendMode:"ADD",
                    rotate:{start:0,end:760}  
                });
            emmiterSave.startFollow(this.sprite)
            let tween = this.scene.tweens.add(
                {
                    targets: this.sprite,
                    x: this.save.x,
                    y:this.save.y-20,
                    ease: 'Power1',
                    duration: 3000,
                    onUpdate:()=>{
                        light.setPosition(this.sprite.x,this.sprite.y)
                    },
                    onComplete:()=>{
                        this.blocked=false
                        this.sprite.setAwake()
                        this.sprite.setSensor(false)
                        this.sprite.setVisible(true)
                        this.stateMachine.setState('idle')
                        emmiterSave.stop()
                        light.setVisible(false)
                    }
                })
                
        })
        
        

    }
    private saveOnEnter(){
        this.scene.sound.add('save',{volume:0.5}).play()
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
        this.setHealth(this.health-100)
    }
    private snowmenHitOnEnter()
    {
        
        if(this.lastSnowmen)
        {
            if (this.sprite.x < this.lastSnowmen.x)
            {
                this.sprite.setVelocityX(-10)
            } else
            {
                this.sprite.setVelocityX(10)
            }
        }
        else
        {
            this.sprite.setVelocityY(-10)
        }

            this.setHealth(this.health-10)

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
    }
    private snowmenStompOnEnter()
    {
        //this.sprite.setVelocityY(-10)
        //events.emit('snowmen-stomped',this.lastSnowmen)
        //this.stateMachine.setState('idle')
    }

    private createAnimations() {
        this.sprite.anims.create({
            key: "player-idle",
            frameRate: 40,
            frames: this.sprite.anims.generateFrameNames('playeridle', {start: 1, end: 52, prefix: 'chibirussian(',suffix:').png'}),
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