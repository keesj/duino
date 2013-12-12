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
  pins: [10,12,11,13]
});

board.on('ready', function(){
	/* need these dummy packets I don't know why */
  	stepper1.setPin1(10);
  	stepper1.setPin1(10);
  	stepper1.setPin1(10);
  	stepper1.setPin1(10);

	/* Todo convert this back to a single javascript call */
	stepper1.setInterface(stepper1.InterfaceType.HALF4WIRE);
  	stepper1.setPin1(10);
	stepper1.setPin2(12);
	stepper1.setPin3(11);
	stepper1.setPin4(13);
	stepper1.enable(true);
	stepper1.enableContinuous(0);

	/* demo for Continuous mode */
	stepper1.setMaxSpeed(1500);
	stepper1.setAcceleration(1000);
	stepper1.setSpeed(1000);

	stepper2.setInterface(stepper2.InterfaceType.HALF4WIRE);
  	stepper2.setPin1(6);
	stepper2.setPin2(8);
	stepper2.setPin3(7);
	stepper2.setPin4(9);
	stepper2.enable(true);
	stepper2.enableContinuous(0);

	stepper2.setMaxSpeed(1500);
	stepper2.setAcceleration(1000);
	stepper2.setSpeed(1000);

	stepper1.moveTo(10000);
	stepper2.moveTo(10000);

});

