import React, { Component, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom'

import './App.css';
import {
  MyGroup,
  MyTask,
  Group,
} from './components';
import axios from 'axios';
import logo from './logo.svg';

const api_url = 'http://127.0.0.1:8000'

/**
 * Interesting observation: if the log in 
 * and out is governed via props instead of local storage, 
 * when the browser is refreshed, the memory is refreshed and thus
 * the application immediately logged out
 * @param {*} props 
 */
function App(props) {
  const [LoggedIn, setLoggedIn] = useState(
    localStorage.getItem('jwt') !== null &&
    localStorage.getItem('userId') !== null
  );

  function handleLogIn(jwt, userId) {
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('userId', userId);
    rerender();
  }

  function handleLogOut() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userId');
    rerender();
  }

  function rerender() {
    const jwt = localStorage.getItem('jwt');
    const userId = localStorage.getItem('userId');
    setLoggedIn(jwt !== null && userId !== null);
  }

  return (
    <div className="App">
      <Router>
        <NavBar
          isLoggedIn={LoggedIn} />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/login">
            <Login
              handleLogIn={handleLogIn}
              isLoggedIn={LoggedIn} />
          </Route>
          <Route path="/logout">
            <Logout
              handleLogOut={handleLogOut} />
          </Route>
          <Route path="/mygroups">
            <MyGroup
              isLoggedIn={LoggedIn}
              handleLogOut={handleLogOut} />
          </Route>
          <Route path="/group/:pk">
            <Group
              isLoggedIn={LoggedIn}
              handleLogOut={handleLogOut} />
          </Route>
          <Route path="/mytasks">
            <MyTask
              isLoggedIn={LoggedIn}
              handleLogOut={handleLogOut} />
          </Route>
          <Route path="/signup">
            <SignUp
              isLoggedIn={LoggedIn}
              handleLogOut={handleLogOut} />
          </Route>
        </Switch>
      </Router>
    </div>
  )

}

function SignUp(props) {
  const [Username, setUsername] = useState('');
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [ConfirmPassword, setConfirmPassword] = useState('');
  const [Error, setError] = useState('')

  function handleChangeUsername(event) {
    setUsername(event.target.value);
  }

  function handleChangeEmail(event) {
    setEmail(event.target.value);
  }

  function handleChangePassword(event) {
    setPassword(event.target.value);
  }

  function handleChangeConfirmPassword(event) {
    setConfirmPassword(event.target.value);
  }

  async function signUpUser() {
    try {
      const response = await axios.post(
        `${api_url}/users`,
        {
          username: Username,
          email: Email,
          password: Password,
        }
      )
      console.log(response)
    } catch (err) {
      setError(err.response.data[0])
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (Password === ConfirmPassword) {
      if (Username && Password) {
        signUpUser();
      } else {
        setError("Username and password can't be empty")
      }
    }
  }

  return (
    <div className='signup'>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
        <input 
          value={Username}
          type='text'
          onChange={handleChangeUsername} />
        </label>
        <br />
        <label>
          Email:
        <input 
          type='email'
          value={Email}
          onChange={handleChangeEmail} />
        </label>
        <br />
        <label>
          Password:
          <input
            type='password'
            value={Password}
            onChange={handleChangePassword} />
        </label>
        <br />
        <label>
          Confirm Password:
          <input
            type='password'
            value={ConfirmPassword}
            onChange={handleChangeConfirmPassword} />
        </label>
        {
          Password === ConfirmPassword ?
          <span></span>
          :
          <p>Password do not match</p>
        }
        {
          Error ?
          <p>{Error}</p>
          :
          <span></span>
        }
        <br />
        <button type='submit'>Sign Up</button>
      </form>
    </div>
  );
}

function Home() {
  return (
    <h1>Home</h1>
  )
}

function NavBar(props) {
  let { isLoggedIn } = props;

  if (isLoggedIn) {
    return (
      <div>
        <Link to="/mygroups/">My Groups</Link>
        <Link to="/mytasks/">My Tasks</Link>
        <Link to="/logout/">Log Out</Link>
      </div>
    );
  }
  else {
    return (
      <div>
        <Link to="/signup">Sign Up</Link>
        <Link to="/login">Log In</Link>
      </div>
    );
  }
}

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      userId: '',
      password: '',
      error_msg: '',
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleAuthFail = this.handleAuthFail.bind(this);
  }

  convertUsernameToUserId(username, jwt) {
    axios.get(
      `${api_url}/users/${username}`,
      {
        headers: {
          Authorization: 'Bearer ' + jwt
        }
      }
    ).then(
      (res) => {
        this.props.handleLogIn(jwt, res.data.pk);
      }
    ).catch(
      (err) => console.log(err)
    )
  }

  handleLogin(event) {

    event.preventDefault();

    let { username, password } = this.state;

    axios.post(
      `${api_url}/api/token/`,
      {
        username,
        password,
      },
    ).then(
      (res) => {
        const jwt = res.data.access;
        this.convertUsernameToUserId(this.state.username, jwt);
      }
    ).catch(
      (err) => {
        console.log(err);
        if (err.response.status === 401) {
          this.handleAuthFail();
        }
      }
    )
  }

  handleAuthFail() {
    this.setState(
      { error_msg: 'Username or Password is wrong, try again!' }
    );
  }

  handleChangeUsername(event) {
    this.setState(
      { username: event.target.value }
    );
  }

  handleChangePassword(event) {
    this.setState(
      { password: event.target.value }
    );
  }

  render() {

    let { error_msg } = this.state;

    if (this.props.isLoggedIn) {
      return (
        <Redirect to={{ pathname: '/mygroups' }} />
      )
    }

    return (
      <div>
        <form onSubmit={(event) => this.handleLogin(event)}>
          <input name="username" type="text" value={this.state.username} onChange={this.handleChangeUsername} />
          <input name="password" type="password" value={this.state.password} onChange={this.handleChangePassword} />
          <button type="submit" value="Submit" >Log In</button>
        </form>
        <p>{error_msg}</p>
      </div>
    );
  }
}

class Logout extends Component {

  componentWillUnmount() {
    this.props.handleLogOut();
  }

  render() {
    return (
      <Redirect to={{ pathname: '/' }} />
    )
  }

}




export default App;
