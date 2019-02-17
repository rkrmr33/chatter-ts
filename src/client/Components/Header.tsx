/// <reference path="./interfaces.d.ts" />
import React from 'react';
import {Routes} from '../App';

function isLoggedInRightMenu(props : IHeader) {
  
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
      <a className={props.display === Routes.SIGN_UP ? 'active item' : 'item'} onClick={props.goToSignup}>Sign up</a>
      <a className={props.display === Routes.LOG_IN ? 'active item' : 'item'} onClick={props.goToLogin}>Log in</a>
    </div>
  );
}

function isLoggedInLeftMenu(props : IHeader) {
  
  if(props.user) {
    return (
      <a className={props.display === Routes.CHAT_CREATION ? 'active item' : 'item'} onClick={() => {props.goToChatCreation()}}>
        Create a chat
      </a>
    );
  }
  return ;
}

export default function Header(props : IHeader) {
  return (
    <div className=" sixteen wide column">
		<div id="header-menu" className="ui secondary pointing menu">
			<a className={props.display === Routes.MAIN ? 'active item' : 'item'} href="/">
				<span>
					<img id="header-icon" src="/chatter-icon.ico"></img>
				Chatter
				</span>
			</a>
			{ isLoggedInLeftMenu(props) }
			{ isLoggedInRightMenu(props) }
		</div>
	</div>
  );
};



