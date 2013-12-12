//#include <Servo.h>
#include <AccelStepper.h>

bool debug = false;

int index = 0;

char messageBuffer[20];
char cmd[3];
char pin[3];
char val[4];
char aux[4];
/*
Servo servo;
*/
AccelStepper steppers[3];

struct StepperSettings {
    int type;
    int pin1;
    int pin2;
    int pin3;
    int pin4;
    int enabled;
    int continuous;
} settings[3];


void setup()
{
    Serial.begin(115200);
};


void loop()
{
    if (Serial.available() > 0) {
	char x = Serial.read();
	if (x == '!') {
	    index = 0;		// start
	} else if (x == '.') {
	    process();		// end
	} else {
	    messageBuffer[index++] = x;
            messageBuffer[index] = '\0';
        }
	/* TODO fix buffer overflow if no . is given */
    }
    for (int i = 0 ; i < 3 ; i++){
      if (settings[i].enabled){
        if (settings[i].continuous != 0){
          steppers[i].runSpeed();
        } else {
          steppers[i].run();
        }
      }
    }
    //Serial.println("pause\n");
}

/*
 * Deal with a full message and determine function to call
 */
void process()
{
//  index = 0;

    strncpy(cmd, messageBuffer, 2);
    cmd[2] = '\0';
    strncpy(pin, messageBuffer + 2, 2);
    pin[2] = '\0';

    if (atoi(cmd) > 90) {
	strncpy(val, messageBuffer + 4, 2);
	val[2] = '\0';
	strncpy(aux, messageBuffer + 6, 3);
	aux[3] = '\0';
    } else {
	strncpy(val, messageBuffer + 4, 3);
	val[3] = '\0';
	strncpy(aux, messageBuffer + 7, 3);
	aux[3] = '\0';
    }

    if (debug) {
	Serial.println(messageBuffer);
    }
    int cmdid = atoi(cmd);

    // Serial.println(cmd);
    // Serial.println(pin);
    // Serial.println(val);
    // Serial.println(aux);

    switch (cmdid) {
    case 0:
	sm(pin, val);
	break;
    case 1:
	dw(pin, val);
	break;
    case 2:
	dr(pin, val);
	break;
    case 3:
	aw(pin, val);
	break;
    case 4:
	ar(pin, val);
	break;
    case 88:
	handleStepper(messageBuffer);
	break;
    case 97:
	handlePing(pin, val, aux);
	break;
    case 98:
	handleServo(pin, val, aux);
	break;
    case 99:
	toggleDebug(val);
	break;
    default:
	break;
    }
}

/*
 * Toggle debug mode
 */
void toggleDebug(char *val)
{
    if (atoi(val) == 0) {
	debug = false;
	Serial.println("goodbye");
    } else {
	debug = true;
	Serial.println("hello");
    }
}

/*
 * Set pin mode
 */
void sm(char *pin, char *val)
{
    if (debug)
	Serial.println("sm");
    int p = getPin(pin);
    if (p == -1) {
	if (debug)
	    Serial.println("badpin");
	return;
    }
    if (atoi(val) == 0) {
	pinMode(p, OUTPUT);
    } else {
	pinMode(p, INPUT);
    }
}

/*
 * Digital write
 */
void dw(char *pin, char *val)
{
    if (debug)
	Serial.println("dw");
    int p = getPin(pin);
    if (p == -1) {
	if (debug)
	    Serial.println("badpin");
	return;
    }
    pinMode(p, OUTPUT);
    if (atoi(val) == 0) {
	digitalWrite(p, LOW);
    } else {
	digitalWrite(p, HIGH);
    }
}

/*
 * Digital read
 */
void dr(char *pin, char *val)
{
    if (debug)
	Serial.println("dr");
    int p = getPin(pin);
    if (p == -1) {
	if (debug)
	    Serial.println("badpin");
	return;
    }
    pinMode(p, INPUT);
    int oraw = digitalRead(p);
    char m[7];
    sprintf(m, "%02d::%02d", p, oraw);
    Serial.println(m);
}

/*
 * Analog read
 */
void ar(char *pin, char *val)
{
    if (debug)
	Serial.println("ar");
    int p = getPin(pin);
    if (p == -1) {
	if (debug)
	    Serial.println("badpin");
	return;
    }
    pinMode(p, INPUT);		// don't want to sw
    int rval = analogRead(p);
    char m[8];
    sprintf(m, "%s::%03d", pin, rval);
    Serial.println(m);
}

void aw(char *pin, char *val)
{
    if (debug)
	Serial.println("aw");
    int p = getPin(pin);
    pinMode(p, OUTPUT);
    if (p == -1) {
	if (debug)
	    Serial.println("badpin");
	return;
    }
    analogWrite(p, atoi(val));
}

int getPin(char *pin)
{				//Converts to A0-A5, and returns -1 on error
    int ret = -1;
    if (pin[0] == 'A' || pin[0] == 'a') {
	switch (pin[1]) {
	case '0':
	    ret = A0;
	    break;
	case '1':
	    ret = A1;
	    break;
	case '2':
	    ret = A2;
	    break;
	case '3':
	    ret = A3;
	    break;
	case '4':
	    ret = A4;
	    break;
	case '5':
	    ret = A5;
	    break;
	default:
	    break;
	}
    } else {
	ret = atoi(pin);
	if (ret == 0 && (pin[0] != '0' || pin[1] != '0')) {
	    ret = -1;
	}
    }
    return ret;
}

