import React from 'react';

export default class HelloWorld extends React.Component {

    constructor(props) {

        super( props );
        this.state = { text: 'Quiet...' };
    }

    sayHello() {

        this.setState( {
            text: 'Hello World!'
        } );
    }

    render() {
        return <h1 onClick={this.sayHello.bind(this)}>{this.state.text}</h1>;
    }
}
