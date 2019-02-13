/// <reference path="./interfaces.d.ts" />
import React from 'react';

function isLoggedIn(props : IHeader) {
  /* 
  <img className="ui avatar image" src={props.user.avatar} id="userImg" />
  <div id="userLabel" className="ui horizontal label" style={{backgroundColor: `#${props.user.specialColor}`}}>{props.user.username}</div>
  <a id="logout-btn" className="item" onClick={props.logout}>Log out</a>
  */
  if(props.user) {
    return (
      <div className="right menu">
          <a className="ui image label" id="userParentItem" style={{backgroundColor: `#${props.user.specialColor}`}}>
            <img src={props.user.avatar} />
            {props.user.username}
            <div className="detail"><img src="/CP.png"/> {props.user.cp}</div>
            <div className="detail"><i className="icon thumbs up outline"></i> {props.user.votes}</div>
            <div id="logout-btn" className="detail" onClick={props.logout}>Log out</div>
          </a>
      </div>
    );
  }
  return (
    <div className="right menu">
      <a className="item" onClick={props.goToSignup}>Sign up</a>
      <a className="item" onClick={props.goToLogin}>Log in</a>
    </div>
  );
}

export default function Header(props : IHeader) {
  return (
    <div className=" sixteen wide column">
		<div id="header-menu" className="ui secondary pointing menu">
			<a className="active item" onClick={props.goToChatter}>
				<span>
					<img id="header-icon" src="/chatter-icon.ico"></img>
				Chatter
				</span>
			</a>
			<a className="item">
				Chats
			</a>
			{ isLoggedIn(props) }
		</div>
	</div>
  );
};



