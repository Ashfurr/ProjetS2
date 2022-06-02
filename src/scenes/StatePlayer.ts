import Phaser from "phaser";
import PlayerController from "~/scenes/PlayerController";
import ObstaclesController from "~/scenes/ObstaclesController";
import {sharedInstance as events} from "~/scenes/EventCenter";



export default class StatePlayer {

    constructor(this) {
        this=this
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
        events.emit('player-dead')
    }
    private saveOnEnter(){
        this.sprite.x=this.save.x
        this.sprite.y=this.save.y
    }
    private saveOnExit(){
        this.stateMachine.setState('idle')
    }
    private handleDeath([x,y]){
        this.sprite.x=x
        this.sprite.y=y
        this.health=100
        console.log(x,y)
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

}