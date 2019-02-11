/// <reference path="./interfaces.d.ts" />
import React from 'react';


const nameRegex = RegExp('^(([A-za-z]+[\s]{1}[A-za-z]+)|([A-Za-z]+))$');
const usernameRegex = RegExp('[a-zA-Z][a-zA-Z0-9_]{5,31}');
const emailRegex = RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$' + 
                          '%&\'*+/=?^_\`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9' + 
                          '-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?');
const passwordRegex = RegExp('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Za-z])([a-zA-Z0-9\%\!\#\^\&\@_]){8,30}$');

let util : any;

export default class Signup extends React.Component<ISignupProps, ISignupState> {
  constructor(props : ISignupProps) {
		super(props);

		this.state = {
			firstName: '',
			lastName: '',
			email: '',
			username: '',
			password1: '',
			password2: '',
			formErrors: {
				firstName: '',
				lastName: '',
				email: '',
				username: '',
				password1: '',
				password2: ''
			}
    }
  }

  componentDidMount() {
    util = require('../util');
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

  handleChange = (e : React.ChangeEvent<HTMLInputElement>)=> {
		e.preventDefault();

		const {name, value} : {name:string, value:string} = e.target;
		let formErrors : IFormErrors = this.state.formErrors;

		switch(name) {
			case 'firstName': 
				formErrors.firstName = nameRegex.test(value) ? '' : 'cannot contain numbers, spaces or special characters!';
				if(formErrors.firstName === '')
					formErrors.firstName = value.length > 1 ? '' : 'minimum 2 characters required!';
				break;
			
			case 'lastName': 
			formErrors.lastName = nameRegex.test(value) ? '' : 'cannot contain numbers, spaces or special characters!';
			if(formErrors.lastName === '')
				formErrors.lastName = value.length > 1 ? '' : 'minimum 2 characters required!';
			break;

			case 'email': 
			formErrors.email = emailRegex.test(value) ? '' : 'invalid email address!';
			break;

			case 'username': 
				formErrors.username = value.length > 5 ? '' : 'needs to be at least 6 characters long!';
				if(formErrors.username === '')
					formErrors.username = usernameRegex.test(value) ? '' : 'can contain only letters, numbers and the \'_\' character!';
				break;
			
			case 'password1': 
			formErrors.password1 = value.length > 7 ? '' : 'needs to be at least 8 characters long!';
			if(formErrors.password1 === '')
				formErrors.password1 = passwordRegex.test(value) ? '' : 'needs to contain a combination of at least 8 letters and numbers.';
			break;

			case 'password2': 
			formErrors.password2 = value === this.state.password1 ? '' : 'does not match the password';
			if(formErrors.password2 === '')
				formErrors.password2 = value.length > 0 ? '' : 'please enter confirmation password';
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
  
  handleSubmit = (e : any) => {
		e.preventDefault();

		if(this.validate(this.state as any)) {
      const formElement = document.getElementById('registerForm');
      if (formElement)
        formElement.setAttribute('class', 'ui loading form');
      else
        return;

			const user = {
				firstName: this.state.firstName,
				lastName: this.state.lastName,
				email: this.state.email,
				username: this.state.username,
				password: this.state.password1,
      } 
      
      // Here we should check for any errors from the server-side-validation.
      util.createAccount(user)
        .then((result:any) => {
          if(result.created) {
            formElement.setAttribute('class', 'ui form success');
            this.props.login(result.user);
          }
          else {
            formElement.setAttribute('class', 'ui form warning');
          }
        });
		}
		else{
      const formElement = document.getElementById('registerForm');
      if (formElement)
			  formElement.setAttribute('class', 'ui form error');
		}
  }
  
  checkUsername = (e : React.ChangeEvent<HTMLInputElement>) => {
		this.handleChange(e);

		const formErrors = this.state.formErrors;
		if (formErrors.username === '') {
      util.checkUsernameTaken(e.target.value)
        .then((result : any) => {
          formErrors.username = result ? 'This username is taken. Please choose another one.' : '';
          this.setState({formErrors});
        });
		}
	}
  
  render() {
		return (
			<div className="ui seven wide column" id="registrationDiv">
				<form onSubmit={this.handleSubmit}>
					<div className='ui form' id='registerForm'>
						<h3 className="ui dividing header chatter-color">Create a new <b className="chatter-color">Chatter</b> account</h3>
						<div className="required field">
							<label>Name</label>
							<div className="two fields">
								<div className={this.state.formErrors.firstName === '' ? 'field' : 'field error'}>
									<input type="text" placeholder="first name" name="firstName" onChange={this.handleChange} />
								</div>
								<div className={this.state.formErrors.lastName === '' ? 'field' : 'field error'}>
									<input type="text" placeholder="last name" name="lastName" onChange={this.handleChange} />
								</div>
							</div>
						</div>
						<div className="two fields">
							<div className={ this.state.formErrors.email === '' ? 'required field' : 'required field error'}>
								<label>Email</label>
								<input type="email" placeholder="joe@schmoe.com" name="email" onChange={this.handleChange} />
							</div>
							<div className={ this.state.formErrors.username === '' ? 'required field' : 'required field error'}>
								<label>Username</label>
								<input type="text" placeholder="username" name="username" onChange={this.checkUsername} />
							</div>
						</div>
						<div className="required field">
							<label>Password</label>
							<div className="two fields">
								<div className={this.state.formErrors.password1 === '' ? 'field' : 'field error'}>
									<input type="password" placeholder="password" name="password1" onChange={this.handleChange} />
								</div>
								<div className={this.state.formErrors.password2 === '' ? 'field' : 'field error'}>
									<input type="password" placeholder="confirm password" name="password2" onChange={this.handleChange} />
								</div>
							</div>
						</div>
						<div id="submit-register" className="ui submit button" onClick={this.handleSubmit}>Create Account</div>

						<div className="ui error message">
							<div className="header">Please fix the errors below:</div>
							<ul className="list">
								{ this.state.formErrors.firstName === '' ? '' : <li>First Name: {this.state.formErrors.firstName}</li> }
								{ this.state.formErrors.lastName === '' ? '' : <li>Last Name: {this.state.formErrors.lastName}</li> }
								{ this.state.formErrors.email === '' ? '' : <li>Email: {this.state.formErrors.email}</li> }
								{ this.state.formErrors.username === '' ? '' : <li>Username: {this.state.formErrors.username}</li> }
								{ this.state.formErrors.password1 === '' ? '' : <li>Password: {this.state.formErrors.password1}</li> }
								{ this.state.formErrors.password2 === '' ? '' : <li>Confirmation password: {this.state.formErrors.password2}</li> }
							</ul>
						</div>
						<div className="ui warning message">
							<div className="header">Your account was not created due to a server error. Please reload this page and try again.</div>
						</div>
						<div className="ui success message">
							<div className="header">Sign up complete!</div>
							<p>Welcome to <b className="chatter-color">Chatter</b>! Now go ahead and chat!</p>
						</div>
					</div>
					<button type="submit" style={{display: 'none'}}></button>
				</form>
				<div className="ui warning message">
					<i className="icon help"></i>
					Already signed up? <a id="link" onClick={this.props.goToLogin}>Log in here</a> instead.
				</div>
			</div>
		);
	}
}