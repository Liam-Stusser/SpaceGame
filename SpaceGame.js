// HTML element variables
const player = document.getElementById("player");
const gameScreen = document.getElementById("game-screen");
const scoreText = document.getElementById("score");
const healthDisplay = document.getElementById("healthDisplay");
let enemiesArray = [];
let powerUpArray = [];
let playerScore = 0;
let isOverwhelmed = false;
let isPowerUpSpawning = false;
let isBossActive = false;
let horde = 0;

class Player {
    constructor(element, health, damage) {
        this.element = element;
        this.health = health;
        this.damage = damage;
        this.ammoCount = 1;
        this.keys = {};
        this.step = 1.9;
        this.canShoot = true;
        this.x = 525; 
        this.y = 0; 
        this.alive = true;
        this.overShieldHealth = 20;
        this.isOverShieldActive = false;
        this.isRapidFireActive = false;
        this.initMovement();
        this.initShooting();
        this.initMissile();
        this.startMovementLoop();
    }

    activateOverShield() {
        this.overShieldHealth = 20; 
        this.isOverShieldActive = true;
        healthDisplay.classList.add('neon-green'); 
        player.classList.add('overshield-glow')
    }

    deactivateOverShield() {
        this.isOverShieldActive = false;
        healthDisplay.classList.remove('neon-green'); 
        player.classList.remove('overshield-glow')
    }

    activateSpeedBoost(){
        this.step = 2.7;
        player.classList.add('speed-glow');
        setTimeout(() => {
            this.step = 1.7; 
            player.classList.remove('speed-glow');
        }, 45000); 
    }

    activateRapidFire(){
    if (!this.isRapidFireActive){

        this.isRapidFireActive = true;

        const handleRapidFire = (event) => {
            if (event.key === ' ') {
                for (let i = 0; i < 2; i++) {
                    setTimeout(() => {
                        this.shootLaser();
                    }, i * 100); 
                }
            }
        };
    
        document.addEventListener('keyup', handleRapidFire);
    
        setTimeout(() => {
            document.removeEventListener('keyup', handleRapidFire);
            this.isRapidFireActive = false;
        }, 25000); 
     }
    };

    reload(){
        this.ammoCount = 3;
    }

    takeDamage(amount) {
        if(!this.alive) return;

        if (this.isOverShieldActive) {
            this.overShieldHealth -= amount;
            if (this.overShieldHealth <= 0) {
                this.deactivateOverShield(); 
                this.health += this.overShieldHealth; 
                this.overShieldHealth = 0;
            }
        } else {
            this.health -= amount;
        }

        if (this.health <= 0) {
            this.element.style.backgroundImage = "url('Explosion.png')";
            scoreText.innerText = `Score: You are dead`;
            setTimeout(() => {
                this.remove(); 
            }, 500);
        }
    }

    remove() {
        this.alive = false;
        this.element.style.display = 'none';  
        this.stopMovementAndShooting();  
    }

    stopMovementAndShooting() {
        // Unbind the key listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    initMovement() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
    }

