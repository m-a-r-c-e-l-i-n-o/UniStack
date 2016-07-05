import React from 'react';

class Polygon {
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }
    get area() {
        return this.calcArea();
    }
    calcArea() {
        return this.height * this.width;
    }
}

const HelloWorld = () => (
    <h1>Hello World!</h1>
)

export default HelloWorld
