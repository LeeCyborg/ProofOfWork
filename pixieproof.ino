/*
  Do not look into Pixie with remaining eye!
*/

#include "SoftwareSerial.h"
#include "Adafruit_Pixie.h"

#define NUMPIXELS 3
#define PIXIEPIN  6
int counter = 0;
int diff = 1;
#define threshold 500
#define baud 115200
SoftwareSerial pixieSerial(-1, PIXIEPIN);

Adafruit_Pixie strip = Adafruit_Pixie(NUMPIXELS, &pixieSerial);
void setup() {
  pixieSerial.begin(baud); // Pixie REQUIRES this baud rate
  //Serial.begin(baud);  // <- pixies
  strip.setBrightness(100);
}

void loop() {
  Serial.println(analogRead(0));
  if (analogRead(0) > 300) {
    counter+=diff;
    Serial.println("ping");
    if (counter > 255) {
      Serial.println("boop");
      for (int i = 0; i < random(0, 10); i++) {
        colorWipe(strip.Color(random(255), random(255), 0), 50);
        delay(50);
        colorWipe(strip.Color(0, 0, 0), 50);
        delay(50);
        colorWipe(strip.Color(0, random(255), random(255)), 50);
        delay(50);
        colorWipe(strip.Color(0, 0, 0), 50);
        delay(50);
        colorWipe(strip.Color(random(255), 0, random(255)), 50);
        delay(50);
        colorWipe(strip.Color(0, 0, 0), 50); 
        delay(50);
      }
      counter = 0;
    }
  }
  for (int i = 0; i < NUMPIXELS; i++) {
    strip.setPixelColor(i, Wheel(counter));
    delay(2);
    strip.show();
  }
  if (Serial.available() > 0) {
    diff = int(Serial.read());
  }
}
void colorWipe(uint32_t c, uint8_t wait) {
  for (uint16_t i = 0; i < strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
    strip.show();
    delay(wait);
  }
}
uint32_t Wheel(int WheelPos) {
  if (WheelPos < 85) {
    return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
  } else if (WheelPos < 170) {
    WheelPos -= 85;
    return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  } else {
    WheelPos -= 170;
    return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
}
void setPixel(int Pixel, byte red, byte green, byte blue) {
#ifdef ADAFRUIT_NEOPIXEL_H
  // NeoPixel
  strip.setPixelColor(Pixel, strip.Color(red, green, blue));
#endif
}
void setAll(byte red, byte green, byte blue) {
  for (int i = 0; i < NUMPIXELS; i++ ) {
    setPixel(i, red, green, blue);
  }
  strip.show();
}
