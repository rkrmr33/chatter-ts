/// <reference path="./Components/interfaces.d.ts" />
import React, { Component } from 'react';
import { AxiosPromise } from 'axios';

import Header from './Components/Header';
import ChatList from './Components/ChatList';
import ChatRoom from './Components/ChatRoom';
import Signup from './Components/Signup';
import Login from './Components/Login';
import ChatCreation from './Components/ChatCreation';


// utils file will be imported once the document has been defined
let util : any;
let votesEventSource : any;

export enum Routes{
  MAIN = 0,
  CHAT_ROOM = 1,
  SIGN_UP = 2,
  LOG_IN = 3,
  CHAT_CREATION = 4
}

class App extends Component<any, IAppState> {

  constructor(props: any) {
    super(props);
    this.state = props;
  }

  componentDidMount() {

    window.onfocus = () => {
      this.forceUpdate();
    };

    // Load utils and apply nProgress progress bar
    util = require('./util');

    // try to re-login user using the session token
    this.authenticate();

    // determain initial status and push it to the history state
    switch (this.state.display) {
      case Routes.MAIN:
        history.replaceState(this.state, 'Chatter', `/`);
        break;
      case Routes.CHAT_ROOM:
        if(this.state.currentChat) {
          let chatName = this.state.currentChat.chatName.replace(' ', '_');
          history.replaceState(this.state, this.state.currentChat.chatName, `/c/${chatName}`);
        }
        break;
      case Routes.SIGN_UP:
        history.replaceState(this.state, 'Signup', '/create_account');
        break;
      case Routes.LOG_IN:
        history.replaceState(this.state, 'Login', '/login');
        break;
      case Routes.CHAT_CREATION:
        history.replaceState(this.state, 'Create a chat', '/create_chat');
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
          if (this.state.currentChat) {
            let chatName = this.state.currentChat.chatName.replace(' ', '_');
            history.pushState(this.state, result.currentChat.chatName, `/c/${chatName}`);
          }
        });
      });
  }

  loadLogin = () : void => {
    this.setState({
      display: Routes.LOG_IN,
    }, () => {
      history.pushState(this.state, 'Login', `/login`);
    });
  }

  loadSignup = () : void => {
    this.setState({
        display: Routes.SIGN_UP,
      }, () => {
        history.pushState(this.state, 'Signup', `/create_account`);
      });
  }

  loadChatCreation = () : void => {
    this.setState({
      display: Routes.CHAT_CREATION
    }, () => {
      history.pushState(this.state, 'Create a chat', `/create_chat`);
    })
  }

  login = (credentials:any) : AxiosPromise => {
    return util.login(credentials)
      .then((result : any) => {
        if (result.success) {
          this.setState({ user: result.user },
             () => this.loadMain());
        }
        return result;
      })
  }

  logout = () : void => {
    util.logout()
      .then((result : boolean) => {
        if(result) {
          this.setState({ user: undefined }, () => {
            this.loadMain();
            history.replaceState(this.state, '');
          })
        }
        else {
          console.log('tried to logout with-out user token');
        }
      })
  }

  authenticate = () : void => {
    util.authenticate()
      .then((user : any) => {
        if (!user) {
          this.setState({ user: undefined }, () => {
            history.replaceState(this.state, '');
          });
        }
        else {
          this.setState({ user }, () => {
            history.replaceState(this.state, '');
            if (this.state.user) {
              votesEventSource = new EventSource(`/api/stream/users/${this.state.user.username}`);
              votesEventSource.addEventListener('new-vote', this.handleUserGainedVotes);
            }
          });
        }
      })
  }

  handleUserGainedVotes = (e : any) : void => {

    const currentUser = this.state.user;
    if (currentUser) {
      currentUser.cp = currentUser.cp as any + 1;
      currentUser.votes = currentUser.votes as any + 1;
      this.setState({
        user: currentUser
      });
    }
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
        return (<Signup 
                  login={this.login}
                  goToLogin={this.loadLogin}
                  goToChatter={this.loadMain}
                  user={ this.state.user }
                  />)
      case Routes.LOG_IN:        // route: '/login'
        return (<Login 
                  login={this.login}
                  goToSignup={this.loadSignup}
                  goToChatter={this.loadMain}
                  user={ this.state.user }
                  />)
      case Routes.CHAT_CREATION: // route: '/create_chat'
        return (<ChatCreation
                  goToChatter={this.loadMain}
                  user={ this.state.user }
                  />)
      default:
        return `Something went wrong, the initial data is: ${JSON.stringify(this.props.__INITIAL_DATA__)}`;
    }
  }

  render() {
    return (
      <div id="flexer" className="ui grid">
        <Header 
          goToChatter={this.loadMain}
          goToChatCreation={this.loadChatCreation}
          goToLogin={this.loadLogin}
          goToSignup={this.loadSignup}
          user={this.state.user}
          logout={this.logout}
          display={this.state.display} />

          { this.contentSwitch() }
      </div>
    );
  }
}

export default App;