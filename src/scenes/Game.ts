import Phaser from 'phaser'
import PlayerController from "~/scenes/PlayerController";
import ObstaclesController from "~/scenes/ObstaclesController";
import SnowmanController from "~/scenes/SnowmanController";
import {sharedInstance as events} from "~/scenes/EventCenter";
import Mechanic from './Mechanic';
import { GUI } from 'dat.gui';
import Save from './Save';



export default class Game extends Phaser.Scene {
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

	private player!: Phaser.Physics.Matter.Sprite
	private playerController?: PlayerController
	private SnowmanController?: SnowmanController
	public save: Save[]=[]
	private obstacles!: ObstaclesController
	private snowmen: SnowmanController[]= []
	private mechanic!: Mechanic
	private _cursor!: Phaser.GameObjects.Image
	private neon!: Phaser.Physics.Matter.Sprite

	constructor() {
		super('game')
	}
	init(){
		
		this.cursors=this.input.keyboard.createCursorKeys()
		this.obstacles = new ObstaclesController()
		this.snowmen=[]
		this.save=[]

		this.events.once(Phaser.Scenes.Events.SHUTDOWN,() => {
			this.destroy()
		})
	}

	preload() {
		this.load.atlas('playerback', 'assets/kenney_player.png', 'assets/kenney_player_atlas.json')
		this.load.atlas('player','assets/player.png','assets/player.json')
		this.load.atlas('snowman','assets/kenney_player.png','assets/kenney_player_atlas.json')
		this.load.image("tiles", ['assets/tilesets/triangle-imagefinal.png','assets/tilesets/triangle-imagefinal_n.png'])
		this.load.image('mask','assets/tilesets/mask.png')
		this.load.image('save','assets/images/autre tileset/Block_Blue.png')

		this.load.image("star", 'assets/images/Save.png')
		this.load.image("health", 'assets/images/Heal.png')
		this.load.image("fx_blue", 'assets/images/blue.png')
		this.load.image("fx_purple", 'assets/images/sparkle1.png')
		this.load.tilemapTiledJSON('tilemap','assets/tilemaps/tiled.json')
		this.load.image("cursor", 'assets/images/cursor.png')
		this.load.glsl("fond", 'assets/images/marble.glsl.js')
		
	}

