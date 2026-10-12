#include "link.h"

int motor_pin1 = 4;  // Broche 1 pour le contrôle moteur
int motor_pin2 = 5;  // Broche 2 pour le contrôle moteur
int motor_pin3 = 6;  // Broche 3 pour le contrôle moteur
int motor_pin4 = 7;  // Broche 4 pour le contrôle moteur


void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
    // Configuration des broches des moteurs en tant que sorties (OUTPUT) pour envoyer du courant
  pinMode(motor_pin1, OUTPUT);
  pinMode(motor_pin2, OUTPUT);
  pinMode(motor_pin3, OUTPUT);
  pinMode(motor_pin4, OUTPUT);
}

void loop() {
    
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 'd') {tournerDroite();}
    if (c == 'g') {tournerGauche();}
    if (c == 'a') {avancer();}
    if (c == 'r') {reculer();}
    if (c == 's') {arreter();}
  }
}
