let game;

const gameOptions = {
    playerGravity: 1100,
    playerSpeed: 150,
    playerJump: 350,
    playerShift: 300
};

window.onload = function () {
    const gameConfig = {
        type: Phaser.CANVAS,
        width: 512, //324
        height: 512, //260
        backgroundColor: '6bccef',
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        scene: [PreloadGame, MenuScene, PlayGame, GameOverScene],
    };
    game = new Phaser.Game(gameConfig);
};

class PreloadGame extends Phaser.Scene {
    constructor() {
        super("PreloadGame");
    }
    preload() {
        this.load.tilemapTiledJSON("level", "assets/tile/map/level.json");
        this.load.image("tile", "assets/tile/tile.png");

        this.load.image("flag", "assets/img/flag.png");
        this.load.image("flag2", "assets/img/flag2.png");
        this.load.image('over', 'assets/img/platform.png');
        this.load.image('collide','assets/img/collide.png');

        this.load.spritesheet('coin', 'assets/spritesheet/coin.png', { frameWidth: 18.25, frameHeight: 16 });
        this.load.spritesheet('mario', 'assets/spritesheet/mario.png', { frameWidth: 17, frameHeight: 17 });
        this.load.spritesheet('enemy', 'assets/spritesheet/enemy.png', { frameWidth: 40.8, frameHeight: 35 });

        this.load.audio('coinSound', 'assets/audio/sound_coin.wav');
        this.load.audio('jumpSound', 'assets/audio/sound_jump.wav');
        this.load.audio('lvlupSound', 'assets/audio/sound_lvl_up.wav');
        this.load.audio('loseliveSound', 'assets/audio/sound_lose_live.wav');
        this.load.audio('sceneSound', 'assets/audio/sound_scene.mp3');
    }

    create() {
        this.scene.start("menu");
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super("menu")
    }

    start_button = null

    preload() { }

    create() {
        //pagina inicial
        this.start_button = this.add.text(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, "Start Game")
            .setOrigin(0.5)
            .setPadding(30, 10)
            .setStyle({
                backgroundColor: "#fff",
                fill: "#111",
                fontSize: 24,
                fontStyle: "bold"
            })
            .setInteractive()
            .on('pointerup', () => {
                this.scene.start("game")
            })
    }
}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super("gameover")
    }

    start_button = null
    text = null

    preload() { }

    create() {
        this.start_button = this.add.text(this.sys.game.canvas.width / 2, this.sys.game.canvas.height / 2, "Restart")
            .setOrigin(0.5)
            .setPadding(30, 10)
            .setStyle({
                backgroundColor: "#fff",
                fill: "#111",
                fontSize: 24,
                fontStyle: "bold"
            })
            .setInteractive()
            .on('pointerup', () => {
                const game = this.scene.get("game");
                game.scene.restart();
                this.scene.start("game");
            })
    }
}


class PlayGame extends Phaser.Scene {
    constructor() {
        super("game");
    }

    collide;
    coin;
    enemy;
    scoreText = "";
    scoreTextlive = "";
    score = 0;
    lives = 3;
    flag;
    flag2;
    layer1;
    plataform1;
    plataform2;
    addCollider = true;
    isGameOver = false;

