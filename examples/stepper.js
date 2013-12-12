var arduino = require('../');

var board = new arduino.Board({
  debug: true,
  device: "USB"
});

var stepper = new arduino.Stepper({
  board: board,
  pins: [10,12,11,13]
});

board.on('ready', function(){
	/* need these dummy packets I don't know why */
  	stepper.setPin1(10);
  	stepper.setPin1(10);

	board.sendClearingBytes();
	stepper.attach();
	/* demo for Continuous mode */
	stepper.setMaxSpeed(100);
	stepper.setSpeed(100);
	stepper.enableContinuous(1);
});
