/// <reference path="./interfaces.d.ts" />
import React from 'react';

function handleClick(props: IChatPreview) : void {
  props.onChatClick(props.chat._id);
}

export default function ChatPreview(props : IChatPreview) {
  return (
    <div className="item" onClick={ () => { handleClick(props) } }>
      <img className="ui avatar image chat-preview-icon" src={ props.chat.chatImage } />
      <div className="content">
        <div className="header"><span>{ props.chat.chatName }</span></div>
          { props.chat.chatDescription }
      </div>
      <div className="right floated content">
        <span className="userCount">{props.chat.users.length} </span><i className="user circle icon"></i>
      </div>
    </div>
  );
}