    create() {
        this.isGameOver = false;

        this.score = 0;
        this.lives = 3;

        // codigo de implementação da localização das moedas pelos niveis
        var coinPositions = [
            // coordenadas primeiro nivel
            { x: 300, y: 100 },
            { x: 397, y: 80 },
            { x: 290, y: 260 },
            { x: 390, y: 260 },
            { x: 135, y: 260 },
            { x: 415, y: 310 },
            { x: 287, y: 310 },
            { x: 278, y: 405 },
            { x: 278, y: 405 },
            { x: 35, y: 550 },
            { x: 50, y: 680 },
            { x: 414, y: 680 },
            { x: 680, y: 680 },
            { x: 280, y: 610 },
            { x: 280, y: 610 },
            { x: 607, y: 125 },
            { x: 767, y: 115 },
            { x: 846, y: 100 },
            { x: 550, y: 270 },
            { x: 600, y: 470 },
            { x: 850, y: 400 },
            // coordenadas segundo nivel
            { x: 2300, y: 690 },
            { x: 2118, y: 600 },
            { x: 1870, y: 630 },
            { x: 1650, y: 690 },
            { x: 1700, y: 550 },
            { x: 1900, y: 545 },
            { x: 1900, y: 350 },
            { x: 1675, y: 330 },
            { x: 1675, y: 290 },
            { x: 1675, y: 250 },
            { x: 1910, y: 185 },
            { x: 2000, y: 185 },
            { x: 2075, y: 460 },
            { x: 2133, y: 220 },
            { x: 2170, y: 445 },
            { x: 2272, y: 440 },
            { x: 2223, y: 290 },
            { x: 2510, y: 430 },
            { x: 2525, y: 145 },
            { x: 2325, y: 60 },
            { x: 2134, y: 95 },
            { x: 1934, y: 65 },
        ];

        //implementaçao do inimigo
        var enemyPositions = [
            { x: 442, y: 258 },
            { x: 90, y: 690 },
            { x: 825, y:  258},
            { x: 820, y:  401},
            { x: 353, y:  145},

            { x: 2024, y:  353},
            { x: 2380, y:  497},
            { x: 1740, y:  689},
            { x: 1975, y:  113},
        ];
        //plataformas debaixo do mapa para o mario perder ao colidir com elas
        this.platform1 = this.physics.add.staticGroup();
        this.platform1.create(400, 875, 'over').setScale(2).refreshBody();
        this.platform2 = this.physics.add.staticGroup();
        this.platform2.create(2200, 875, 'over').setScale(2).refreshBody();

        // particulas que aparecem quando o mario esta a andar no mapa
        //this.add.particles('particle');

        //implementaçao do som do jogo
        this.soundFx = this.sound.add('coinSound');
        this.soundFx = this.sound.add('jumpSound');
        this.soundFx = this.sound.add('lvlupSound');
        this.soundFx = this.sound.add('loseliveSound');

        //this.sound.add('sceneSound', { loop: true});
        this.sound.play('sceneSound', { volume: 0.01, loop: true });


        this.flag = this.physics.add.sprite(770, 650, "flag");
        this.flag2 = this.physics.add.sprite(1728, 90, "flag2");

        // cria um objeto de teclas de seta
        this.cursors = this.input.keyboard.createCursorKeys();

        // codigo de implementação do tilemap e tileset no ecrã
        this.map = this.make.tilemap({ key: "level" });
        const tile = this.map.addTilesetImage("tileset01", "tile");

        // blocos cujo player colide ao pousar
        this.map.setCollisionBetween(16, 17);
        this.map.setCollisionBetween(21, 22);
        this.map.setCollisionBetween(27, 28);
        this.map.setCollision(40);

        // criação de uma variavel layer que quando é chamada vai para o "layer01" e "layer02" do tilemap "level.json"
        this.layer1 = this.map.createStaticLayer("layer01", tile);

        // codigo de implementação do mario (player) e da moeda coletável, juntamente com as suas coordenadas iniciais
        this.enemy = this.physics.add.sprite("enemy");
        this.coin = this.physics.add.sprite("coin");
        this.mario = this.physics.add.sprite(90, 150, "mario");

        this.mario.body.velocity.x = 0;
        this.mario.body.velocity.y = 0;
        this.mario.body.gravity.y = gameOptions.playerGravity;
        this.mario.setCollideWorldBounds(false);

        // codigo para definir a câmera/limites e para seguir o mario
        this.cameras.main.setBounds(0, 0, 4000, 4000);
        this.cameras.main.startFollow(this.mario);
        //this.cameras.main.setZoom(1.5);

        this.startTime = 0;
        this.timeElapsed = 0;
        this.timerText = this.add.text(25, 40, '', { fontFamily: 'Suez One', fontWeight: 'bold', fontWeight: '900', fontSize: '20px', fill: '#000' }).setScrollFactor(0);
        this.scoreText = this.add.text(25, 20, `Score: ${this.score}`, { fontFamily: 'Suez One', fontWeight: 'bold', fontWeight: '900', fontSize: '20px', fill: '#000' }).setScrollFactor(0);
        this.scoreTextlives = this.add.text(25, 60, `Lives: ${this.lives}`, { fontFamily: 'Suez One', fontWeight: 'bold', fontWeight: '900', fontSize: '20px', fill: '#000' }).setScrollFactor(0);

        // codigo de implementação para o mario colidir ao tocar no "bloco" e nos objetos
        this.physics.add.collider(this.mario, this.layer1);
        this.physics.add.collider(this.mario, this.enemy, this.loselive, null, this);
        this.physics.add.collider(this.mario, this.coin, this.getcoin, null, this);
        this.physics.add.collider(this.mario, this.flag, this.nxtLvl, null, this);
        this.physics.add.collider(this.mario, this.flag2, this.finishGame, null, this);

        // codigo de implementação para o mario colidir ao cair do mapa
        this.physics.add.collider(this.mario, this.platform1, this.outGame1, null, this);
        this.physics.add.collider(this.mario, this.platform2, this.outGame2, null, this);

        // codigo de implementação para criar as animações e frames que cada animação deve usar tanto do mario como da coin
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('mario', { start: 1, end: 2 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'mario', frame: 7 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('mario', { start: 11, end: 12 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 6 }),
            frameRate: 5,
            repeat: -1
        });

        // codigo de implementação para adicionar moedas pelo mapa, serem coletadas quando o mario colide com elas e para estarem sempre a girar ('spin')
        coinPositions.forEach(function (position) {
            var coin = this.physics.add.sprite(position.x, position.y, 'coin');
            coin.setBounce(1);
            coin.setCollideWorldBounds(false);
            coin.anims.play('spin', true);
            this.physics.add.collider(this.mario, coin, this.getcoin, null, this);
        }, this);
        
        enemyPositions.forEach(function(position) {
            var enemy = this.physics.add.sprite(position.x, position.y, 'enemy');
            this.physics.add.collider(enemy, this.layer1);
          }, this); 

        // cheat
        this.input.keyboard.on('keydown_M', function (event) {
            this.mario.x = 90;
            this.mario.y = 550;
            this.cameras.main.startFollow(this.mario);
        }, this);

        this.input.keyboard.on('keydown_P', function (event) {
            this.mario.x = 1828;
            this.mario.y = 100;
            this.cameras.main.startFollow(this.mario);
        }, this);

        // cheat code n funcional ainda
        this.input.keyboard.on('keydown_C', function (event) {
            this.score += 1000;
            this.scoreText.setText('Score: ' + this.score);
            console.log(this.score);
        }, this);

    }

