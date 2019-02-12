/// <reference path="./interfaces.d.ts" />
import React from 'react';

export default class Login extends React.Component<ILoginProps, ILoginState> {
  constructor(props: ILoginProps) {
    super(props);

    this.state = {
      errors: {
        username: '',
        password: '',
        result: ''
      }
    }
  }

  submit = ({username, password} : {username : string, password : string}) : void => {
    const formElement = document.getElementById('loginForm');
    const errors = this.state.errors;
    
    // attempt login
    this.props.login({username, password})
      .then((result : any) => {
        // if login failed, display errors
        if(result && result.success === false) { 
          errors.result = result.error;
          this.setState({errors}, () => {
            if (formElement)
              formElement.setAttribute('class', 'ui form error');
          })
        }

        // if the login is successful, the user will be redirected to the main page
      });
  }

  validate = (e : any) => {
		if(e) e.preventDefault();
		
		const formElement = document.getElementById('loginForm');
		const username = document.getElementsByName('username')[0] as HTMLInputElement;
		const password = document.getElementsByName('password')[0] as HTMLInputElement;
		const errors = this.state.errors;

		errors.result = '';

		if(username.value === '') {
			username.setAttribute('class', 'required field error');
			errors.username = 'Please enter a valid username';
		}
		else {
			username.setAttribute('class', 'required field');
			errors.username = '';
		}
		if(password.value === '') {
			password.setAttribute('class', 'required field error');
			errors.password = 'Please enter a valid password';
		}
		else {
			password.setAttribute('class', 'required field');
			errors.password = '';
		}
	
		
		this.setState({errors});
		
		let valid = true;
		Object.keys(this.state.errors).forEach(key => {
			(this.state.errors as any)[key] !== '' && (valid = false)
		});
		
		// if all is valid attempt password & username validation against the server
		if(valid && formElement) {
      formElement.setAttribute('class', 'ui loading form');
      this.submit({username:username.value, password: password.value})
      
		}
		else if (formElement) {
			formElement.setAttribute('class', 'ui form error');
		}
  };
  
  render() {
		return (		
			<div className="ui four wide column" id="registrationDiv">
				<h3 className="ui dividing header">Log in to your <b className="chatter-color">Chatter</b> account!</h3>
				<form onSubmit={this.validate}>
					<div id="loginForm" className='ui form'>
						<div className="required field">
							<label>Username</label>
							<input type="text" placeholder="Username" name="username" autoFocus autoComplete="username"/>
						</div>
						<div className="required field">
							<label>Password</label>
							<input type="password" placeholder="Password" name="password" autoComplete="off" />
						</div>
						<div id="submit-register" className="ui submit button" onClick={this.validate}>Log In</div>
						<div className="ui error message">
							<div className="header">Please fix the errors below:</div>
							<ul className="list">
								{ this.state.errors.username === '' ? '' : <li>Username: {this.state.errors.username}</li> }
								{ this.state.errors.password === '' ? '' : <li>Password: {this.state.errors.password}</li> }
								{ this.state.errors.result === '' ? '' : <li>{this.state.errors.result}</li> }
							</ul>
						</div>
					</div>
					<button type="submit" style={{display: 'none'}}></button>
				</form>
				<div className="ui warning message">
					<i className="icon help"></i>
					Don't have a Chatter account yet? <a id="link" onClick={this.props.goToSignup}>Sign Up</a> now!
				</div>
			</div>
		);
	}
}