    startMovementLoop() {
        const update = () => {
            this.movePlayer();
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    movePlayer() {
        const gameBounds = gameScreen.getBoundingClientRect();
        
        let moveX = 0;
        let moveY = 0;

        if (this.keys['w']) {
            moveY -= this.step;
        }
        if (this.keys['s']) {
            moveY += this.step;
        }
        if (this.keys['a']) {
            moveX -= this.step;
        }
        if (this.keys['d']) {
            moveX += this.step;
        }

        this.x += moveX;
        this.y += moveY;

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;

        // Boundaries check
        const playerRect = this.element.getBoundingClientRect();
        const playerTop = playerRect.top - gameBounds.top;
        const playerLeft = playerRect.left - gameBounds.left;
        const playerBottom = playerRect.bottom - gameBounds.top;
        const playerRight = playerRect.right - gameBounds.left;
        const maxY = gameBounds.height * 0.35;

        if (playerTop < 0) this.y = this.y - playerTop; 
        if (playerLeft < 0) this.x = this.x - playerLeft; 
        if (playerBottom > gameBounds.height) this.y = this.y - (playerBottom - gameBounds.height); 
        if (playerRight > gameBounds.width) this.x = this.x - (playerRight - gameBounds.width); 
        if (this.y < -playerRect.top + maxY) {
            this.y = -playerRect.top + maxY;
        }
    }

    initShooting() {
        document.addEventListener('keydown', (event) => {
            if (event.key === ' ' && this.canShoot) {
                this.shootLaser();
                this.canShoot = false;
            }
        });

        document.addEventListener('keyup', (event) => {
            if (event.key === ' ') {
                this.canShoot = true;
            }
        });
    }

    initMissile(){
        document.addEventListener('keydown', (event) =>{
            if(event.key === 'q' && this.canShoot){
                this.shootMissile();
                this.canShoot = false;
            }
        });

        document.addEventListener('keyup', (event)=> {
            if(event.key === 'q'){
                this.canShoot = true;
            }
        });
    }

    shootLaser() {
        const laserLeft = document.createElement('div');
        const laserRight = document.createElement('div');
    
        laserLeft.classList.add('laser');
        laserRight.classList.add('laser');

        if(this.isRapidFireActive){
        laserLeft.classList.add('rapid-fire');
        laserRight.classList.add('rapid-fire');
        }
    
        // Get player's position and size
        const playerRect = this.element.getBoundingClientRect();
        const gameRect = gameScreen.getBoundingClientRect();
    
        // Calculate positions for lasers
        const laserOffset = 20;
        const laserHeight = 27;
    
        // Position laser on the left side of the player
        laserLeft.style.position = 'absolute';
        laserLeft.style.left = (playerRect.left - gameRect.left + (playerRect.width / 2) - laserOffset) + 'px';
        laserLeft.style.top = (playerRect.top - gameRect.top - laserHeight) + 'px'; // Position above the player
    
        // Position laser on the right side of the player
        laserRight.style.position = 'absolute';
        laserRight.style.left = (playerRect.right - gameRect.left - laserOffset + 15) + 'px';
        laserRight.style.top = (playerRect.top - gameRect.top - laserHeight) + 'px'; 
        gameScreen.appendChild(laserLeft);
        gameScreen.appendChild(laserRight);
    
        this.moveLaser(laserLeft);
        this.moveLaser(laserRight);
    }

    shootMissile(){
        if(this.ammoCount <= 0){
            return;
        }
        else{
        this.ammoCount--;
        const missile = document.createElement('div');
        missile.classList.add("missile")

        const playerRect = this.element.getBoundingClientRect();
        const gameRect = gameScreen.getBoundingClientRect();

        missile.style.position = 'absolute'
        missile.style.left = playerRect.left - gameRect.left + (playerRect.width / 2) - 4 + 'px';
        missile.style.top = (playerRect.top - gameRect.top - 8) + 'px';

        gameScreen.appendChild(missile);
        this.moveMissile(missile);
        }
    }

    checkCollision(projectile, enemiesArray = [], powerUpArray = []) {
        if(!projectile)return null;
        const projectileRect = projectile.getBoundingClientRect();
        for (const enemy of enemiesArray) {
            const enemyRect = enemy.element.getBoundingClientRect();  // Get rect of enemy's DOM element
            if (rectsIntersect(projectileRect, enemyRect)) {
                return enemy;  // Return the Enemy object, not the element
            }
        }
        for (const powerUp of powerUpArray) {
            const powerUpRect = powerUp.element.getBoundingClientRect();
            if(rectsIntersect(projectileRect, powerUpRect)){
                return powerUp;
            }
        }
        return null;  // No collision detected
    }
    
    moveLaser(laser) {
        const laserInterval = setInterval(() => {
            const currentTop = parseFloat(laser.style.top);
            laser.style.top = currentTop - 8 + 'px';
    
            // Check for collisions with the Enemy objects
            const hitEnemy = this.checkCollision(laser, enemiesArray);
            const hitPowerUp = this.checkCollision(laser, powerUpArray);
    
            if (hitEnemy) {
                hitEnemy.takeDamage(this.damage);  
                laser.remove();
                clearInterval(laserInterval);
            } else if (currentTop <= 0) {
                laser.remove();
                clearInterval(laserInterval);
            }
            else if(hitPowerUp) {
                hitPowerUp.takeDamage(this.damage);
                laser.remove();
                clearInterval(laserInterval);
            }
        }, 10);
    }

    moveMissile(missile){
        const missileInterval = setInterval(() => {
            const currentTop = parseFloat(missile.style.top);
            missile.style.top = currentTop - 8 + 'px';
    
            // Check for collisions with the Enemy objects
            const hitEnemy = this.checkCollision(missile, enemiesArray);
            const hitPowerUp = this.checkCollision(missile, powerUpArray);
    
            if (hitEnemy) {
                missileExplosion(missile);  
                missile.remove();
                clearInterval(missileInterval);
            } else if (currentTop <= 0) {
                missile.remove();
                clearInterval(missileInterval);
            }
            else if(hitPowerUp) {
                missileExplosion(missile);
                missile.remove();
                clearInterval(missileInterval);
            }
        }, 10);
    }
}

class Enemy {
    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('enemy');
        this.health = 20;
        this.damage = 5;
        this.speed = Math.random() * (0.6 - 0.3)+ 0.3;
        this.sideSpeed = Math.random() * (0.5 - 0.1) + 0.1; 
        this.increment = 0;
        this.maxIncrement = Math.random() * (600 - 350) + 350; 
        this.ismovingRight = true;
        this.moving = true;
        this.enemySize = 32;
        gameScreen.appendChild(this.element);

        // Set enemy position
        this.setPosition();
        this.updatePosition();
        this.startShooting();
    }

    setPosition() {
        const gameRect = gameScreen.getBoundingClientRect();
        this.xPosition =  Math.random() * (gameRect.width - this.enemySize); 
        this.yPosition = -this.enemySize; 
    }

    updatePosition() {
        this.element.style.transform = `translate(${this.xPosition}px, ${this.yPosition}px)`;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.element.style.backgroundImage = "url('Explosion.png')";
            clearInterval(this.shootInterval);
            this.moving = false;
            playerScore += 10;
            scoreText.innerText = `Score: ${playerScore}`;
            setTimeout(() => {
                this.remove();  // Remove the enemy after explosion
            }, 500);
        }
    }

