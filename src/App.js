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
import Jumbotron from 'react-bootstrap/Jumbotron'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import NavDropdown from 'react-bootstrap/NavDropdown';
import logo from './logo.svg';

// const api_url = 'http://127.0.0.1:8000'
const api_url = 'http://grouptaskapi.viriyadhika.com'

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
    localStorage.getItem('userId') !== null &&
    localStorage.getItem('username') !== null
  );

  const [Username, setUsername] = useState(
    localStorage.getItem('username')
  )

  function handleLogIn(jwt, userId, username) {
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    rerender();
  }

  function handleLogOut() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    rerender();
  }

  function rerender() {
    const jwt = localStorage.getItem('jwt');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    setUsername(username);
    setLoggedIn(jwt !== null && userId !== null && username !== null);
  }

  return (
    <div className="App">
      <Router>
        <NavBar
          username={Username}
          isLoggedIn={LoggedIn} />
        <Container className="p-3" fluid="md">
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
        </Container>
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
    //Redirect user to logged in page
    //What if password is too short?
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
    <Row className="justify-content-center">
      <Col md="auto">
        <Card>
          <Row className="p-3">
            <Col>
              <Row className="justify-content-start">
                <Col className="registration-title">
                  <h2>Sign Up</h2>
                </Col>
              </Row>
              <Row className="justify-content-start">
                <Col>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group>
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        value={Username}
                        type='text'
                        onChange={handleChangeUsername}
                        placeholder="Enter username"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        value={Email}
                        type='email'
                        onChange={handleChangeEmail}
                        placeholder="Enter Email"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        value={Password}
                        type='password'
                        onChange={handleChangePassword}
                        placeholder="Enter Password"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        value={ConfirmPassword}
                        type='password'
                        onChange={handleChangeConfirmPassword}
                        placeholder="Enter Password"
                      />
                      {
                        Password === ConfirmPassword ?
                          <span></span>
                          :
                          <div>
                            <Form.Text className="text-danger">Password do not match</Form.Text>
                            <br />
                          </div>
                      }
                      {
                        Error ?
                          <div>
                            <Form.Text className="text-danger">{Error}</Form.Text>
                            <br />
                          </div>
                          :
                          <span></span>
                      }
                    </Form.Group>
                    <Button
                      type="submit"
                      variant="success" >
                      Sign Up
                  </Button>
                  </Form>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

function Home() {
  return (
    <Jumbotron>
      <h1>Home</h1>
    </Jumbotron>
  )
}

function NavBar(props) {
  let { isLoggedIn, username } = props;

  if (isLoggedIn) {
    return (
      <Navbar collapseOnSelect bg="light" expand="lg">
        <Navbar.Brand href="/">Group Task</Navbar.Brand>
        <Navbar.Toggle className="ml-auto" aria-controls="navbar-nav" />
        <Navbar.Collapse className="ml-auto" id="navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/mygroups">My Groups</Nav.Link>
            <Nav.Link href="/mytasks">My Tasks</Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown title={username}>
              <NavDropdown.Item href="/logout">Log Out</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
  else {
    return (
      <Navbar collapseOnSelect bg="light" expand="lg">
        <Navbar.Brand href="/">Group Task</Navbar.Brand>
        <Navbar.Toggle className="ml-auto" aria-controls="navbar-nav" />
        <Navbar.Collapse className="ml-auto" id="navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="/signup">Sign Up</Nav.Link>
            <Nav.Link href="/login">Log In</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
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
    //What if cannot find the user id?
    axios.get(
      `${api_url}/users/${username}`,
      {
        headers: {
          Authorization: 'Bearer ' + jwt
        }
      }
    ).then(
      (res) => {
        this.props.handleLogIn(jwt, res.data.pk, username);
      }
    ).catch(
      (err) => console.log(err)
    )
  }

  handleLogin(event) {
    //What if the username and password is empty?
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
      <Row className="justify-content-center">
        <Col md="auto">
          <Card>
            <Row className="p-3">
              <Col>
                <Row className="justify-content-start">
                  <Col md="auto">
                    <h2 className="registration-title">Log In</h2>
                  </Col>
                </Row>
                <Row className="justify-content-start">
                  <Col>
                    <Form onSubmit={(event) => this.handleLogin(event)}>
                      <Form.Group controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          onChange={this.handleChangeUsername}
                          type="text"
                          value={this.state.username}
                          placeholder="Enter email" />
                      </Form.Group>
                      <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          onChange={this.handleChangePassword}
                          type="password"
                          value={this.state.password}
                          placeholder="Enter password" />
                      </Form.Group>
                      <Button
                        type="submit"
                        variant="success" >
                        Log In
                  </Button>
                      <p>{error_msg}</p>
                    </Form>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
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
