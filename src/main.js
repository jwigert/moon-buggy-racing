/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable no-loop-func */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
import {
    init, Sprite, SpriteSheet, GameLoop, initKeys, keyPressed, load, imageAssets, collides,
} from 'kontra';
import { initFont, font } from 'tinyfont';

const { canvas, context } = init();
const render = initFont(font, context);

const playMelody = (melody, delay) => {
    if (melody) { // melody string (a-z + 0 for silence)
        const noteLength = 0.3; // note length in seconds
        const audioContext = new AudioContext();
        const gain = audioContext.createGain();
        for (let i = 0; i < melody.length; i++) {
            const oscillator = audioContext.createOscillator();
            if (melody[i] && melody[i] !== '0') {
                oscillator.connect(gain);
                oscillator.connect(audioContext.destination);
                oscillator.start(i * noteLength + delay);
                oscillator.frequency.setValueAtTime(440 * 1.06 ** (-105 + melody.charCodeAt(i)), i * noteLength + delay);
                oscillator.type = 'sine';
                gain.gain.setValueAtTime(0.5, i * noteLength + delay);
                gain.gain.setTargetAtTime(0.001, i * noteLength + delay + 0.1, 0.05);
                oscillator.stop(i * noteLength + delay + noteLength - 0.01);
            }
        }
    }
};

const speedMax = 4;
const speedMin = 0;
const frameRate = 1 / 60;
const distanceFactor = 9;

let gameState = 'START';
let timeRemaining = 0;
let starsCollected = 0;
let speed = 0;
let keyUpFrames = 0;
let keyDownFrames = 0;
let rocks = [];
let lastRockTime = 0;
let stars = [];
let lastStarTime = 0;
let melodyTime = 14.4;
let distanceTraveled = 0;
let shots = [];
let lastShotTime = 0;
let lunarLander;
let mountainGreenBlue = 255;
let mountainGreenBlueIncrement = -1;
let gameOverReason = '';
let gameOverReasonX = 0;
let goalDistance = 0;

