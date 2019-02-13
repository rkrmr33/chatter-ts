/// <reference path="./interfaces.d.ts" />
import React from 'react';

import ChatPreview from './ChatPreview';

let dataStream : any;

export default class ChatList extends React.Component <IChatListProps, IChatListState> {

  constructor(props : IChatListProps) {
    super(props);

    this.state = { chatList : props.chatList };
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.componentCleanup);

    let queryString : any;
    if (this.state.chatList)
      queryString = Object.keys(this.state.chatList).join(',');

    try {
      dataStream = new EventSource(`/api/stream/all_chats/${queryString}`);
      dataStream.addEventListener('user-enter', this.handleUsersEvents);
      dataStream.addEventListener('user-quit', this.handleUsersEvents);
  
    } catch (e) {
      console.error(e);
    }
  }

  componentCleanup = () => {
    if (dataStream)
      dataStream.close();
  }

 handleUsersEvents = (e : any) : void => {
    if (this.state.chatList) {
      const data = JSON.parse(e.data);
      const chatsObj = this.state.chatList;
      switch (e.type) {
        case 'user-enter':
          chatsObj[data.chatId].users.push(data.username);
          break;
        case 'user-quit':
          chatsObj[data.chatId].users = chatsObj[data.chatId].users.filter((user : any) => user !== data.username);
          break;
        default: break;
      }

      this.setState({ chatList:  chatsObj });
    }
  }



  render() {
    return (
      <div className="ui celled list nine wide column" id="mainDiv">
        { Object.keys(this.state.chatList).map(chatId => <ChatPreview key={chatId} onChatClick={this.props.onChatClick} chat={this.state.chatList[chatId]}/> ) }
      </div>
    );
  }
}