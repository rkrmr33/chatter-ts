/// <reference path="./interfaces.d.ts" />
import React from 'react';

export default function Message (props : IMessageProps) {
  return (          // if user is logged in and not already in the votes list of the message, than it is able to vote
		<div className={(props.currentUser && props.message.votes.indexOf(props.currentUser.username) <= -1 ) ? 'item message-item' : 'item'}
				 onClick={(props.currentUser && props.message.votes.indexOf(props.currentUser.username) <= -1 ) ? () => {props.voteMessage(props.message)} : ()=>{} }>
				<img src={props.message.user.avatar} className="ui avatar image chat-image"/>
				<div className="metadata">
            <div className="ui horizontal label" id="commentUser" style={{ backgroundColor: props.message.user.specialColor }}>
              { props.message.user.username }
            </div>
						{ new Date(props.message.timestamp).toLocaleTimeString() }
						
					<span id="vote-option" className="votes info"><a className="ui label"><i className="plus icon"></i><b>1</b></a></span>
					<a id="vote-counter" className="ui label"><i className="icon thumbs up outline"></i>{props.message.votes.length}</a>
				</div>
				<div className="content message-content">
						{ props.message.body }
				</div>
			</div>);
};