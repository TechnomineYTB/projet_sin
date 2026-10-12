#include "link.h"


void avancer() {
  digitalWrite(motor_pin1, HIGH);
  digitalWrite(motor_pin2, LOW);
  digitalWrite(motor_pin3, HIGH);
  digitalWrite(motor_pin4, LOW);
}

void reculer() {
  digitalWrite(motor_pin1, LOW);
  digitalWrite(motor_pin2, HIGH);
  digitalWrite(motor_pin3, LOW);
  digitalWrite(motor_pin4, HIGH);
}

void tournerGauche() {
  digitalWrite(motor_pin1, LOW);
  digitalWrite(motor_pin2, HIGH);
  digitalWrite(motor_pin3, HIGH);
  digitalWrite(motor_pin4, LOW);
}

void tournerDroite() {
  digitalWrite(motor_pin1, HIGH);
  digitalWrite(motor_pin2, LOW);
  digitalWrite(motor_pin3, LOW);
  digitalWrite(motor_pin4, HIGH);
}

void arreter() {
  digitalWrite(motor_pin1, LOW);
  digitalWrite(motor_pin2, LOW);
  digitalWrite(motor_pin3, LOW);
  digitalWrite(motor_pin4, LOW);
}