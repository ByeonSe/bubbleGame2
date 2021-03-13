import 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, spriteKey) {
        super(scene, x, y, spriteKey)
        //store reference of scene passed to constructor 
        this.scene = scene;
        //apply physics
        this.scene.physics.world.enable(this)
        this.scene.add.existing(this)

        //turn him around to face player
        this.flipX = !this.flipX
    }

    update(screamSound) {
        if(this.y > 600 && !this.playedSound) {
            this.playedSound = true;
            screamSound.play()
        }
    }

}