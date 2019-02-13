/// <reference path="./interfaces.d.ts" />
import React, { ReactNode } from 'react';
import Message from './Message';
import { text } from 'body-parser';

let scrollTarget : HTMLDivElement | null;
let dataStream : any;
let util : any;
let enteredChat : boolean = false;

class ChatRoom extends React.Component <IChatRoomProps, IChatRoomState>{
  constructor(props : IChatRoomProps) {
    super(props);

    this.state = {
      messages: props.messages,
      users: (props.chat as IChat).users,
      loading: true
    }

    enteredChat = false;
  }

  componentDidMount() {

    window.addEventListener('beforeunload', this.componentCleanup);

    this.logoutBail();

    // import utils after initial load
    util = require('../util');

    try {
      if (this.props.chat)
        dataStream = new EventSource(`/api/stream/${this.props.chat._id}`);
      
      // when the connection is open stop loading
      dataStream.onopen = () => {
        this.setState({loading: false});
        if (!enteredChat && this.props.user) {
          this.addUserToChatRoom();
        }
      }

      dataStream.addEventListener('new-message', this.handleMessagesEvents);
      dataStream.addEventListener('user-enter', this.handleUsersEvents);
      dataStream.addEventListener('user-quit', this.handleUsersEvents);
      
    } catch (err) {
      throw err;
    }
  }

  componentWillUnmount() {
    this.componentCleanup();
    window.removeEventListener('beforeunload', this.componentCleanup);
  }

  componentDidUpdate() {
    if (!enteredChat && this.props.user) {
      this.addUserToChatRoom();
    }
    this.ScrollDown();
  }

  componentCleanup = () => {
    if (this.props.chat && this.props.user)
    util.quitChat(this.props.user.username, this.props.chat._id)
    if (dataStream) {
      dataStream.close();
    }
  }

  /***
   *  if a user clicks on logout, handle the leave before the state cleans
   **/
  logoutBail = () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        this.componentCleanup();
      });
    }
  }

  /**
   *   EVENTS HANDLERS
   */

  // Handles Messages Events
  handleMessagesEvents = (e : any) : void => {
    const newMessage = JSON.parse(e.data) as IMessage;
    const chatMessages = this.state.messages;
    if (chatMessages && newMessage) {
      chatMessages.push(newMessage);
      this.setState({ messages: chatMessages })
    }
    
  }

  // Handles Users Events
  handleUsersEvents = (e : any) : void => {
    let users = this.state.users;

    if (users) {
      switch (e.type) {
        case 'user-enter':
          users.push(e.data);
          break;
        case 'user-quit':
          users = users.filter(user => user !== e.data);
          break;
        default: break;
      }

      // update users list
      this.setState({ users });
    }

  }

  addUserToChatRoom = () : void => {
    enteredChat = true;
    if (this.props.user && this.props.chat)
      util.enterChat(this.props.user.username, this.props.chat._id);
  };

  sendMessage = (e : any) : void => {
    e.preventDefault();

    const messageText = document.getElementById('messageText') as HTMLInputElement;

    if (messageText && messageText.value && this.props.chat && this.props.user) {
      const message = {
        chatId: this.props.chat._id,
        user: {
          username: this.props.user.username,
          specialColor: this.props.user.specialColor,
          avatar: this.props.user.avatar
        },
        body: messageText.value,
        votes: [],
        timestamp: new Date()
      };

      util.sendMessage(message)
        .then((sentMessage : any)=> {
          if (sentMessage) {
            messageText.value = '';
          }
        })
    }
  };

  /**
   * This function grabs all the messages we fetched from the
   * db, related to this chat-room id, and then displays them
   * all. If there are not messages at all, display a default
   * message.
   */
  loadFetchedMessages = () : ReactNode => {
    if(this.props.chat && (!this.state.messages || this.state.messages.length == 0)) {
      // if there are no messages in the chat, sends a default message inviting people to chat.
			return (<Message 
				{...{
					_id: '1234567890',
					chatId: this.props.chat._id,
					user: { username: 'Chatter Bot', specialColor:'#be28d2', avatar: '/chatter-icon.ico'},
					body: 'There are no messages on this chat yet... C\'mon! Be the first to send a message! ; )',
          timestamp: new Date().toString(),
          votes: []
				}}
				/>);
      }
      // if there are any messages fetched from the db, loads them and display in the chat.
			else if (this.state.messages) {
				const messagesMarkup = this.state.messages.map(m => <Message key={m._id} {...m}/>);
				return messagesMarkup;
			}
  }

  /**
   * This shows an input form to send messages if the users
   * is logged in. otherwise, it tells the user he needs to
   * log in or sign up.
   */
  restrictGuests = (user : IUser | undefined) : ReactNode => {
    if (user) {
      return (
				<div className="ui action input" id="input-segment">
					<input id="messageText" type="text" placeholder="Type a message..." autoFocus/>
					<button type="submit" id="sendButton" className="ui blue button">Send</button>
				</div>);
    }

    return (
      <div className="ui action input" id="input-segment">
        <div className="ui message center aligned" id="needUser">
          You need a <b className="chatter-color">Chatter</b> account to send messages in chatrooms.
          You can <a id="link" onClick={this.props.goToSignup}>sign up</a> now.
          Or, if you already have an account <a id="link" onClick={this.props.goToLogin}>log in</a> here.
        </div>
      </div>);
  };


  /**
   * When called, makes the chat scroll down, to display the
   * last messages that was sent.
   */
  ScrollDown = () : void => {
    if (scrollTarget)
      scrollTarget.scrollIntoView({ behavior: 'smooth' });
  };

  render() {
    if (this.props.chat && this.state.messages && this.state.users) 
      return (
        <div className="eleven wide column chatroom-container">
          <form onSubmit={this.sendMessage}>
            <div className="chatFlex">
              <div id="chat-header-container" className="ui top attached purple segment">
                <div>
                  <img src={this.props.chat.chatImage} id="true-circle" className="ui circular image" />
                  <h3>
                    {this.props.chat.chatName}
                  </h3>
                  <p><i className="certificate icon chatter-color"></i><b>{this.props.chat.chatOwner}</b></p>
                </div>
                <div className="messagesCount">{this.state.messages.length} <i className="envelope icon"></i></div>
                <div className="inChatUsersCount">{this.state.users.length} <i className="user icon"></i></div>
              </div>

              <div className={this.state.loading ? 'ui loading form chat-area' : 'chat-area'} id="scroll">
                <div className="ui celled list" id="messages-list">
                  { this.loadFetchedMessages() }
                </div>
                <div style={{float:'left', clear:'both'}} ref={ st => { scrollTarget = st } }></div>
              </div>
              { this.restrictGuests(this.props.user) }
            </div>
          </form>
        </div>
      );
    else return <div>sorry :\</div>
	}
}

export default ChatRoom;