    moveEnemy() {
        this.yPosition += this.speed;
        const gameBounds = gameScreen.getBoundingClientRect();
        const playerRect = playerObject.element.getBoundingClientRect();
        const enemyRect = this.element.getBoundingClientRect();

        if (this.isMovingRight) {
            this.xPosition += this.sideSpeed;
            this.increment += 1;
            if(this.xPosition + this.enemySize >= (gameBounds.width)){
                this.maxIncrement = this.increment; 
                this.isMovingRight = false;
            }
            if (this.increment >= this.maxIncrement) {
                this.isMovingRight = false; 
            }
        } else {
            this.xPosition -= this.sideSpeed;
            this.increment -= 1;
            if (this.increment <= 0) {
                this.isMovingRight = true;
            }
        }
        if(rectsIntersect(enemyRect,playerRect)){
            this.takeDamage(50);
            playerObject.takeDamage(15);
            healthDisplay.innerText = `Health: ${playerObject.health} `;
        }
        this.updatePosition();
    }
    
    update() {
        if (this.moving) {
            this.moveEnemy();
        }

        const gameRect = gameScreen.getBoundingClientRect();
        const enemyRect = this.element.getBoundingClientRect();

        if (enemyRect.bottom >= gameRect.bottom+32) {
            horde++;
            this.remove();
        }
    }

    startShooting() {
        this.shootInterval = setInterval(() => {
            this.enemyShoot();
        }, Math.random() * 800 + (Math.random() * (2100 - 1400) + 1400));
    }

    enemyShoot() {
        const enemyLaser = document.createElement('div');
        enemyLaser.classList.add('laser-enemy');

        // Append enemy laser to enemy object
        const enemyRect = this.element.getBoundingClientRect();
        const gameRect = gameScreen.getBoundingClientRect();

        const laserOffset = 20;
        const laserHeight = -1;

        enemyLaser.style.position = 'absolute';
        enemyLaser.style.left = (enemyRect.left - gameRect.left - (laserOffset - 34)) + 'px';
        enemyLaser.style.top = (enemyRect.top - gameRect.top + (enemyRect.height / 2) - (laserHeight / 2)) + 'px';

        gameScreen.appendChild(enemyLaser);
        this.moveLaser(enemyLaser);
    }

    moveLaser(enemyLaser) {
        const laserInterval = setInterval(() => {
            const laserRect = enemyLaser.getBoundingClientRect();
            const gameRect = gameScreen.getBoundingClientRect();
    
            if (laserRect.bottom < gameRect.top || laserRect.top > gameRect.bottom) {
                enemyLaser.remove();
                clearInterval(laserInterval);
            } else {
                enemyLaser.style.top = enemyLaser.offsetTop + 5 + 'px';
            }
    
            // Check for collisions with the playerObject
            const hitPlayer = this.checkCollision(enemyLaser);
            if (hitPlayer) {
                hitPlayer.takeDamage(this.damage);  
                healthDisplay.innerText = `Health: ${playerObject.health} `;
                enemyLaser.remove();
                clearInterval(laserInterval);
            }
        }, 10);
    }

