# Moon Buggy Racing

A game created for the 2021 js13kGames competition with the theme "Space".

## Story

You are on a space mission and you have landed on the moon. You've been exploring the moon with your moon buggy, but you're running out of oxygen!
Drive the moon buggy back to the lunar lander before you run out of oxygen, while avoiding the rocks and collecting the stars. Will you make it
back to the lunar lander in time?

## Controls

Control the moon buggy with the arrow keys (Up accelerates, Down decelerates, Left and Right turns). Shoot stars with the space key.

## Resources

The game was built using the following major resources:

- [js13games-boiledplate](https://github.com/wil92/js13games-boiledplate):
  - Initial code to start your game for the annual contest js13kGames.
  - Licensed under Apache License 2.0. See [license file](https://github.com/wil92/js13games-boilerplate/blob/master/LICENSE.md).
- [kontra.js](https://github.com/straker/kontra)
  - A lightweight JavaScript gaming micro-library, optimized for js13kGames.
  - Licensed under MIT License. See [license file](https://github.com/straker/kontra/blob/33bee5510ed85036c1521906661b043fa908dc2c/LICENSE).
- [tinyfont.js](https://github.com/darkwebdev/tinyfont.js)
  - Tiniest possible pixel font for your JS games (<700b zipped, suitable for js13k)
  - Licensed under MIT License. See [license file](https://github.com/darkwebdev/tinyfont.js/blob/master/LICENSE).
- [alphabet-piano](https://github.com/xem/alphabet-piano)
  - Minimal music tool
  - Public domain
- [aseprite](https://github.com/aseprite/aseprite)
  - Animated sprite editor & pixel art tool 

## Install dependencies

`npm install`

## Develop mode

You can start the project in development mode with the command `npm start`. This has live reloading after any change in the code.

## Build project

To build the project in production and generate the *game.zip* file, you run the command `npm run build`.

Test the production build by opening `./dist/index.html` with a web server like [http-server](https://github.com/http-party/http-server).
