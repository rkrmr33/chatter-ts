/// <reference path="./interfaces.d.ts" />
import React from 'react';


const chatNameRegex = RegExp('[a-zA-Z][a-zA-Z0-9_]{2,50}');
let util : any;
const PRICE = 10; 

export default class ChatCreation extends React.Component<IChatCreationProps, IChatCreationState> {
  constructor(props : ISignupProps) {
		super(props);

    if (props.user && props.user.cp &&  props.user.cp < PRICE) {// if the user does not have enough cp
      this.state = {
        chatName: '',
        chatDescription: '',
        chatImageUrl: '/chatter-icon.png',
        formErrors: {
          chatName: '',
          chatDescription: '',
        },
        resultMsg: '',
        notEnoughCP: 'You do not have enough Chatter-Points'
      }
    }
    else {
      this.state = {
        chatName: '',
        chatDescription: '',
        chatImageUrl: '/chatter-icon.png',
        formErrors: {
          chatName: '',
          chatDescription: '',
        },
        resultMsg: '',
        notEnoughCP: ''
      }
    }
  }

  componentDidMount() {
    util = require('../util');
	}
	
  componentWillReceiveProps(nextProps : ILoginProps) {
		if (!nextProps.user) { // if user is not logged in than go back to main page
			this.props.goToChatter();
    }
    else if (nextProps.user.cp && nextProps.user.cp < PRICE) { // user does not have enough cp to create a chat
      this.setState({notEnoughCP: 'You do not have enough Chatter-Points'});
    }
	}

  handleSubmit = (e : any) => {
    e.preventDefault();

    if(this.validate(this.state as any)) {
      const formElement = document.getElementById('registerForm');
      if (formElement)
        formElement.setAttribute('class', 'ui loading form');
      else
        return;

    if (this.props.user) {
      util.payCP(this.props.user._id, PRICE) // pay chat price
        .then((response : any) => {
          if (!response) {
            const errorMsg = 'You do not have enough Chatter-Points';
            this.setState({ resultMsg: errorMsg })
          }
          else {
            if (this.props.user) {
              const newChat : IChat = {
                chatName: this.state.chatName,
                chatDescription: this.state.chatDescription,
                chatOwner: this.props.user.username,
                chatImage: this.state.chatImageUrl,
                users: []
              }
              
              util.createChat(newChat) // create the chat
                .then((result : any) => {
                  if(result.created) {
                    formElement.setAttribute('class', 'ui form success');
                  }
                  else if(result.errors) {
                    const errors = result.errors;
                    const formErrors = this.state.formErrors;
                    Object.keys(errors).forEach(key => {
                      formErrors[key] = errors[key].msg;
                    });
                    this.setState({
                      formErrors
                    }, () => {
                      formElement.setAttribute('class', 'ui form error');
                    })
                  }
                })
            }
          }
        })

    }
    }
    else{
      const formElement = document.getElementById('registerForm');
      if (formElement)
        formElement.setAttribute('class', 'ui form error');
    }
  }

  validate = ({formErrors, ...rest} : {formErrors:any, [key:string]:string}) : boolean => {
		let valid = true;
	
		Object.keys(formErrors).forEach(key => {
			formErrors[key].length > 0 && (valid = false);  // if the error val len is more the 0 than the second operation will execute.
		});
	
		Object.keys(rest).forEach(key => {
			if(rest[key] === '' && formErrors[key] === '') {
				valid = false;
				formErrors[key] = 'is required';
				this.setState({formErrors});
			}
		});
	
		return valid;
  }