load('assets/imgs/car.png', 'assets/imgs/rock.png', 'assets/imgs/star.png', 'assets/imgs/lander.png').then(() => {
    const carSpriteSheet = SpriteSheet({
        image: imageAssets['assets/imgs/car'],
        frameWidth: 16,
        frameHeight: 16,
        animations: {
            idle: {
                frames: 0,
            },
            drive: {
                frames: '0..1',
                frameRate: 15,
            },
        },
    });

    const car = Sprite({
        width: 32,
        height: 32,
        animations: carSpriteSheet.animations,
    });

    const restartGame = () => {
        gameState = 'START';
        timeRemaining = 0;
        starsCollected = 0;
        speed = 0;
        keyUpFrames = 0;
        keyDownFrames = 0;
        rocks = [];
        lastRockTime = 0;
        stars = [];
        lastStarTime = 0;
        distanceTraveled = 0;
        shots = [];
        lastShotTime = 0;
        lunarLander = undefined;
        mountainGreenBlue = 255;
        mountainGreenBlueIncrement = -1;
        goalDistance = 0;
        car.x = 300;
        car.dx = 0;
        car.dy = 0;
        car.update();
    };

    const leftMountain = Sprite({
        x: 0,
        y: 0,
        color: 'rgb(255 255 255)',
        width: 20,
        height: 600,
    });

    const rightMountain = Sprite({
        x: 580,
        y: 0,
        color: 'rgb(255 255 255)',
        width: 20,
        height: 600,
    });

    const topScreen = Sprite({
        x: 0,
        y: 0,
        color: 'rgb(100, 100, 100)',
        width: 600,
        height: 60,
    });

    const speedometer = Sprite({
        x: 5,
        y: 5,
        color: 'rgb(150, 150, 150)',
        width: 185,
        height: 50,
    });

    const speed1 = Sprite({
        x: 10,
        y: 10,
        color: 'rgb(0, 100, 0)',
        width: 40,
        height: 40,
    });

    const speed2 = Sprite({
        x: 55,
        y: 10,
        color: 'rgb(0, 150, 0)',
        width: 40,
        height: 40,
    });

    const speed3 = Sprite({
        x: 100,
        y: 10,
        color: 'rgb(0, 200, 0)',
        width: 40,
        height: 40,
    });

    const speed4 = Sprite({
        x: 145,
        y: 10,
        color: 'rgb(100, 0, 0)',
        width: 40,
        height: 40,
    });

    const topStar = Sprite({
        image: imageAssets['assets/imgs/star'],
        x: 470,
        y: 5,
    });

    const addLunarLander = () => Sprite({
        image: imageAssets['assets/imgs/lander'],
        x: 140,
        y: -260,
    });

    const lunarLanderStart = addLunarLander();

    const randomX = () => leftMountain.width + Math.floor(Math.random() * (rightMountain.x - 68));

    const addStar = () => {
        let star;
        let collision = true;
        while (collision) {
            star = Sprite({
                image: imageAssets['assets/imgs/star'],
                x: randomX(),
                y: topScreen.height,
            });
            collision = rocks.some((rock) => collides(star, rock));
        }
        return star;
    };

    const addRock = () => {
        let rock;
        let collision = true;
        while (collision) {
            rock = Sprite({
                image: imageAssets['assets/imgs/rock'],
                x: randomX(),
                y: topScreen.height,
            });
            collision = stars.some((star) => collides(star, rock));
        }
        return rock;
    };

    const addShot = (x, y) => Sprite({
        x,
        y,
        color: 'yellow',
        width: 8,
        height: 8,
    });

    const manageMelody = () => {
        melodyTime += frameRate;
        if (melodyTime > 14.4) {
            melodyTime = 0;
            playMelody('llooqq00llooqq00llooll00llqqoo00qoqololojljlolol', 0.3);
        }
    };

    initKeys();

    const loop = GameLoop({
        update: () => {
            if (gameState === 'START') {
                car.x = 200;
                car.y = 430;
                car.playAnimation('drive');
                car.rotation = 1.57;
                car.update();

                lunarLanderStart.scaleX = 0.15;
                lunarLanderStart.scaleY = 0.15;
                lunarLanderStart.x = 368;
                lunarLanderStart.y = 420;
                lunarLanderStart.update();

                if (keyPressed('e')) {
                    timeRemaining = 15;
                    goalDistance = speedMax * 0.5 * timeRemaining;
                }
                if (keyPressed('m')) {
                    timeRemaining = 45;
                    goalDistance = speedMax * 0.6 * timeRemaining;
                }
                if (keyPressed('h')) {
                    timeRemaining = 75;
                    goalDistance = speedMax * 0.7 * timeRemaining;
                }

                if (goalDistance > 0) {
                    car.x = 300;
                    car.y = 550;
                    car.rotation = 0;
                    car.update();
                    gameState = 'PLAY';
                }
            } else if (gameState === 'PLAY') {
                timeRemaining -= frameRate;
                if (timeRemaining < 0) {
                    gameOverReason = 'YOU RAN OUT OF OXYGEN!';
                    gameOverReasonX = 160;
                    gameState = 'GAMEOVER';
                }

                manageMelody();

                lastRockTime += frameRate;
                lastStarTime += frameRate;
                lastShotTime += frameRate;
                distanceTraveled += speed * frameRate;

                if (speed > 0) {
                    if (lastRockTime > 1 / speed && !lunarLander) {
                        rocks.push(addRock());
                        lastRockTime = 0;
                    }

                    if (lastStarTime > 10 / speed && !lunarLander) {
                        stars.push(addStar());
                        lastStarTime = 0;
                    }

                    if (keyPressed('left')) {
                        car.dx = -4;
                    } else if (keyPressed('right')) {
                        car.dx = 4;
                    } else {
                        car.dx = 0;
                    }
                }

                if (distanceTraveled > goalDistance && !lunarLander) {
                    lunarLander = addLunarLander();
                }

                if (keyPressed('up')) {
                    keyUpFrames++;
                    if (keyUpFrames >= 10) {
                        keyUpFrames = 0;
                        if (speed < speedMax) {
                            speed++;
                        } else {
                            speed = speedMax;
                        }
                    }
                } else if (keyPressed('down')) {
                    keyDownFrames++;
                    if (keyDownFrames >= 10) {
                        keyDownFrames = 0;
                        if (speed > speedMin) {
                            speed--;
                        } else {
                            speed = speedMin;
                        }
                    }
                }
                if (keyPressed('space') && lastShotTime > 1 && starsCollected > 0) {
                    playMelody('t', 0);
                    shots.push(addShot(car.x + 12, car.y));
                    starsCollected--;
                    lastShotTime = 0;
                }

                if (speed === speedMin) {
                    car.playAnimation('idle');
                } else {
                    car.playAnimation('drive');
                }

                if (car.x > canvas.width - car.width - rightMountain.width) {
                    car.x = canvas.width - car.width - rightMountain.width;
                    car.dx = 0;
                } else if (car.x - leftMountain.width < 0) {
                    car.x = leftMountain.width;
                    car.dx = 0;
                }
                car.update();

                if (mountainGreenBlue > 254) {
                    mountainGreenBlueIncrement = -1;
                }
                if (mountainGreenBlue < 150) {
                    mountainGreenBlueIncrement = 1;
                }
                mountainGreenBlue += mountainGreenBlueIncrement;
                leftMountain.color = `rgb(255 ${mountainGreenBlue} ${mountainGreenBlue})`;
                leftMountain.update();
                rightMountain.color = leftMountain.color;
                rightMountain.update();

                rocks.forEach((rock) => {
                    rock.dy = speed;
                    rock.update();

                    if (collides(car, rock)) {
                        playMelody('aa', 0);
                        gameOverReason = 'YOU COLLIDED WITH A ROCK!';
                        gameOverReasonX = 140;
                        gameState = 'GAMEOVER';
                    }
                });

                stars.forEach((star) => {
                    star.dy = speed;
                    star.update();

                    if (collides(car, star)) {
                        starsCollected++;
                        star.y = 600;
                        star.update();
                    }
                });

                shots.forEach((shot) => {
                    shot.dy = -10 - speed;
                    shot.update();

                    rocks.forEach((rock) => {
                        if (collides(rock, shot)) {
                            shot.y = 0;
                            shot.update();
                            rock.y = 600;
                            rock.update();
                        }
                    });
                });

                rocks = rocks.filter((rock) => rock.y < 600);
                stars = stars.filter((star) => star.y < 600);
                shots = shots.filter((shot) => shot.y > 0);

                if (lunarLander) {
                    lunarLander.dy = speed;
                    lunarLander.update();

                    if (car.y + 32 < lunarLander.y + 320) {
                        gameState = 'GAMEWON';
                    }
                }
            } else if (gameState === 'GAMEOVER' || gameState === 'GAMEWON') {
                manageMelody();
                if (keyPressed('space')) {
                    restartGame();
                }
            }
        },

        render: () => {
            if (gameState === 'START') {
                render('MOON BUGGY', 20, 30, 64, 'red');
                render('RACING', 130, 130, 64, 'red');
                render('DRIVE THE MOON BUGGY BACK TO THE LUNAR LANDER', 20, 260, 16, 'red');
                render('BEFORE YOU RUN OUT OF OXYGEN!', 100, 290, 16, 'red');
                render('AVOID THE ROCKS.', 190, 320, 16, 'red');
                render('CONTROL THE MOON BUGGY WITH THE ARROW KEYS.', 30, 350, 16, 'red');
                render('SHOOT STARS WITH THE SPACE KEY.', 94, 380, 16, 'red');
                render('SELECT DIFFICULTY BY PRESSING THE E, M, OR H KEY:', 10, 490, 16, 'red');
                render('E EASY, M MEDIUM, H HARD', 160, 520, 16, 'red');
                render('A JS13KGAMES 2021 ENTRY BY JOHAN WIGERT', 60, 560, 16, 'red');
                car.render();
                lunarLanderStart.render();
            } else if (gameState === 'PLAY') {
                car.render();
                leftMountain.render();
                rightMountain.render();
                rocks.forEach((rock) => rock.render());
                stars.forEach((star) => star.render());
                shots.forEach((shot) => shot.render());
                if (lunarLander) {
                    lunarLander.render();
                }
                topScreen.render();
                speedometer.render();
                render(`TIME: ${Number.parseFloat(timeRemaining).toFixed(1)}`, 200, 10, 16, 'red');
                render(`DISTANCE: ${Number.parseFloat(goalDistance - distanceTraveled + distanceFactor).toFixed(1)}`, 200, 34, 16, 'red');
                topStar.render();
                render(starsCollected.toString(), 530, 14, 32, 'rgb(217, 160, 102)');

                if (speed >= 1) {
                    speed1.render();
                }
                if (speed >= 2) {
                    speed2.render();
                }
                if (speed >= 3) {
                    speed3.render();
                }
                if (speed >= 4) {
                    speed4.render();
                }
            } else if (gameState === 'GAMEOVER') {
                render('GAME OVER', 40, 200, 64, 'red');
                render(gameOverReason, gameOverReasonX, 300, 16, 'red');
                render('THANKS FOR PLAYING MOON BUGGY RACING!', 60, 340, 16, 'red');
                render('PRESS SPACE TO PLAY AGAIN!', 65, 380, 24, 'red');
            } else if (gameState === 'GAMEWON') {
                render('YOU MADE IT!', 10, 200, 64, 'red');
                render('THANKS FOR PLAYING MOON BUGGY RACING!', 60, 300, 16, 'red');
                render('PRESS SPACE TO PLAY AGAIN!', 65, 340, 24, 'red');
            }
        },
    });

    loop.start();
});
