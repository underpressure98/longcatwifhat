// vim: set ts=2 sw=2:
"use strict";

function clip(x, min, max) {
  if (max !== undefined) {
    x = Math.min(x, max);
  }
  return Math.max(x, min);
}


function linear(x, t0, t1, v0, v1) {
  const xt = (x - t0)/(t1 - t0);
  return v0 + xt*(v1 - v0);
}


// For real, see https://www.w3.org/TR/css3-values/#reference-pixel
const CSS_PIXEL_TO_MM = 0.26;


class Physics {
  constructor() {
    this.py = 0;  // position
    this.vy = 0;  // velocity (speed)
    this.ay = 0;  // acceleration

    this.g = 1;  // downwards acceleration (G-force)
    this.v_max = 1;
    this.contact_time = 0;

    // mid_screen is in millimeters, for now.
    this.mid_screen = window.innerHeight/2*CSS_PIXEL_TO_MM;

    // To support the utility function of "just passed".
    this.last_score = 0;

    // Time elapsed since first jump from floor.
    this.t = 0;

    // Highscore functionality.
    this.high_score = this.high_time = 0;
  }

  update(dt) {
    // dt = delta time (elapsed time since last update)

    this.last_score = this.score;

    // Slow-down.
    const slowstart0 = 8, slowstart1 = 10;
    const slowend0 = 12, slowend1 = 14;
    const slowdown = 0.1;
    if (slowstart0 < this.score && this.score < slowend1) {
      if (this.score <= slowstart1) {
        dt = dt * linear(this.score, slowstart0, slowstart1, 1, slowdown);
      } else if (this.score <= slowend0) {
        dt = dt * slowdown;
      } else if (this.score <= slowend1) {
        dt = dt * linear(this.score, slowend0, slowend1, slowdown, 1);
      }
    }

    // Update velocity according to acceleration.
    this.vy += (this.ay - this.g) * dt;

    // Limit the speed to v_max!
    this.vy = clip(this.vy, -this.v_max, this.v_max)

    // Update position according to velocity.
    this.py += this.vy * dt;

    // Only touch for some time.
    this.contact_time -= dt;
    if (this.contact_time < 0) {
      this.contact_time = this.ay = 0;
    }

    // Stop when we hit the floor.
    if (this.py < 0) {
      this.py = this.vy = this.ay = 0;
    }

    // Update the highscore and the time to get there.
    this.t += dt;
    if (this.score > this.high_score) {
      this.high_score = this.score;
      this.high_time = this.t;
    }

    return dt;
  }

  speedup() {
    // If we're on the floor, this is the first jump, start counting the time NOW.
    if (this.py == 0) {
      this.t = 0;
    }

    // Flappy-birds like physics.
    this.vy = 0.4;
  }

  just_passed(score) {
    // Returns 1 if just passed given score from below,
    // -1 if just passed from above, and 0 if not just passed.
    if (this.last_score < score && score < this.score) {
      return 1;
    } else if (this.score < score && score < this.last_score) {
      return -1;
    } else {
      return 0;
    }
  }

  get y_longcat_mm() {
    return clip(this.py*1000, 0, this.mid_screen);
  }

  get y_bg_mm() {
    return clip(this.py*1000 - this.mid_screen, 0);
  }

  get score() {
    return this.py*10;
  }

  get highscore() {
    return this.high_score;
  }

  get highscore_time() {
    return this.high_time;
  }
}
