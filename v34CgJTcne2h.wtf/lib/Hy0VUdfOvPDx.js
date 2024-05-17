// vim: set ts=2 sw=2:
"use strict";

let preloader = document.querySelector('.preloader');
let preloaderText = preloader.querySelector('.preloader__text');
let the_physics = new Physics();
let the_longcat = new LongCat(document.querySelector('.longcat'), the_physics);
let sections = setupSections();

function setupSections() {
  const allSections = document.querySelectorAll('.section');
  let sections = [];

  sections[0] = new WallSection(allSections[0], the_physics);
  sections[1] = new EarthSection(allSections[1], the_physics);
  sections[2] = new Section(allSections[2], the_physics);  // street
  sections[3] = new BuildingsSection(allSections[3], the_physics);
  sections[4] = new Section(allSections[4], the_physics); // clouds
  sections[5] = new Section(allSections[5], the_physics); // aerspace one
  sections[6] = new InfiniteStartSection(allSections[6], the_physics); // infinite start

  return sections;
}

window.requestAnimationFrame = window.requestAnimationFrame
                            || window.mozRequestAnimationFrame
                            || window.webkitRequestAnimationFrame
                            || window.msRequestAnimationFrame
                            || function(cb) { window.setTimeout(cb, 1000/60); };

const score_el = document.querySelector('.score__number');
const highs_el = document.querySelector('.score__number--high');

// Rather use window.performance if it's available.
// It has sub-millisecond precision, while Date.now only has milliseconds.
const rtc = window.performance || Date;
let t0 = rtc.now();

function mainloop() {
  let t = rtc.now();
  let dt = 0.001*(t - t0);  // from milliseconds to seconds

  // When the tab gets hidden, this animate loop is not called, which is good
  // as it pauses the game. But when the tab gets visible again, the dt is huge:
  // as large as the tab was hidden. We don't want this, as it undoes the pause.
  // so we only update on small dt.
  if (dt < 0.5) {
    dt = the_physics.update(dt);
    the_longcat.update(dt);

    sections.forEach(section => {
      section.update(dt);
    });

    // Update the titlebar according to the score.
    // Only update on change though, to avoid flickering on iOS.
    const title = `$UPCAT is lo${'o'.repeat(the_physics.score)}ng!`;
    if (document.title != title) {
      document.title = title;
    }

    // Update the score itself and the high-score.
    score_el.innerHTML = the_physics.score.toFixed(1);
    highs_el.innerHTML = the_physics.highscore.toFixed(1);
  }

  // For the next timestep.
  t0 = t;
  window.requestAnimationFrame(mainloop);
}
window.requestAnimationFrame(mainloop);


function raise_longcat(ev) {
  // remove preloader
  if(preloader) {
    // NOTE: On iOS devices at least, we may only play a sound as response
    // to a user event, so we need to do all of them here!
    the_longcat.preload_fkn_ios();
    document.body.removeChild(preloader);
    preloader = false;
  }

  // Avoid jump on these elements (share buttons)
  if (ev.target.classList.contains("button")) {
    return
  }

  // Avoid stuff like drag/drop selection etc.
  ev.preventDefault();

  // Meow when we get starteeeed!
  if (the_physics.score == 0) {
      the_longcat.meow();
  }

  the_physics.speedup();
}

function init() {
  // preloader to instructions
  preloader.classList.add('preloader--loaded');
  preloaderText.classList.add('preloader__text--loaded');
  preloaderText.innerHTML = 'click or tap as fast as you can !!!!';

  // A click raises the longcat!
  // Using mousedown event here because otherwise we'd allow drag-selection.
  window.addEventListener('mousedown', raise_longcat);
  // Using the touchend event because many things aren't permitted during start,
  // and because touch_click combos are complicated (http://stackoverflow.com/q/14486804).
  window.addEventListener('touchend', raise_longcat);

  function sharetxt() {
    const hs = the_physics.highscore, ht = the_physics.highscore_time;
    return `Beat my highscore of ${hs.toFixed(2)}km in ${ht.toFixed(2)}s!`;
  }

  const shareurl = encodeURIComponent("http://v34CgJTcne2h.wtf");

  // Tweet score.
  document.querySelector('.tweet').addEventListener('click', ev => {
    ev.preventDefault();
    window.open(
      `http://twitter.com/intent/tweet?`
      + `text=${sharetxt()}`
      + `&url=${shareurl}`
      + `&hashtags=longcat,longcatwtf`
      , '_blank'
    );
  });

  // Share score on fb.
  // NOTE: It's not possible to pre-fill the message content anymore, unless
  // the user first authorized the app to write posts on FB itself.
  // See http://stackoverflow.com/a/5023658
  document.querySelector('.fb').addEventListener('click', ev => {
    ev.preventDefault();
    window.open(
      `https://www.facebook.com/dialog/feed?`
      + `app_id=223627144756559`
      + `&link=${shareurl}`
      + `&redirect_uri=${shareurl}`
      + `&display=popup`
      + `&caption=Longcat is loooong!`
      + `&description=%23longcat %23longcatwtf`
      + `&picture=http://v34CgJTcne2h.wtf/assets/img/logo.jpg`
      + `&message=${sharetxt()}`  // This is the one that isn't supported anymore.
      + `&title=${sharetxt()}`  // So we put the score into the title instead.
      , '_blank'
    );
  });
}

window.onload = function() {
  init();
};