/*
 * Handle Ping commands
 * fire, read
 */
void handlePing(char *pin, char *val, char *aux)
{
    if (debug)
	Serial.println("ss");
    int p = getPin(pin);

    if (p == -1) {
	if (debug)
	    Serial.println("badpin");
	return;
    }
    Serial.println("got signal");

    // 01(1) Fire and Read
    if (atoi(val) == 1) {
	char m[16];

	pinMode(p, OUTPUT);
	digitalWrite(p, LOW);
	delayMicroseconds(2);
	digitalWrite(p, HIGH);
	delayMicroseconds(5);
	digitalWrite(p, LOW);

	Serial.println("ping fired");

	pinMode(p, INPUT);
	sprintf(m, "%s::read::%08d", pin, pulseIn(p, HIGH));
	Serial.println(m);

	delay(50);
    }
}

/*
 * Handle Servo commands
 * attach, detach, write, read, writeMicroseconds, attached
 */
void handleServo(char *pin, char *val, char *aux)
{
/*
  if (debug)
	Serial.println("ss");
    int p = getPin(pin);
    if (p == -1) {
	if (debug)
	    Serial.println("badpin");
	return;
    }
    Serial.println("signal: servo");

    // 00(0) Detach
    if (atoi(val) == 0) {
//	servo.detach();
	char m[12];
	sprintf(m, "%s::detached", pin);
	Serial.println(m);

	// 01(1) Attach
    } else if (atoi(val) == 1) {
	// servo.attach(p, 750, 2250);
//	servo.attach(p);
	char m[12];
	sprintf(m, "%s::attached", pin);
	Serial.println(m);

	// 02(2) Write
    } else if (atoi(val) == 2) {
	Serial.println("writing to servo");
	Serial.println(atoi(aux));
	// Write to servo
//	servo.write(atoi(aux));
	delay(15);

	// TODO: Experiment with microsecond pulses
	// digitalWrite(pin, HIGH);   // start the pulse
	// delayMicroseconds(pulseWidth);  // pulse width
	// digitalWrite(pin, LOW);    // stop the pulse

	// 03(3) Read
    } else if (atoi(val) == 3) {
	Serial.println("reading servo");
//	int sval = servo.read();
	char m[13];
//	sprintf(m, "%s::read::%03d", pin, sval);
	Serial.println(m);
    }
    */
}

char print_buf[40];




void handleStepper(char *buffer)
{
    /* format 881 [ func func] [val val val val] */
    if (index != 3 + 2 + 4) {
	Serial.println("Buffer does not have the correct size\n");
	return;
    };

    /* sanity checks */
    if (buffer[2] < '0' || buffer[2] > '3') {
	Serial.println("Invalid stepper");
	return;
    }

    char stepperid =  buffer[2] - '0';	/* stepper id is BCD encoded */
    int stepper_index = stepperid -1;
    
    /* fnc and the value are hex encoded */
    char tmp[5];
    memcpy(tmp,&buffer[3],2);
    tmp[2] = '\0';
    char fnc = (char)strtoul(tmp, NULL, 16);

    memcpy(tmp,&buffer[5],4);
    tmp[4] = '\0';
    int v =strtoul(tmp, NULL, 16);
    //Serial.println(tmp);
    
    if (fnc == 0) {
	Serial.println("invalid function id\n");
	return;
    };
    
    switch (fnc) {
    case 0x01:
	settings[stepper_index].type = v;
	break;
    case 0x02:
	settings[stepper_index].pin1 = v;
	break;
    case 0x03:
	settings[stepper_index].pin2 = v;
	break;
    case 0x04:
	settings[stepper_index].pin3 = v;
	break;
    case 0x05:
	settings[stepper_index].pin4 = v;
	break;
    case 0x06:
	{
	    settings[stepper_index].enabled = (v !=0 )?1:0;
            //Serial.write("st=");
             Serial.println(settings[stepper_index].type);
            steppers[stepper_index] = AccelStepper(
                      settings[stepper_index].type,
		      settings[stepper_index].pin1,
		      settings[stepper_index].pin2,
		      settings[stepper_index].pin3,
		      settings[stepper_index].pin4);

	              Serial.write("se\n");
	};
	break;
      case 0x07: { steppers[stepper_index].moveTo(v);} ; 
        break;
      case 0x08: { steppers[stepper_index].move(v);} ; 
        break;
      case 0x09: { settings[stepper_index].continuous= (v !=0)?1:0;} ; 
        break;
      case 0x0a: { steppers[stepper_index].setMaxSpeed(v);} ; 
         break;
      case 0x0b: { steppers[stepper_index].setAcceleration(v);} ; 
         break;
      case 0x0c: { steppers[stepper_index].setSpeed(v);} ; 
         break;
    default:
	{
	    snprintf(print_buf, 40, "Error function %d not defined \n",
		     fnc);
	    Serial.write(print_buf);
	};
	break;
    }
}
