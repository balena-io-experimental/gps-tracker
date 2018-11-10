#!/bin/env node

{
    const Gpio = require('onoff').Gpio;
    let self;
    let rgb = function() {
      'use strict';
      if (!(this instanceof rgb)) return new rgb();
      self = this;
      this.red = new Gpio(504, 'out');
      this.green = new Gpio(505, 'out');
      this.blue = new Gpio(506, 'out');
      this.colors = {
        "red": [1, 0, 0],
        "yellow": [1, 1, 0],
        "purple": [1, 0, 1],
        "green": [0, 1, 0],
        "cyan": [0, 1, 1],
        "white": [1, 1, 1],
        "blue": [0, 0, 1],
        "black": [0, 0, 0],
      };
      this.color = function(color) {
        return new Promise((resolve, reject) => {
          if (self.colors.hasOwnProperty(color)) {
            self.reset();
            self.red.writeSync(self.colors[color][0]);
            self.green.writeSync(self.colors[color][1]);
            self.blue.writeSync(self.colors[color][2]);
            resolve(color);
          } else {
            reject("The requested color:" + color + " is not supported.");
          }
        });
      };
      this.reset = function() {
        self.red.writeSync(0);
        self.green.writeSync(0);
        self.blue.writeSync(0);
      };
      this.color('black');
    };
    module.exports = rgb();
  }