	create() {
		
	const cam = this.cameras.main;

    const gui = new GUI();

    const p1 = gui.addFolder('Pointer');
    p1.add(this.input, 'x').listen();
    p1.add(this.input, 'y').listen();
    

    const help = {
        line1: 'Left clic to trace platform Right for erase',
        line2: 'z to dezoom',
        line3: 'Q and D for move Z for jump',
    }

    const f1 = gui.addFolder('Camera');
    f1.add(cam, 'x').listen();
    f1.add(cam, 'y').listen();
    f1.add(cam, 'scrollX').listen();
    f1.add(cam, 'scrollY').listen();
    f1.add(cam, 'zoom', 0.1, 2).step(0.1).listen();
    f1.add(help, 'line1');
    f1.add(help, 'line2');
    f1.add(help, 'line3');
    f1.open();


		
		this.cameras.main.setRoundPixels(true);
		this.scene.launch('ui')
		this.mechanic= new Mechanic(this)
	p1.add(this.mechanic,'trace').listen()
	p1.open();
		
		const map = this.make.tilemap({key: 'tilemap'})
		const tileset = map.addTilesetImage('triangle-imagefinal', 'tiles',64,64)

		const ground = map.createLayer('ground', tileset).setPipeline("Light2D").setDepth(2)
		const mask=this.add.image(0,0,'mask').setOrigin(0,0)
		const groundbg = map.createLayer('groundbg', tileset).setDepth(0)
		
		const light = this.lights.addLight(900, 900, 200).setIntensity(5).setColor(0xB0E9EC);

    this.lights.enable().setAmbientColor(0xCAC5C4);

    this.input.on('pointermove', function (pointer) {

        light.x = pointer.worldX;
        light.y = pointer.worldY;

    });



		
		map.createLayer('obstacles',tileset)

		const {width, height} = this.scale

		const colliderLayer = map.getObjectLayer('collider')
		colliderLayer.objects.forEach(objData=>{
		const{ x = 0 , y = 0 ,name='', width=0,height=0, polygon = [] } = objData
		const arrayY = []
		for(let i=0 ; i<polygon.length;i++){
			// @ts-ignore
			arrayY.push(polygon[i].y)
		}
		const collider = this.add.polygon(x,y,polygon).setOrigin(0,0).setPipeline('Light2D')
		const colliderB=this.matter.add.gameObject(collider,{shape:{type: "fromVerts",verts:polygon, flagInternal:true},isStatic:true,name:name,friction:1})

		const rect =this.add.rectangle(x+collider.getBounds().width*0.5,y+collider.getBounds().height*0.5,collider.getBounds().width,collider.getBounds().height)
		Phaser.Display.Align.In.Center(collider, rect)
		
		
	})
		const objectsLayer = map.getObjectLayer('objects')
		objectsLayer.objects.forEach(objData=>{
			const{ x = 0 , y = 0 , name, width=0,height=0 } = objData
			switch(name)
			{
				case 'playerspawn':
				{
					this.player = this.matter.add.sprite(x,y, 'player').setPipeline('Light2D')
						.setDisplaySize(150,150)
						.setDepth(1)
					this.player.setCircle(80)
					
	
					this.playerController = new PlayerController(this,this.player, this.cursors, this.obstacles)	
					break
				}
				case "snowman":
				{	
					const snowman = this.matter.add.sprite(x, y, 'snowman')
						.setCircle(40)
						// @ts-ignore
						.setFixedRotation()

					this.snowmen.push(new SnowmanController(this, snowman))
					this.obstacles.add('snowman', snowman.body as MatterJS.BodyType)
					break
				}
				case "saves":
				{
					
					const rect=this.matter.add.sprite(x+width*0.5,y+height*0.5,"save",undefined,{
						isStatic:true,
						isSensor:true,
					}).setSize(100,200).setDisplaySize(100,200)


					rect.setData("type","rect")
					this.save.push(new Save(this,rect))
					console.log(this.save)
					
					
					break
				}
				case 'star':
				{
					const star = this.matter.add.sprite(x,y-50,"star",undefined,{
						isStatic:true,
						isSensor:true,
					})
					star.setData("type","star")
					break
				}
				case 'health':
				{
					const health = this.matter.add.sprite(x,y,'health',undefined,{
						isStatic: true,
						isSensor:true
					})
					health.setData('type', 'health')
					health.setData('healthPoints',10)
					break;
				}
				case 'spikes':
				{
					const spike = this.matter.add.rectangle(x+(width*0.5),y+(height*0.5), width, height,{
						isStatic:true,
					})
					this.obstacles.add('spikes', spike)
					break
				}
			}
		})
		const p2 = gui.addFolder('Player');
		p2.add(this.player, 'x').listen();
		p2.add(this.player, 'y').listen();
		const p3 = gui.addFolder('PlayerVelocity');
		p3.add(this.player.body.velocity, 'x').listen();
		p3.add(this.player.body.velocity, 'y').listen();
		p2.open();
		p3.open()
		
		const shader=this.add.shader('fond',0,0,7680,1400).setOrigin(0,0).setDepth(-1)
		const shaderMask=shader.createBitmapMask()
		mask.setMask(shaderMask)
		
		
	}
	
	destroy()
		{
			this.scene.stop('ui')
			this.snowmen.forEach(snowman => snowman.destroy())
		}
	
	update(t: number, dt: number)
		{
			
			this.playerController?.update(dt)
			this.snowmen.forEach(snowman => snowman.update(dt))
		}
	}
	