  handleChange = (e : any)=> {
		e.preventDefault();

		const {name, value} : {name:string, value:string} = e.target;
		let formErrors : IChatCreationFormErrors = this.state.formErrors;

		switch(name) {
			case 'chatName': 
				formErrors.chatName = chatNameRegex.test(value) ? '' : 'only numbers, letters and \'_\' allowed! at-least one letter';
				if(formErrors.chatName === '')
					formErrors.chatName = value.length > 2 ? '' : 'minimum 3 characters required!';
				break;
			
			case 'chatDescription': 
          formErrors.chatDescription = value.length > 2 ? '' : 'minimum 3 characters required!';
          break;

      case 'chatImageUrl': 
        if (value.length === 0)
          this.setState({ chatImageUrl: 'chatter-icon.png' });
        else {
          const img = new Image();
          img.onload = () => { this.setState({ chatImageUrl: value }) };
          img.onerror = () => {this.setState({ chatImageUrl: 'chatter-icon.png' }) };
          img.src = value;
        }
			  break;
		}

		let valid = true;
		Object.keys(formErrors).forEach(key => {
			formErrors[key] !== '' && (valid = false);
		});
		if(valid) {
      const formElement = document.getElementById('registerForm');
      if (formElement)
        formElement.setAttribute('class', 'ui form');
      else 
        console.log('[-] cannot find element with id: registerForm');
		}

		this.setState({
      formErrors: formErrors,
      [name]:value
    } as any);

  }
  
  
  checkChatName = (e : React.ChangeEvent<HTMLInputElement>) => {
		this.handleChange(e);

    const formElement = document.getElementById('registerForm');
    const chatNameFieldIcon = document.getElementById('chatNameFieldIcon');
    const chatNameField = document.getElementsByName('chatName')[0];
		const formErrors = this.state.formErrors;
		if (formErrors.chatName === '') {
      util.checkChatNameTaken(e.target.value)
        .then((taken : boolean) => {
          if (taken) {
            formErrors.chatName = 'This chat name is taken. Please choose another one.';
            this.setState({formErrors});
            if (formElement && chatNameField && chatNameFieldIcon) {
              formElement.setAttribute('class', 'ui form error');
              chatNameField.removeAttribute('class');
              chatNameFieldIcon.setAttribute('class', 'x icon red icon')
            }
          }
          else {
            if (formElement && chatNameField && chatNameFieldIcon) {
              formElement.setAttribute('class', 'ui form');
              chatNameField.setAttribute('class', 'success-field');
              chatNameFieldIcon.setAttribute('class', 'check green icon');
            }
          }
        });
    }
    else {
      if(chatNameFieldIcon) { chatNameFieldIcon.removeAttribute('class') }
      if(chatNameField) { chatNameField.removeAttribute('class') }
    }
	}
  
  render() {
		return (
			<div className="ui seven wide column" id="registrationDiv">
				<form onSubmit={this.handleSubmit}>
					<div className={this.state.notEnoughCP === '' ? 'ui form' : 'ui form error'} id='registerForm'>
						<h3 className="ui dividing header chatter-color">Create a new public chat room</h3>
            <div className="ui message">
              <a className="ui mini label"><img src="/CP.png"></img></a>
              &nbsp; Creating a chat will cost you 10 chatter-points.
            </div>
						<div className="required field">
              <div className="two fields">
                <div className="new-chat-image"><img src={this.state.chatImageUrl ? this.state.chatImageUrl : '/chatter-icon.png'}></img></div>
                
								<div className={this.state.formErrors.chatName === '' ? 'field' : 'field error'}>
                <label>Chat Name</label>
									<input type="text" placeholder="chat name (max: 50 characters)" maxLength={50} name="chatName" onChange={this.checkChatName} />
                  <i id="chatNameFieldIcon"></i>
								</div>
              </div>
						</div>
						<div className="required field">
								<div className={this.state.formErrors.chatDescription === '' ? 'field' : 'field error'}>
                <label>Chat description</label>
                <textarea rows={2} style={{marginTop: '0px', marginBottom: '0px', height: '76px' }} maxLength={250} name="chatDescription" placeholder="chat description (max: 250 characters)" onChange={this.handleChange}></textarea>
								</div>							
						</div>
						<div className="required field">
								<div className="field">
                <label>Chat image (url)</label>
									<input type="text" placeholder="chat img (url)" name="chatImageUrl" onChange={this.handleChange} />
								</div>							
						</div>
						<div id="submit-register" className={ this.state.notEnoughCP === '' ? 'ui submit button' : 'ui disabled submit button'} onClick={this.handleSubmit}>Create Chat</div>

						<div className="ui error message">
							<div className="header">Please fix the errors below:</div>
							<ul className="list">
								{ this.state.formErrors.chatName === '' ? '' : <li>Chat Name: {this.state.formErrors.chatName}</li> }
								{ this.state.formErrors.chatDescription === '' ? '' : <li>Chat Description: {this.state.formErrors.chatDescription}</li> }
                { this.state.notEnoughCP === '' ? '' : <li>{this.state.notEnoughCP}</li> }
              </ul>
						</div>
						<div className="ui warning message">
							<div className="header">{ this.state.resultMsg }</div>
						</div>
						<div className="ui success message">
							<div className="header">{this.state.chatName} chat was created</div>
							<p>Click <a href={`/c/${this.state.chatName}`}>here</a> to go there now and chat!</p>
						</div>
					</div>
					<button type="submit" style={{display: 'none'}}></button>
				</form>
			</div>
		);
	}
}