/// <reference path="./Components/interfaces.d.ts" />
import React, { Component } from 'react';

import Header from './Components/Header';
import ChatList from './Components/ChatList';

// utils file will be imported once the document has been defined
let util : any;

class App extends Component<IApp, IApp> {

  constructor(props: any) {
    super(props);
    this.state = {
      display: props.display,
      chatRooms: props.chats
    }
  }

  componentDidMount() {
    console.log(this.state);
    util = require('./util');
  }

  loadMain = () : void => {
    util.fetchAllChats()
      .then((chats : any) => {
        this.setState({
          chatRooms: chats
        });
      })
  }

  loadChat(chatId : string) {
    console.log(chatId);
  }

  loadLogin() {

  }

  loadSignup() {

  }

  logout() {

  }

  contentSwitch() {
    switch(this.state.display) {
      case 'main':
        return (<ChatList onChatClick={this.loadChat} chatList={this.state.chatRooms} />);
    }
  }

  render() {
    return (
      <div id="flexer" className="ui grid">
        <Header 
          goToChatter={this.loadMain}
          goToLogin={this.loadLogin}
          goToSignup={this.loadSignup}
          user={this.state.user}
          logout={this.logout} />

          { this.contentSwitch() }
      </div>
    );
  }
}

export default App;