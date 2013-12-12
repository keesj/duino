var arduino = require('../');

var board = new arduino.Board({
  debug: true,
  device: "USB"
});

var stepper = new arduino.Stepper({
  board: board,
  st: 2,
});

board.on('ready', function(){
  	stepper.setPin1(10);
  	stepper.setPin1(10);

	stepper.setInterface(stepper.InterfaceType.HALF4WIRE);
  	stepper.setPin1(6);
	stepper.setPin2(8);
	stepper.setPin3(7);
	stepper.setPin4(9);
	stepper.enable(true);
	stepper.setMaxSpeed(1000);
	stepper.setAcceleration(10000);
	stepper.setSpeed(1000);
	stepper.enableContinuous(0);
	stepper.move(-10000);
});
