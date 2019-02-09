/// <reference path="./Components/interfaces.d.ts" />
import React, { Component } from 'react';

import Header from './Components/Header';
import ChatList from './Components/ChatList';
import ChatRoom from './Components/ChatRoom';


// utils file will be imported once the document has been defined
let util : any;

export enum Routes{
  MAIN = 0,
  CHAT_ROOM = 1,
  SIGN_UP = 2,
  LOG_IN = 3
}

class App extends Component<any, IAppState> {

  constructor(props: any) {
    super(props);
    this.state = props;
  }

  componentDidMount() {

    // Load utils and apply nProgress progress bar
    util = require('./util');

    
    // determain initial status and push it to the history state
    switch (this.state.display) {
      case Routes.MAIN:
        history.replaceState(this.state, 'Chatter', `/`);
        break;
      case Routes.CHAT_ROOM:
        if(this.state.currentChat)
          history.replaceState(this.state, this.state.currentChat.chatName, `/c/${this.state.currentChat.chatName}`);
        break;
      case Routes.SIGN_UP:
        history.replaceState(this.state, 'Signup', '/create_account');
        break;
      case Routes.LOG_IN:
        history.replaceState(this.state, 'Login', '/login');
        break;
      default:
        console.log(`[-] Something went wrong, the initial data is: ${this.props.__INITIAL_DATA__}`);
        break;
    }

		// removes the unneeded initial data variable from the global object
		delete (window as any).__INITIAL_DATA__;

		// handle popstate event
		window.addEventListener('popstate', e => {
			this.setState(e.state);
		});
  }

  loadMain = () : void => {
    util.fetchAllChats()
      .then((chats : any) => {
        this.setState({
          display: Routes.MAIN,
          chatRooms: chats
        }, () => {
          // push a new state to the history object
			    history.pushState(this.state, 'Chatter', '/');
        });
      });
  }

  loadChat = (chatId : string) : void => {
    util.fetchChatAndMessagesById(chatId)
      .then((result : any) => {
        this.setState({
          display: Routes.CHAT_ROOM,
          currentChat: result.currentChat,
          messages: result.messages
        }, () => {
          history.pushState(this.state, result.currentChat.chatName, `/c/${result.currentChat.chatName}`);
        });
      });
  }

  loadLogin() {

  }

  loadSignup() {

  }

  logout() {

  }

  contentSwitch() {
    switch(this.state.display) {
      case Routes.MAIN:          // route: '/'
        return (<ChatList onChatClick={this.loadChat} chatList={this.state.chatRooms} />);
      case Routes.CHAT_ROOM:     // route: '/chat/[chatName]'
        return (<ChatRoom 
                  chat={ this.state.currentChat }
                  user={ this.state.user }
                  messages={ this.state.messages }
                  goToLogin={ this.loadLogin }
                  goToSignup={ this.loadSignup }
                  />)
      case Routes.SIGN_UP:       // route: '/create_account'
        return;
      case Routes.LOG_IN:        // route: '/login'
        return;
      default:
        return `Something went wrong, the initial data is: ${JSON.stringify(this.props.__INITIAL_DATA__)}`;
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