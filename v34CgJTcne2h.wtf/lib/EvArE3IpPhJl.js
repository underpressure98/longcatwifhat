// vim: set ts=2 sw=2:
"use strict";

class LongCat {
  constructor(el, physics) {
    this.el = el;
    this.physics = physics;

    this.head_t = 0;
    this.head_el = el.querySelector('.longcat__head');
    this.head_base_transform = 'translateY(-100%)';
    this.mouth_el = el.querySelector('.longcat__mouth');
    this.mouth_open = 0;

    this.hand_t = 0;
    this.hand_right_el = el.querySelector('.longcat__hand-right');
    this.hand_right_base_transform = 'translateY(-100%)';

    this.hand_left_el = el.querySelector('.longcat__hand-left');
    this.hand_left_base_transform = 'translateY(-100%)';
  }

  update(dt) {
    this.el.style.transform = `translateY(-${this.physics.y_longcat_mm}mm)`;

    // Make the head wiggle, depending on velocity, by computing a head's own
    // "time" that increases using absolute value of velocity.
    this.head_t += dt*Math.abs(this.physics.vy)*10;
    const head_deg = 15*Math.sin(this.head_t);
    const head_x = Math.cos(this.head_t);
    const head_tx = ` translateX(${head_x}%) rotateZ(${head_deg}deg)`;
    this.head_el.style.transform = this.head_base_transform + head_tx;
    this.mouth_el.style.transform = this.head_base_transform + head_tx + `translateY(${this.mouth_open}%) translateX(${this.mouth_open/4}%)`;

    // Also make the arms rotate, using the same algorithm as the head wiggle.
    // But we want them to rotate the other way around going back, so no abs here.
    this.hand_t += dt*this.physics.vy*10;
    if (this.physics.py <= 0) { this.hand_t = 0; }  // Reset hands on floor.
    const hand_right_deg = -360*this.hand_t;
    this.hand_right_el.style.transform = this.hand_right_base_transform + ` rotateZ(${hand_right_deg}deg)`;

    const hand_left_deg = -360*this.hand_t;
    this.hand_left_el.style.transform = this.hand_left_base_transform + ` rotateZ(${hand_left_deg}deg)`;

    // play various sounds as we pass milestones.
    if (this.physics.just_passed(7.8) === 1) {
      this.meow();
    } else if (this.physics.just_passed(10.2) === 1) {
      this.slowmeow();
    }
    let nyan = this.physics.just_passed(215);
    if (nyan == 1) {
      this.startnyan();
    } else if (nyan == -1) {
      this.stopnyan();
    }
  }

  preload_fkn_ios() {
    // See http://www.ibm.com/developerworks/library/wa-ioshtml5/
    // Ctrl+F "Loading Audio"
    document.getElementById('meow1').load();
    document.getElementById('slowmeow').load();
    document.getElementById('nyansong').load();
  }

  meow() {
    this.mouth_open = 5;
    document.getElementById('meow1').play();
    // Not using .then after play() because in current FF it returns undefined.
    window.setTimeout(() => { this.mouth_open = 0; }, 1100);
  }
  slowmeow() {
    this.mouth_open = 5;
    document.getElementById('slowmeow').play();
    window.setTimeout(() => { this.mouth_open = 0; }, 3300);
  }
  startnyan() {
    document.getElementById('nyansong').play();

    // Open/close the mouth every second!
    // ( || works because handle is defined to be > 0)
    this.nyan_delay = this.nyan_delay || window.setTimeout(() => {
      this.nyan_timer = this.nyan_timer || window.setInterval(() => {
        this.mouth_open = (this.mouth_open + 5) % 10;
      }, 200);
    }, 3500);
  }
  stopnyan() {
    let el = document.getElementById('nyansong');
    el.pause();
    el.currentTime = 0;  // fastSeek not supported by major browsers yet.

    // Stop moving the mouth!
    if (this.nyan_delay !== undefined) {
      this.nyan_delay = window.clearTimeout(this.nyan_delay);
    }
    if (this.nyan_timer !== undefined) {
      this.nyan_timer = window.clearInterval(this.nyan_timer);
    }
    this.mouth_open = 0;
  }
}
