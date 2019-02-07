import React, { Component } from 'react';

class App extends Component {

  constructor(props: any) {
    super(props);
    this.state = (props as any).__INITIAL_DATA__;
  }

  componentDidMount() {
    console.log('test');
  }

  render() {
    return (
      <div>
        asdasd
      </div>
    );
  }
}

export default App;