    checkCollision(enemylaser) {
        const enemylaserRect = enemylaser.getBoundingClientRect();
        const playerRect = playerObject.element.getBoundingClientRect();
        if (rectsIntersect(enemylaserRect, playerRect)) {
            return playerObject;  
        }
        return null; 
    }

    remove() {
        clearInterval(this.shootInterval);
        this.element.remove();
    }
}

class Hammerhead extends Enemy {
    constructor() {
        super();
        this.health = 100;
        this.speed = Math.random() * (1.1 - 0.9)+ 0.9;
        this.element.style.backgroundImage = "url('HammerHead.png')";
        clearInterval(this.shootInterval);
    }

    shootLaser(){
        console.log("HamerHead Does not shoot lasers");
    }

    moveEnemy() {
        this.yPosition += this.speed;

        const playerX = playerObject.x;  

         const moveSpeedX = Math.random() * (1.0 - 0.7)+ 0.7;  
         if (this.xPosition < playerX) {
        this.xPosition += moveSpeedX;
            } else if (this.xPosition > playerX) {
                this.xPosition -= moveSpeedX;
            }

        const gameBounds = gameScreen.getBoundingClientRect();
        const enemyRect = this.element.getBoundingClientRect();

            if (this.xPosition < 0) {
                this.xPosition = 0;
            } else if (this.xPosition + enemyRect.width > gameBounds.width) {
                this.xPosition = gameBounds.width - enemyRect.width;
            }

        this.updatePosition();

        const playerRect = playerObject.element.getBoundingClientRect();
            if (rectsIntersect(enemyRect, playerRect)) {
                this.takeDamage(this.health);  
                playerObject.takeDamage(50);   
                healthDisplay.innerText = `Health: ${playerObject.health}`;
        }
    }
}

