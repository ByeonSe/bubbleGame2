import Player from '../entity/Player'
import Phaser from "phaser";
import Ground from '../entity/Ground'
import Enemy from '../entity/Enemy'
import Gun from '../entity/Gun'
import Laser from '../entity/Laser'
import Stars from '../entity/Stars'
import ScoreLabel1 from '../ui/ScoreLabel'

export default class FgScene extends Phaser.Scene {
  constructor() {
    super('FgScene');

    //bind callback functions to the object context
    this.collectGun = this.collectGun.bind(this)
    this.fireLaser = this.fireLaser.bind(this);
    this.hit = this.hit.bind(this);
    this.scoreLabel1 = undefined;
    this.gameOver = false
  }

  preload() {
    // Preload Sprites
    // << LOAD SPRITES HERE >>

    //SPREITES
    this.load.spritesheet('serena','assets/spriteSheets/serena1.png', {
      frameWidth: 60,
      frameHeight: 110,
    });

    this.load.spritesheet('serenaRun', 'assets/spriteSheets/serena-Run.png', {
      frameWidth: 55,
      frameHeight: 110,
    });

    this.load.spritesheet('serenaJump','assets/spriteSheets/serena-jump.png', {
      frameWidth: 60,
      frameHeight: 117,
    });

    this.load.image('ground', 'assets/sprites/ground.png');

    this.load.image('enemy', 'assets/sprites/brandon.png');

    this.load.image('gun', 'assets/sprites/gun.png')

    this.load.image('laserBolt', 'assets/sprites/heartLaser.png');

    this.load.image('stars', 'assets/sprites/star.png')

    //sounds

    this.load.audio('jump', 'assets/audio/jump.wav');
    this.load.audio('laser', 'assets/audio/laser.wav');
    this.load.audio('scream', 'assets/audio/scream.wav');
}

    // Preload Sounds
    // << LOAD SOUNDS HERE >>
  createGround(x, y) {
    this.groundGroup.create(x, y, 'ground');
  }

  createStars() {
        //create Star
      const stars = this.physics.add.group({
          key:'stars',
          repeat: 11,
          setXY:  { x: 12, y: 0, stepX: 70 }
      })
      stars.children.iterate*((child) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
      })
      
