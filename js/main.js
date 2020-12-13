const canvas = document.querySelector('canvas');

const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreElem = document.querySelector("#scoreElem");
const startGameButton = document.querySelector("#startGameButton");
const scoreModal = document.querySelector("#scoreModal");
const modalScoreBoard = document.querySelector("#modalScoreBoard");

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}


class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}


class Enemies {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}


const friction = 0.97;

class Particles {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();    
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}



const canvasCenterX = canvas.width / 2;
const canvasCenterY = canvas.height / 2;

let player = new Player(canvasCenterX, canvasCenterY, 10, 'white');
let projectiles = [];
let enemiesArray = [];
let particlesArray = [];
let animateID;
let scoreBoard = 0;

function init () {
    player = new Player(canvasCenterX, canvasCenterY, 10, 'white');
    projectiles = [];
    enemiesArray = [];
    particlesArray = [];
    scoreBoard = 0;
    modalScoreBoard.innerHTML = scoreBoard;
    scoreElem.innerHTML = scoreBoard;
}
function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 6) + 6;
        let x;
        let y;

        if (Math.random() > 0.5) {
            x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(canvasCenterY - y, canvasCenterX - x);
        const velocityObj = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemiesArray.push(new Enemies(x, y, radius, color, velocityObj));
    }, 1000);
}
function animation() {
    animateID = requestAnimationFrame(animation);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particlesArray.forEach((particle, index) => {

        if(particle.alpha <= 0 ) {
            particlesArray.splice(index, 1);
        }else {
            particle.update();
        }
        
    });

    projectiles.forEach((prj, index) => {
        prj.update();

        // remove from screen
        if (prj.x - prj.radius < 0 || prj.x + prj.radius > canvas.width || prj.y + prj.radius < 0 || prj.y - prj.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0)
        }
    });
    enemiesArray.forEach((enemy, index) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        //End Game
        if (dist - enemy.radius - player.radius < 1) {
            setTimeout(() => {
                cancelAnimationFrame(animateID);
                scoreModal.style.display = "flex";
                modalScoreBoard.innerHTML = scoreBoard;
            }, 0)
        }

        projectiles.forEach((prj, prjIndex) => {
            const dist = Math.hypot(prj.x - enemy.x, prj.y - enemy.y);
            // collision detection
            if (dist - enemy.radius - prj.radius < 1) {

                // create partciles 
                for (let index = 0; index < enemy.radius * 2; index++) {
                    particlesArray.push(new Particles(
                        prj.x, prj.y, 
                        Math.random() * 2, 
                        enemy.color, { 
                        x: (Math.random() - 0.5) * (Math.random() * 8), 
                        y: (Math.random() - 0.5) * (Math.random() * 8)
                    }));
                    
                }
                if (enemy.radius - 10 > 10) {

                    //score board 
                    scoreBoard += 100;
                    scoreElem.innerHTML = scoreBoard;

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });
                    enemy.radius -= 10;
                    setTimeout(() => {
                        projectiles.splice(prjIndex, 1);
                    }, 0)
                } else {
                    //score board 
                    scoreBoard += 250;
                    scoreElem.innerHTML = scoreBoard;

                    setTimeout(() => {
                        enemiesArray.splice(index, 1);
                        projectiles.splice(prjIndex, 1);
                    }, 0)
                }

            }
        });
    })
}

addEventListener("click", (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const angle = Math.atan2(mouseY - canvasCenterY, mouseX - canvasCenterX);
    const velocityObj = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }
    const projectile = new Projectile(canvasCenterX, canvasCenterY, 5, "white", velocityObj);

    projectiles.push(projectile);

});

startGameButton.addEventListener("click", () => {
    init();
    animation();
    spawnEnemies();
    scoreModal.style.display = "none";
})