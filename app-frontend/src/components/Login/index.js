import {Component} from 'react'
import {Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'

import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'

import './index.css'

class Login extends Component {
  state = {
    username: '',
    password: '',
    errorMessage: '',
    showLoginLoading: false,
    showErrorMessage: false,
  }

  onChangeUsername = event => {
    this.setState({
      username: event.target.value.trim(),
    })
  }

  onChangePassword = event => {
    this.setState({
      password: event.target.value.trim(),
    })
  }

  onFormSubmit = event => {
    event.preventDefault()
    const {username, password} = this.state

      if (username === "" && password === ""){
          this.setState({
              showErrorMessage:true,
              errorMessage: "Username and Password can't be empty"
          })
          return
      }
      if (username === ""){
        this.setState({
            showErrorMessage:true,
            errorMessage: "Username can't be empty"
        })
        return
    }
    if (password === ""){
        this.setState({
            showErrorMessage:true,
            errorMessage: "Password can't be empty"
        })
        return
    }
      
    this.setState({
      showLoginLoading: true,
      showErrorMessage: false,
    })
    this.postLoginCredentials({username, password})
  }

  postLoginCredentials = async credentials => {
    const loginApiUrl = 'http://localhost:3001/login'

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
        this.onLoginSuccessful(data.jwt_token, data.firstname)
      } else {
        this.onLoginFailure(data.error_message)
      }
    }
    catch(error){
      console.log(error.message)
      this.onLoginFailure("Server error, Please try after sometime")
    }
  }

  onLoginSuccessful = (jwtToken, firstname) => {
    Cookies.set('jwt_token', jwtToken, {
      expires: 7
    })

    Cookies.set("user_firstname", firstname, {
      expires: 7
    })

    const {history} = this.props
    history.replace('/')
  }

  onLoginFailure = errorMsg => {
    this.setState({
      errorMessage: errorMsg,
      showErrorMessage: true,
      showLoginLoading: false,
    })
  }

  onClickRegisterButton = () => {
      const {history} = this.props
      history.push('/register')
  }

  renderLoadingView = () => (
    <div className="login-button">
      <Loader type="ThreeDots" color="#ffffff" height={14} width={48} />
    </div>
  )

  renderUsernameField = () => {
    const {username} = this.state
    return (
      <>
        <label className="form-label" htmlFor="username">
          USERNAME (EMAIL)
        </label>
        <input
          className="form-input"
          id="username"
          type="email"
          value={username}
          placeholder="Enter Your Email"
          onChange={this.onChangeUsername}
        />
      </>
    )
  }

  renderPasswordField = () => {
    const {password} = this.state
    return (
      <>
        <label className="form-label" htmlFor="password">
          PASSWORD
        </label>
        <input
          className="form-input"
          id="password"
          type="password"
          value={password}
          placeholder="Enter Your Password"
          onChange={this.onChangePassword}
        />
      </>
    )
  }

  renderButtonsContainer = () => {
    const {showLoginLoading} = this.state

    return (
      <div className="buttons-container">
        {showLoginLoading ? (
          this.renderLoadingView()
        ) : (
          <button className="login-button" type="submit">
            Login
          </button>
        )}

        <button
            className="register-button"
            type="button"
            onClick={this.onClickRegisterButton}
          >
            Register
        </button>

      </div>
    )
  }

  renderFormContainer = () => {
    const {errorMessage, showErrorMessage} = this.state

    return (
      <div className="login-container">
        
        <form className="form-container" onSubmit={this.onFormSubmit}>

          <h1 className="login-heading">Login</h1>
          {this.renderUsernameField()}
          {this.renderPasswordField()}

          {showErrorMessage && (
            <p className="login-error-message">{errorMessage}</p>
          )}

          
{this.renderButtonsContainer()}
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

export default Login