class Scorpion extends Enemy {
    constructor(){
        super();
        this.health = 5000;
        this.sideSpeed = 0.8;
        this.isSpecialAttack = false;
        this.element.classList.add("scorpion");

        this.initShootMissile();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            isBossActive = false;
            this.element.style.backgroundImage = "url('Explosion.png')";
            clearInterval(this.shootInterval);
            this.moving = false;
            playerScore += 500;
            scoreText.innerText = `Score: ${playerScore}`;
            setTimeout(() => {
                this.remove();  // Remove the enemy after explosion
            }, 500);
        }
    }

    moveEnemy() {
        const gameBounds = gameScreen.getBoundingClientRect();
        const playerRect = playerObject.element.getBoundingClientRect();
        const enemyRect = this.element.getBoundingClientRect();

        if(enemyRect.bottom < (gameBounds.height/2)-50){
            this.yPosition += this.speed;
            }

        if (this.isMovingRight) {
            this.xPosition += this.sideSpeed;
            if(this.xPosition + 128 >= (gameBounds.width)-8){
                this.isMovingRight = false;
                if (Math.random() < 1/3){
                const laserInterval = setInterval(() => {
                    this.sideSpeed = 1.7;
                    this.isSpecialAttack = true;
                    this.enemyShoot();  
                }, 60);
        
                setTimeout(() => {
                    clearInterval(laserInterval); 
                    this.sideSpeed = 0.8;
                    this.isSpecialAttack = false;
                }, 3200);
            }
            }
        } else {
            this.xPosition -= this.sideSpeed;
            if (this.xPosition - 8 <= 0) {
                this.isMovingRight = true;
                if (Math.random() < 1/3){
                    const laserInterval = setInterval(() => {
                        this.sideSpeed = 1.7;
                        this.isSpecialAttack = true;
                        this.enemyShoot();  
                    }, 60);
            
                    setTimeout(() => {
                        clearInterval(laserInterval); 
                        this.isSpecialAttack = false;
                        this.sideSpeed = 0.8;
                    }, 3200);
                }
            }
        }
        if(rectsIntersect(enemyRect,playerRect)){
            this.takeDamage(50);
            playerObject.takeDamage(15);
            healthDisplay.innerText = `Health: ${playerObject.health} `;
        }
        this.updatePosition();
    }

    startShooting() {
        this.shootInterval = setInterval(() => {
            setTimeout(()=>{
            this.enemyShoot();
            },100)
            this.enemyShoot();
        }, Math.random() * 800 + (Math.random() * (1100 - 900) + 900));
    }

    enemyShoot() {
        const leftLaser = document.createElement('div');
        const rightLaser = document.createElement('div');
        if(this.isSpecialAttack){
            leftLaser.classList.add('enemy-glow');
            rightLaser.classList.add('enemy-glow');
        }else{
        leftLaser.classList.add('laser-enemy');
        rightLaser.classList.add('laser-enemy');
        }

        const enemyRect = this.element.getBoundingClientRect();
        const gameRect = gameScreen.getBoundingClientRect();

        const laserOffset = 20;
        const laserHeight = -1;

        leftLaser.style.left = (enemyRect.left - gameRect.left - (laserOffset - 24)) + 'px';
        leftLaser.style.top = (enemyRect.top - gameRect.top + (enemyRect.height / 2) - (laserHeight-14)) + 'px';
        rightLaser.style.left = (enemyRect.left - gameRect.left + (laserOffset + 90)) + 'px';
        rightLaser.style.top = (enemyRect.top - gameRect.top + (enemyRect.height / 2) - (laserHeight-14)) + 'px';

        gameScreen.appendChild(leftLaser);
        gameScreen.appendChild(rightLaser);
        this.moveLaser(rightLaser);
        this.moveLaser(leftLaser);
    }

    initShootMissile(){
        setInterval(() => {
            this.shootMissile();
        }, 10000);
    }

    shootMissile(){
        const missile = document.createElement('div');
        missile.classList.add("missile")
        missile.style.transform = 'rotate(180deg)';

        const enemyRect = this.element.getBoundingClientRect();
        const gameRect = gameScreen.getBoundingClientRect();

        missile.style.position = 'absolute';
        missile.style.left = enemyRect.left - gameRect.left + (enemyRect.width / 2) - 4 + 'px';
        missile.style.top = (enemyRect.bottom - gameRect.top - 8) + 'px';

        gameScreen.appendChild(missile);
        this.moveMissile(missile);
    }

    moveMissile(missile){
        const missileInterval = setInterval(() => {
            const currentTop = parseFloat(missile.style.top);
            missile.style.top = currentTop + 4 + 'px';
            // Check for collisions with the Enemy objects
            const playerRect = playerObject.element.getBoundingClientRect();
            const missileRect = missile.getBoundingClientRect();
            const hitPlayer = rectsIntersect(missileRect, playerRect);
    
            if (hitPlayer) {
                missileExplosion(missile);  
                missile.remove();
                clearInterval(missileInterval);
            } else if (currentTop <= 0) {
                missile.remove();
                clearInterval(missileInterval);
            }
        }, 10);
    }
}

class PowerUps{

    constructor(){
        this.element = document.createElement('div');
        this.element.classList.add("power-Up")
        this.health = 40;
        this.speed = 0.3;
        this.isOverShield = false;
        this.isSpeedBoost = false;
        this.isRapidFire = false;
        this.moving = true;
        this.powerUpRect = this.element.getBoundingClientRect();
        gameScreen.appendChild(this.element);

        this.initializePowerType();
        this.setPosition();
    }

    initializePowerType() {
        let typeNum = Math.floor(Math.random() * 4) + 1;

        switch(typeNum) {
            case 1:
                this.isOverShield = true;
                this.element.style.backgroundImage = "url('OverShield.png')";
                break;
            case 2:
                this.isSpeedBoost = true;
                this.element.style.backgroundImage = "url('SpeedBoost.png')";
                break;
            case 3:
                this.isRapidFire = true;
                this.element.style.backgroundImage = "url('RapidFire.png')";
                break;
            case 4:
                this.isAmmoCrate = true;
                this.element.style.backgroundImage = "url('AmmoCrate.png')";
                break;
            default:
                console.error('Invalid power-up type number');
                break;
        }
    }

    setPosition() {
        const gameRect = gameScreen.getBoundingClientRect();
        this.xPosition =  Math.random() * (gameRect.width); 
        this.yPosition = -1; 
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.transform = `translate(${this.xPosition}px, ${this.yPosition}px)`;
        this.powerUpRect = this.element.getBoundingClientRect();
    }