      return stars
  }

  // We're assigning this new animation the key 'run', to be used elsewhere.
  // The animation pills from the serena spritesheet, and uses frames 17 - 20
  // We're setting the framerate to 10, but try experimenting with different values!
  // repeat: -1 indicates that we want the animation to repeat forever (or until we tell it to stop).
  createAnimations() {

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('serenaRun', { start: 2, end: 3 }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: 'jump',
      frames: [{ key: 'serenaJump', frame: 7}],
      frameRate:20,
    });
    this.anims.create({
      key: 'idleUnarmed',
      frames: [{ key: 'serena', frame:2}],
      frameRate: 10,
    });

    //define the single frame in the tilesheet that represents the player idle and holding a gun 
    this.anims.create({
      key: 'idleArmed',
      frames: [{key:'serena', frame: 1}],
      frameRate:10,
    });

  }



  create() {
    // Create width and heights
    const width = game.config.width;
    const height = game.config.height;
    const totalWidth = width * 20;

    // << CREATE GAME ENTITIES HERE >>
    this.player = new Player(this, 20, 400, 'serena').setScale(1);
    this.enemy = new Enemy (this, 600, 400, 'enemy').setScale(0.25)
    this.groundGroup = this.physics.add.staticGroup({ classType: Ground });
    this.gun = new Gun (this, 300, 400, 'gun').setScale(0.25)
    const stars = this.createStars()
    this.scoreLabel = this.createScoreLavel(16, 16, 0)


    this.createGround(160, 540);
    this.createGround(650, 540);
    this.createGround(400, 540);

    // Assign the cursors
    this.cursors = this.input.keyboard.createCursorKeys();
    //create animation
    this.createAnimations()


    // We're going to create a group for our lasers
    // We're going to create a group for our lasers
    this.lasers = this.physics.add.group({
      classType: Laser,
      runChildUpdate: true,
      allowGravity: false,   
      // Important! When an obj is added to a group, it will inherit
      // the group's attributes. So if this group's gravity is enabled,
      // the individual lasers will also have gravity enabled when they're
      // added to this group
      maxSize: 40
    });

    //whenthe player collieds with the gun
    this.physics.add.overlap(
      this.player,
      this.gun,
      this.collectGun,
      null,
      this

      // Our callback function that will handle the collision logic
      // processCallback. Can specify a function that has custom collision
      // conditions. We won't be using this so you can ignore it.
      // The context of 'this' for our callback. Since we're binding
      // our callback, it doesn't really matter.
    )

    //when the laser collides with the enemy
    this.physics.add.overlap(
      this.lasers,
      this.enemy,
      this.hit,
      null,
      this
    );

    // when the stars collides with the player

    this.physics.add.overlap(
      this.player, 
      stars, 
      this.collectStar,
      null,
      this
    );


    // Create collisions for all entities
    // << CREATE COLLISIONS HERE >>
    //With a single call to collider() we've now enabled our 
    //player to physically collide with the ground, preventing him from falling through. 
    //We can customize what happens when two game objects collide, 
    //but for now, the default behavior is fine.
    this.physics.add.collider(this.player, this.groundGroup)
    this.physics.add.collider(this.enemy, this.groundGroup)
    this.physics.add.collider(this.player, this.enemy);
    this.physics.add.collider(this.gun, this.groundGroup)
    this.physics.add.collider(stars, this.groundGroup)
    
      //CAMER
    this.myCam = this.cameras.main;
    this.myCam.setBounds(0, 0, width * 20, height);
    this.cameras.main.startFollow(this.player);

    // Create sounds
    // << CREATE SOUNDS HERE >>
    this.jumpSound = this.sound.add('jump');
    this.laserSound = this.sound.add('laser');
    this.laserSound.volume = 0.5
    this.screamSound = this.sound.add('scream')

   
  }

  collectGun(player, gun) {
    //make the gun disapperar from the grou,d
    gun.disableBody(true, true)
    //set the paleyr to 'armed'
    this.player.armed = true
  }
  // time: total time elapsed (ms)
  // delta: time elapsed (ms) since last update() call. 16.666 ms @ 60fps

  collectStar(player, stars) {
    stars.disableBody(true, true)
    this.scoreLabel.add(10)
  }

  createScoreLavel(x, y, score) {
    const style = { fontSize: '32px', fill: '#000' }
		const label = new ScoreLabel1(this, x, y, score, style)
    this.add.existing(label)
    return label
  }
  
  update(time, delta) {
    // << DO UPDATE LOGIC HERE >>
    this.player.update(this.cursors, this.jumpSound); // Add a parameter for the jumpSound
    this.gun.update(
    time,
    this.player,
    this.cursors,
    this.fireLaser,  // Callback fn for creating lasers
    this.laserSound
    );
    this.enemy.update(this.screamSound)
  }


  // Callback fn. We implement it here b/c our scene has references to the lasers group and the player
  fireLaser(x, y, left) {
    // These are the offsets from the player's position that make it look like
    // the laser starts from the gun in the player's hand
    const offsetX = 56;
    const offsetY = 14;
    const laserX = this.player.x + (this.player.facingLeft ? -offsetX : offsetX);
    const laserY = this.player.y + offsetY;

    //get the firest avaialble laser object that has been set to inactive
    let laser = this.lasers.getFirstDead();
    //check if we can reuse an inactive laser in our pool of lasers
    if (!laser) {
   // Create a laser bullet and scale the sprite down
   laser = new Laser(
      this,
      laserX,
      laserY,
      'laserBolt',
      this.player.facingLeft
    ).setScale(0.05);
      // Add our newly created to the group
      this.lasers.add(laser);
  }
     // Reset this laser to be used for the shot
     laser.reset(laserX, laserY, this.player.facingLeft);
  }


  // make the laser inactive and insivible when it hits the enemy
  hit(enemy, laser) {
    laser.setActive(false);
    laser.setVisible(false);
  }
}