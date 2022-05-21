import {Component} from 'react'
import {Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'

import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'

import './index.css'

class Register extends Component {
  state = {
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    confirmPassword: '',
    errorMessage: '',
    showLoading: false,
    showErrorMessage: false,
  }

  onChangeFirstname = event => {
    this.setState({
        firstname: event.target.value,
      })
  }

  onChangeLastname = event => {
    this.setState({
        lastname: event.target.value,
      })
  }

  onChangeUsername = event => {
    this.setState({
      username: event.target.value,
    })
  }

  onChangePassword = event => {
    this.setState({
      password: event.target.value.trim(),
    })
  }

  onChangeConfirmPassword = event => {
    this.setState({
      confirmPassword: event.target.value.trim(),
    })
  }

  showFieldEmptyError = message => {
    this.setState({
        showErrorMessage: true,
        errorMessage: message
    })
  }

  onFormSubmit = event => {
    event.preventDefault()
    const {firstname, lastname, username, password, confirmPassword} = this.state

    if(firstname === ""){
        this.showFieldEmptyError("Firstname field can't be empty")
    }
    else if(lastname === ""){
        this.showFieldEmptyError("Lastname field can't be empty")
    }
    else if(username === ""){
        this.showFieldEmptyError("Email field can't be empty")
    }
    else if(password === ""){
        this.showFieldEmptyError("Password field can't be empty")
    }
    else if(confirmPassword === ""){
        this.showFieldEmptyError("Confirm Password field can't be empty")
    }
    else if (password !== confirmPassword){
        this.showFieldEmptyError("Password and Confirm Password didn't match")
    }
    else{
        this.setState({
            showLoading: true,
            showErrorMessage: false,
          })
          this.postLoginCredentials({firstname, lastname, username, password})
    }
  }

  postLoginCredentials = async credentials => {
    const loginApiUrl = 'http://localhost:3001/register'

    const options = {
      method: 'POST',
      headers: {
        "Content-Type":"application/json",
        "Accept":"application/json"
      },
      body: JSON.stringify(credentials)
    }

    try{
      const response = await fetch(loginApiUrl, options)
      const data = await response.json()

      if (response.ok) {
        this.onLoginSuccessful()
      } else {
        this.onLoginFailure(data.error_message)
      }
    }
    catch(error){
      console.log(error.message)
      this.onLoginFailure("Server error, Please try after sometime")
    }
  }

  onLoginSuccessful = () => {
    alert("Registration Successful, Please login with username and password")

    const {history} = this.props
    history.replace('/login')
  }

  onLoginFailure = errorMsg => {
    this.setState({
      errorMessage: errorMsg,
      showErrorMessage: true,
      showLoading: false,
    })
  }

  renderLoadingView = () => (
    <div className="registration-button">
      <Loader type="ThreeDots" color="#1e95f7" height={14} width={48} />
    </div>
  )

  renderInputField = (text, type, value, onClickEvent) => (
    <div className='input-field-container'>
        <label className="register-form-label" htmlFor={text.toLowerCase()}>
        {text.toUpperCase()}
        </label>
        <input
        className="register-form-input"
        id={text.toLowerCase()}
        type={type}
        value={value}
        placeholder={text}
        onChange={onClickEvent}
        />
    </div>
  )

  renderFormContainer = () => {
    const {firstname, lastname, username, password, confirmPassword, errorMessage, showErrorMessage, showLoading} = this.state

    return (
      <div className="login-container">
        
        <form className="registration-form-container" onSubmit={this.onFormSubmit}>

            <h1 className="login-heading">Register</h1>
            {this.renderInputField("Firstname", "text", firstname, this.onChangeFirstname)}
            {this.renderInputField("Lastname", "text", lastname, this.onChangeLastname)}
            {this.renderInputField("Email (Username)", "email", username, this.onChangeUsername)}
            {this.renderInputField("Password", "password", password, this.onChangePassword)}
            {this.renderInputField("Confirm Password", "password", confirmPassword, this.onChangeConfirmPassword)}

            {showErrorMessage && (
                <p className="login-error-message">{errorMessage}</p>
            )}

            {showLoading ? (
            this.renderLoadingView()
            ) : (
            <button className="registration-button" type="submit">
                Register
            </button>
            )} 
        </form>
      </div>
    )
  }

  render() {
    const jwtToken = Cookies.get('jwt_token')
    if (jwtToken !== undefined) {
      return <Redirect to="/" />
    }

    return this.renderFormContainer()
  }
}

export default Register