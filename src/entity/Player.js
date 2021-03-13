import 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, spriteKey) {
    super(scene, x, y, spriteKey);

    // << INITIALIZE PLAYER ATTRIBUTES HERE >>
    this.scene = scene;
    this.scene.add.existing(this);
    // Add ground to scene and enable physics
    this.scene.physics.world.enable(this);
    //is the player facing left?
    this.facingLeft = false;
  }

    
  // Check which controller button is being pushed and execute movement & animation
  update(cursors, jumpSound) {
    // << INSERT CODE HERE >>
    this.updateMovement(cursors)
    this.updateJump(cursors, jumpSound)
    // On update, check to see if Josh is in the air (see below)
    this.updateInAir()

  }


  updateMovement(cursors) {
    // Move left
    if (cursors.left.isDown) {
      if(!this.facingLeft) {
        this.flipX = !this.flipX
        this.facingLeft = true;
      }
      this.setVelocityX(-360);
      if (this.body.touching.down) {
        this.play('run', true)
      }
    }
    // Move right
    else if (cursors.right.isDown) {
      if(this.facingLeft) {
        this.flipX = !this.flipX
        this.facingLeft = false;
      }
      this.setVelocityX(360);
      //We want to make sure Josh runs only when the cursor is moving him to the right, 
      //and only when his feet are firmly on the ground.
      if (this.body.touching.down) {
        this.play('run', true)
      }
    }
    // Neutral (no movement)
    else {
      this.setVelocityX(0);
      //whenever Johsh is not moving, use the idleUarmed animation
      this.play('idleUnarmed')
      if (!this.armed) {
        this.anims.play('idleUnarmed');
      } else {
        this.anims.play('idleArmed')
      }
    }
  }

  updateInAir(){
    if(!this.body.touching.down) {
      this.play('jump')
    }
  }

  updateJump(cursors, jumpSound) {
    if (cursors.up.isDown && this.body.touching.down) {
      this.setVelocityY(-800);
      jumpSound.play();           // Play our jump sound here
    }
  }


}
