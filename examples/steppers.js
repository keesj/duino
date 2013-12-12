var arduino = require('../');

var board = new arduino.Board({
  debug: true,
  device: "USB"
});

var stepper1 = new arduino.Stepper({
  board: board,
  pins: [10,12,11,13]
});

var stepper2 = new arduino.Stepper({
  board: board,
  st: 2,
  pins: [6,8,7,9]
});

board.on('ready', function(){
	/* need these dummy packets I don't know why */
  	stepper1.setPin1(10);
  	stepper1.setPin1(10);

	/* Todo convert this back to a single javascript call */
	stepper1.attach();

	/* demo for Continuous mode */
	stepper1.setMaxSpeed(1500);
	stepper1.setAcceleration(1000);
	stepper1.setSpeed(1000);

	stepper2.attach();
	stepper2.enableContinuous(0);

	stepper2.setMaxSpeed(1500);
	stepper2.setAcceleration(1000);
	stepper2.setSpeed(1000);

	stepper1.moveTo(10000);
	stepper2.moveTo(10000);

});

