/// <reference path="./interfaces.d.ts" />
import React from 'react';

function isLoggedIn(props : IHeader) {
  if(props.user) {
    return (
      <div className="right menu">
        <a className="item" onClick={props.logout}>Log out</a>
        <a className="item">
          <div id="userLabel" className="ui horizontal label" style={{backgroundColor: `#${props.user.specialColor}`}}>{props.user.username}</div>
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



