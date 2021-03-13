import 'phaser'

export default class Gun extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, spriteKey) {
        super(scene, x, y, spriteKey)

        this.scene = scene;
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);

        //set the firing delay(ms)
        this.fireDelay = 100;
        //keep track of when the gun was last fired
        this.lastFired = 0
    }
    // Check if the shoot button is pressed and how long its been since we last fired
    update(time, player, cursors, fireLaserFn, laserSound) {
        if (cursors.space.isDown && time > this.lastFired) {
            if(player.armed) {
                laserSound.play();
                // We'll implement this function in FgScene
                fireLaserFn();
                this.lastFired = time + this.fireDelay
            }
    }
  }
}