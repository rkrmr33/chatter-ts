/// <reference path="./interfaces.d.ts" />
import React from 'react';

export default function Message (props : IMessage) {
  return (
    <div className="item">
				<img src={props.user.avatar} className="ui avatar image"/>
				<div className="content">
					<div className="metadata">
            <div className="ui horizontal label" id="commentUser" style={{ backgroundColor: props.user.specialColor }}>
              { props.user.username }
            </div>
						{ new Date(props.timestamp).toLocaleTimeString() }
					</div>
					{ props.body }
				</div>
			</div>);
};