    movePowerUp() {
        this.yPosition += this.speed;
        this.updatePosition();
    }

    update() {
        if (this.moving) {
            this.movePowerUp();
        }
        const gameRect = gameScreen.getBoundingClientRect();
        if (this.powerUpRect.bottom >= gameRect.bottom+8) {
            this.remove();
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.element.style.backgroundImage = "url('Explosion.png')";
            this.moving = false;
            if(this.isOverShield){
                playerObject.activateOverShield();
            }
            else if(this.isSpeedBoost){
                playerObject.activateSpeedBoost();
            }
            else if(this.isRapidFire){
                playerObject.activateRapidFire();
            }
            else{
                playerObject.reload();
            }
            playerScore += 5;
            scoreText.innerText = `Score: ${playerScore}`;
            setTimeout(() => {
                this.remove();  
            }, 500);
        }
    }

    remove() {
        this.element.remove();
    }

}

const missileExplosion = (missile) => {
const explosion = document.createElement('div');
explosion.classList.add('missileExplosion');  

    const missileRect = missile.getBoundingClientRect();
    const gameRect = gameScreen.getBoundingClientRect();

    explosion.style.position = 'absolute';
    explosion.style.left = (missileRect.left - gameRect.left)-40 + 'px';
    explosion.style.top = (missileRect.top - gameRect.top)-40 + 'px';

    gameScreen.appendChild(explosion);

    const playerRect = playerObject.element.getBoundingClientRect();
    const missileExplosionRect = explosion.getBoundingClientRect();

    const explosionDamage = () => {
        if(rectsIntersect(playerRect,missileExplosionRect)){
            playerObject.takeDamage(20);
        }

        enemiesArray.forEach(enemy => {
            const enemyRect = enemy.element.getBoundingClientRect();
            if (rectsIntersect(enemyRect, missileExplosionRect)) {
                enemy.takeDamage(125);  // Adjust damage if needed
            }
        });
    }
    
    requestAnimationFrame(explosionDamage);

    setTimeout(() => {
        explosion.remove();
    }, 500);  
}

function rectsIntersect(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

const playerObject = new Player(player, 20, 10);

const runGameLevelOne = () => {

    let scorpionSpawned = false;

    const spawnScorpion = () => {
        let bossOne = new Scorpion();
        enemiesArray.push(bossOne);
    }

    const spawnEnemies = () => {

        if(horde >= 6){
            isOverwhelmed = true;
        }

        if(playerScore >= 300 && !scorpionSpawned){
            spawnScorpion();
            scorpionSpawned = true;
            isBossActive = true;
            return;
        }

        if(!isOverwhelmed && !isBossActive){
        for (let i = 0; i <= 2; i++) {
            if (Math.random() <= 0.1 && playerScore >= 500) { 
                let enemy = new Hammerhead();
                enemiesArray.push(enemy);
            } else {
                let enemy = new Enemy();
                enemiesArray.push(enemy);
            }
        }
    }
    else{
        if(!isBossActive){
            for(let i = 0; i<= 35; i++){
                if (Math.random() <= 0.1) { 
                    let enemy = new Hammerhead();
                    enemiesArray.push(enemy);
                } else {
                    let enemy = new Enemy();
                    enemiesArray.push(enemy);
                }
            }
        }
    }
    };

    const spawnPowerUp = () => {
        let powerUp = new PowerUps();
        powerUpArray.push(powerUp);
        isPowerUpSpawning = false;
    }

    const updateGame = () => {
        enemiesArray.forEach((enemy, index) => {
            enemy.update();
            // Remove the enemy from the array if it's been removed from the DOM
            if (!enemy.element.parentElement) {
                enemiesArray.splice(index, 1);
            }
        });

        if(!isOverwhelmed){
        if (enemiesArray.length <= 1) {
            spawnEnemies();
        }
    }else{
        if(enemiesArray.length <= 15){
            spawnEnemies();
        }
    }

        if(powerUpArray <= 0 && !isPowerUpSpawning){
            isPowerUpSpawning = true;
            setTimeout(()=>{
                spawnPowerUp();
            },45000);
        }

        powerUpArray.forEach((powerUp, index) => {
            powerUp.update();
            if(!powerUp.element.parentElement){
                powerUpArray.splice(index, 1);
            }
        });
        requestAnimationFrame(updateGame);
    };
    spawnEnemies();
    updateGame();
};

runGameLevelOne();