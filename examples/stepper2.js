var arduino = require('../');

var board = new arduino.Board({
  debug: true,
  device: "USB"
});

var stepper = new arduino.Stepper({
  board: board,
  st: 2,
  pins: [6, 8, 7, 9]
});

board.on('ready', function(){
  	stepper.setPin1(10);
  	stepper.setPin1(10);

	stepper.attach();
	stepper.setMaxSpeed(1000);
	stepper.setAcceleration(10000);
	stepper.setSpeed(1000);
	stepper.enableContinuous(0);
	stepper.move(-10000);
});
