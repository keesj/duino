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

	/* Todo convert this back to a single javascript call */
	stepper.setInterface(stepper.InterfaceType.HALF4WIRE);
  	stepper.setPin1(10);
	stepper.setPin2(12);
	stepper.setPin3(11);
	stepper.setPin4(13);
	stepper.enable(true);

	/* demo for Continuous mode */
	stepper.setMaxSpeed(100);
	stepper.setSpeed(100);
	stepper.enableContinuous(1);
});
