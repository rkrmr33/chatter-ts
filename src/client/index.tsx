import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

const global = (window as any);
console.log('hello');
ReactDOM.hydrate(<App {...global.__INITIAL_DATA__}/>, document.getElementById('root'));