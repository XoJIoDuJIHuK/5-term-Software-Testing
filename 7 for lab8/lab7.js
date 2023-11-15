document.addEventListener("DOMContentLoaded", start);

function sleep(timeToSleep) {
    const initialDate = Date.now();
    let deltaTime = null;
    do {
      deltaTime = Date.now() - initialDate;
    } while (deltaTime < timeToSleep);
  }  

function start()
{
    const borderForCursor = document.querySelector(".redLine")
    let cursorOyMinValue = +getComputedStyle(borderForCursor).top + +getComputedStyle(borderForCursor).height;
    let ballElement = document.querySelector(".ball");

    let fromX, fromY, toX, toY;

    let timing = function(timeFraction) {
        return Math.pow(timeFraction, 1 / 8);
    }

    let draw = function(progress) {
        ballElement.style.top = Math.round((toY - fromY) * progress + fromY) + 'px';
        ballElement.style.left = Math.round((toX - fromX) * progress + fromX) + 'px';
    }

    ball.onmousedown = function(event) {

        ballPressed = true;
        let shiftX = event.clientX - ball.getBoundingClientRect().left;
        let shiftY = event.clientY - ball.getBoundingClientRect().top;

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }
    
        function moveAt(pageX, pageY) {
            ball.style.left = pageX - shiftX + 'px';
            if (pageY - shiftY >= +cursorOyMinValue) {
                ball.style.top = pageY - shiftY + 'px';
            }
            else {
                ball.style.top = cursorOyMinValue + 'px';
            }
        }
      
        document.addEventListener('mousemove', onMouseMove);
      
        ball.style.position = 'absolute';
        ball.style.zIndex = 10000;
      
        moveAt(event.pageX, event.pageY);

        ball.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            ball.onmouseup = null;
            toX = parseFloat(getComputedStyle(borderForCursor).width) - 
                  parseFloat(ball.style.left);
            toY = redLineOy * 2 - parseFloat(ball.style.top);
            fromX = parseFloat(ball.style.left);
            fromY = parseFloat(ball.style.top);

            function animate({timing, draw, duration}) {

                let startTime = performance.now();
              
                requestAnimationFrame(function animate(currentTime) {
                  // timeFraction изменяется от 0 до 1
                  let timeFraction = (currentTime - startTime) / duration;
                  if (timeFraction > 1) {
                    timeFraction = 1;
                  }
              
                  let progress = timing(timeFraction);
              
                  draw(progress);
              
                  if (timeFraction < 1) {
                    requestAnimationFrame(animate);
                  }
              
                });
            }
            animate({
                timing: timing,
                draw: draw,
                duration: 1000
            });
        };
    };
      
    ball.ondragstart = function() {
        return false;
    };
}