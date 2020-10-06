import React, { Component } from 'react';
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


class App extends Component {

  constructor(props) {
    super(props);

    let jwt_token = localStorage.getItem('jwt');
    let username = localStorage.getItem('username');

    this.state = {
      loggedIn: jwt_token !== null && username !== null
    };
    this.logOutApplication = this.logOutApplication.bind(this)
    this.changeLogInState = this.changeLogInState.bind(this)
  }

  changeLogInState() {
    let jwt_token = localStorage.getItem('jwt');
    let username = localStorage.getItem('username');

    this.setState({
      loggedIn: jwt_token !== null && username !== null
    });
  }

  logOutApplication() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    this.setState({
      loggedIn: false
    })
  }

  render() {
    return (
      <div className="App">
        <Router>
          <NavBar isLoggedIn={this.state.loggedIn} />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/mygroups/">
              <MyGroup 
                logOutApplication={this.logOutApplication}
              />
            </Route>
            <Route path="/mytasks/">
              <MyTask 
                logOutApplication={this.logOutApplication} />
            </Route>
            <Route path="/login/" >
              <Login changeNavBar={this.changeLogInState} />
            </Route>
            <Route path="/logout/" component={Logout}>
              <Logout changeNavBar={this.changeLogInState} />
            </Route>
            <Route path="/group/:pk/">
              <Group 
                logOutApplication={this.logOutApplication} />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
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
        <Link to="/login/">Log In</Link>
      </div>
    );
  }
}

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error_msg: '',
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleAuthFail = this.handleAuthFail.bind(this);
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
        localStorage.setItem('jwt', res.data.access);
        localStorage.setItem('username', username);
        this.props.changeNavBar();
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
      { error_msg : 'Username or Password is wrong, try again!' }
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
    let username = localStorage.getItem('username');
    let jwt_token = localStorage.getItem('jwt');

    let {error_msg} = this.state;

    if (username !== null && jwt_token !== null) {
      return (
        <Redirect to={{ pathname: '/mygroups/' }} />
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
  constructor(props) {
    super(props);
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
  }

  componentWillUnmount () {
    this.props.changeNavBar();
  }

  render() {
    return (
      <Redirect to={{ pathname: '/' }} />
    )
  }

}




export default App;
