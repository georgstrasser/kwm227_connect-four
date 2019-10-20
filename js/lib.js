// KWM227 - HUE03 - 07.06.2018
// Georg Strasser - S1610456033
// js/lib.js

lib = window.lib || {};

(function () {

      class Ball {

          constructor(left, top, bottom, player, margin, id, ballSize) {

              let $ball = $('<div class="ball '+player+'Player '+id+'"></div>').appendTo($('.playingField'));
              $ball.css('left', left-margin);
              $ball.css('top', top-margin);
              $ball.css('width', ballSize);
              $ball.css('height', ballSize);

              let yMax = bottom;
              let y = top;
              let v = 0;
              let a = 1.5;

              const intervalId = setInterval(() => {
                  v += a;
                  y += v;

                  if (y >= yMax) {
                      if (Math.abs(v) < 1) {
                          clearInterval(intervalId);
                      }
                      v *= -.4; //Bounce intensity
                      y = yMax;
                    }
                  $ball.css('top', y);
              }, 20)

          }

      }

    lib.Ball = Ball;

}());