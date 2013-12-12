var events = require('events'),
    util = require('util');

/*
 * Accel stepper library inspired nodejs library for powering stepper motors.
 * 
 * You can view the original API here
 * http://www.airspayce.com/mikem/arduino/AccelStepper/classAccelStepper.html
 * To keep things simple we are going to make the wire protocol the same as the javascript API.
 * I am new to all this. The implication is that we can only pass one or two parameters per function.
 * 
 * We are going to use the following communication scheme commands contains 8 bytes:
 * !cmd0 , cmd1, st0 , ((byte)fnc).toHex , ((int 16)val).toHex
 * two bytes command BCD (stepper commands are all 88) 
 * one byte command BCD (stepper number values are 1 2 or 3)
 * two bytes(hex) function number (see bellow) , this is a byte value starting with 1
 * four bytes val0 16 bit value encoded using two's complement
 *
 * AccelStepper (uint8_t interface=AccelStepper::FULL4WIRE, uint8_t pin1=2, uint8_t pin2=3, uint8_t pin3=4, uint8_t pin4=5, bool enable=true)
 *   void 	setInterface (val0)   1
 *   void 	setPin1 (number)      2
 *   void 	setPin2 (number)      3
 *   void 	setPin3 (number)      4
 *   void 	setPin4 (number)      5
 *   void 	enable (enable)       6
 *
 * void 	moveTo (long absolute)
 *   void moveTo( signed int 16)      7
 *
 * void run(); // replaced by enableContinuous()
 * void runSpeed();// replaced by enableContinuous()
 * void enableContinuous(enable); 8
 * 
 * void 	move (long relative)
 *   void move( signed int 16)        9
 *
 * void 	setMaxSpeed (float speed)
 *   void setMaxSpeed( signed int 16) 10
 *
 * void 	setAcceleration (float acceleration)
 *   void setAcceleration( signed int 16) 11
 *
 * void 	setSpeed (float speed)
 *   void setSpeed( signed int 16) 12
 *
 * float 	speed ()
 *   int speed()  13
 *
 * long 	distanceToGo ()
 *   int distanceToGo() 14
 *
 * long 	targetPosition ()
 *   int targetPosition() 15
 *
 * long 	currentPosition ()
 *   int currentPosition() 16
 *
 * void 	setCurrentPosition (long position)
 *   void setCurrentPosition( signed int 16) 17
 *
 *
 * We don't know yet wha we want do to with the followin ones:
 * void 	runToPosition () 
 * boolean 	runSpeedToPosition ()
 * void 	runToNewPosition (long position)
 * void 	stop ()
 * Tell the board to set it up
 *
 * Create a stepper library using pins 10 , 11 , 12 and 13. 
 */
var Stepper = function (options) {
  if (!options || !options.board) throw new Error('Must supply required options to Stepper');
  this.board = options.board;

  /* make it possible to overide the pins used */
  var pins = options.pins || [10, 11, 12, 13];

  /* we support up to 3 stepper motors on the board index is the index
     of the board we currently want to run. defatul is 0 */
  var st = options.st || 1; 

  if (! Array.isArray(pins)) throw new Error('pins parameter passed is not an array');
  this.pins = pins;
  this.st = st;
  //this.st = this.board.normalizePin(st);
   
  this.InterfaceType = { 
  	FUNCTION  : 0, 
	DRIVER    : 1, 
	FULL2WIRE : 2, 
	FULL3WIRE : 3, 
  	FULL4WIRE : 4, 
	HALF3WIRE : 6, 
	HALF4WIRE : 8 
  }


  var types = {
    attached: true,
    detached: true,
    read: true,
    moved: true
  };

  this.board.on('ready', function () {
    console.log('board ready, attaching steppers', this);
  }.bind(this));

  this.board.on('data', function (message) {
/*
    var m = message.slice(0, -1).split('::'),
        err = null,
        pin, type, data;

    if (!m.length) {
      return;
    }

    pin = m[0]
    type = m[1];
    data = m.length === 3 ? m[2] : null;

    if (pin === this.pin && types[type]) {
      this.emit(type, err, data);
    }
*/
  }.bind(this));
};

util.inherits(Stepper, events.EventEmitter);

Stepper.prototype.valueEncode2 = function (value) {
  
  if (value >= 0 ){
  	return value.toString(16)
  }
  //for negative numbers we nee a little more work to 
  //encode then using two's complement 
  var x = -value;  //first make it positive again
  x = (~x +1) | 0x8000; //use 16 bits and ensure the sign bit is set
  x &=0xffff;// mask
  return x.toString(16)
}

Stepper.prototype.command = function (fnc,val0) {
  if (fnc <0 || fnc > 255) throw new Error("function must be value between 0 and 255");
  var msg = '88' 
		+ this.st 
		+ this.board.lpad( 2, '0', fnc.toString(16) )
		+ this.board.lpad( 4, '0', this.valueEncode2(val0) );
  if(msg.length != 9) throw new Error("Stepper message encoding problem");
  this.board.write(msg);
};


Stepper.prototype.setInterface = function (inf) {
  console.log("Setting interface to ", inf);
  this.command(1,inf);
}

Stepper.prototype.setPin1 = function (pin) {
  this.command(2,pin);
}

Stepper.prototype.setPin2 = function (pin) {
  this.command(3,pin);
}

Stepper.prototype.setPin3 = function (pin) {
  this.command(4,pin);
}

Stepper.prototype.setPin4 = function (pin) {
  this.command(5,pin);
}

Stepper.prototype.enable = function (value) {
  this.command(6,(value != 0)?1:0);
}

Stepper.prototype.moveTo = function (value) {
  this.command(7,value);
}

Stepper.prototype.move = function (value) {
  this.command(8,value);
}

Stepper.prototype.enableContinuous = function (value) {
  this.command(9,(value != 0)?1:0);
}
Stepper.prototype.setMaxSpeed = function (value) {
  this.command(10,value);
}

Stepper.prototype.setAcceleration = function (value) {
  this.command(11,value);
}

Stepper.prototype.setSpeed = function (value) {
  this.command(12,value);
}

module.exports = Stepper;