    update() {

        if (this.isGameOver) return;

            this.timeElapsed = ((this.time.now - this.startTime) / 1000).toFixed(2);
            this.timerText.setText(`Time: ${this.timeElapsed}`);

        if (this.lives == 0){
            this.sound.play('loseliveSound', { volume: 0.025 });
            this.scene.start('gameover');
            this.isGameOver = true;
        }
            
        // codigo para movimentar o mario
        if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
            console.log(this.mario);
            this.mario.setVelocityX(-gameOptions.playerSpeed);
            this.mario.anims.play('left', true);
        }
        else if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) {
            this.mario.body.velocity.x = gameOptions.playerSpeed;
            this.mario.anims.play('right', true);
        }
        else {
            this.mario.body.velocity.x = 0;
            this.mario.anims.play('turn');
        }
        if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown && this.mario.body.onFloor()) {
            this.sound.play('jumpSound', { volume: 0.025 });
            this.mario.setVelocityY(-gameOptions.playerJump);
        }
    }
    getcoin(mario, coin) {
        coin.destroy();
        this.score += 1;
        this.scoreText.setText('Score: ' + this.score);
        this.sound.play('coinSound', { volume: 0.025 });
    }

    //funçao para qunado o mario morrer, voltar para o spawn e perder uma vida
    outGame1(mario) {
        this.mario.x = 90;
        this.mario.y = 150;
        this.cameras.main.startFollow(this.mario);
        this.sound.play('loseliveSound', { volume: 0.025 });
        this.lives -= 1;
        this.scoreTextlives.setText('Lives: ' + this.lives);
    }

    outGame2(mario) {
        this.mario.x = 2380;
        this.mario.y = 690;
        this.cameras.main.startFollow(this.mario);
        this.sound.play('loseliveSound', { volume: 0.025 });
        this.lives -= 1;
        this.scoreTextlives.setText('Lives: ' + this.lives);
    }
    loselive(mario){
        this.lives -= 1;
        this.scoreTextlives.setText('Lives: ' + this.lives);
        console.log("oi");
    }

    // função para quando o mario tocar na bandeira, o mario vai para o segundo nivel
    nxtLvl(mario, flag) {
        this.mario.x = 2380;
        this.mario.y = 690;
        this.cameras.main.startFollow(this.mario);
        this.sound.play('lvlupSound', { volume: 0.025 });
        this.flag.destroy();
        this.score = 0;
        this.lives = 0;
    }

    finishGame(mario, flag2){
        this.sound.play('lvlupSound', { volume: 0.025 });
        this.scene.start('gameover');
        this.isGameOver = true;
    }
}
