import React, { Component, useEffect, useState } from 'react';
import './App.css';
import axios from 'axios'
import {
    Redirect,
    Link,
    useParams
} from 'react-router-dom';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Table from 'react-bootstrap/Table'
import Dialog from '@material-ui/core/Dialog';

// const api_url = 'http://127.0.0.1:8000'
const api_url = 'http://grouptaskapi.viriyadhika.com'

class MyGroup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            groups: [],
            dialogOpen: false,
        };
        this.getGroupData = this.getGroupData.bind(this);
        this.openAddNewGroupDialog = this.openAddNewGroupDialog.bind(this);
        this.rerender = this.rerender.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }

    async getGroupData(userId, jwt) {
        try {
            const groupData = await axios.get(
                `${api_url}/users/${userId}/groups`,
                {
                    headers: {
                        'Authorization': ('Bearer ' + jwt)
                    }
                }
            );
            this.setState({
                groups: groupData.data.my_groups
            });
        } catch (err) {
            console.log(err);
            if (err.response.status === 401) {
                this.props.handleLogOut();
            }
        }
    }

    async rerender() {
        const userId = localStorage.getItem('userId');
        const jwt = localStorage.getItem('jwt');
        if (userId !== null && jwt !== null) {
            this.getGroupData(userId, jwt);
        } else {
            this.props.handleLogOut();
        }
    }

    closeDialog() {
        this.setState(
            { dialogOpen: false }
        )
        this.rerender();
    }

    componentDidMount() {
        this.rerender()
    }

    openAddNewGroupDialog() {
        this.setState({
            dialogOpen: true
        })
    }

    render() {
        let { groups, dialogOpen } = this.state;
        let { isLoggedIn } = this.props
        if (!isLoggedIn) {
            return (<Redirect to='/login' />)
        }
        return (
            <Row className="justify-content-center">
                <Col>
                    <Row>
                        <Col>
                            <h1>My Groups</h1>
                            <Button onClick={this.openAddNewGroupDialog}>Create New Group</Button>
                            <AddGroupDialog
                                handleLogOut={this.props.handleLogOut}
                                open={dialogOpen}
                                onClose={this.closeDialog} />
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col style={{ maxWidth: '30rem' }}>
                            <Row className="m-1 align-items-stretch justify-content-start">
                                {
                                    groups.map((group) =>
                                        <Col className="my-1" key={group.pk} sm={6} md={4}>
                                            <Card>
                                                <Card.Body>
                                                    <Link to={`/group/${group.pk}`}>
                                                        {group.name}
                                                    </Link>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    )
                                }
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>

        )
    };
}

function AddGroupDialog(props) {
    const [Name, setName] = useState('');

    function handleChangeName(event) {
        setName(event.target.value)
    }

    async function createNewGroup(event) {
        event.preventDefault();

        const userId = localStorage.getItem('userId');
        const jwt = localStorage.getItem('jwt');

        if (userId === null || jwt === null) {
            this.props.handleLogOut();
        }

        try {
            const response = await axios.post(
                `${api_url}/groups`,
                {
                    name: Name
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + jwt
                    }
                }
            )
        } catch (err) {
            if (err.response.status === 401) {
                this.props.handleLogOut();
            }
            console.log(err);
        }
        props.onClose();
    }

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title">
            <Row className="m-3">
                <Col>
                    <Form onSubmit={createNewGroup}>
                        <Form.Group>
                            <Form.Label>Group Name</Form.Label>
                            <Form.Control
                                type="text"
                                name='username'
                                placeholder='Enter Group Name'
                                value={Name}
                                onChange={handleChangeName} />
                        </Form.Group>
                        <Row>
                            <Col xs="auto">
                                <Button
                                    type="submit"
                                    variant="success">
                                    Create
                        </Button>
                            </Col>
                            <Col xs="auto">
                                <Button
                                    variant="light"
                                    type="button"
                                    onClick={props.onClose}>
                                    Cancel
                            </Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Dialog>
    )
}

function MyTask(props) {
    const [Tasks, setTasks] = useState([]);

    const userId = localStorage.getItem('userId');
    const jwt = localStorage.getItem('jwt');

    async function getTasks() {
        try {
            const taskData = await axios.get(
                `${api_url}/users/${userId}/tasks`,
                {
                    headers: {
                        Authorization: 'Bearer ' + jwt
                    }
                }
            )
            setTasks(taskData.data.my_tasks)
        } catch (err) {
            if (err.response.status === 401) {
                props.handleLogOut();
            }
            console.log(err);
        }
    }

    useEffect(
        () => {
            if (userId !== null || jwt !== null) {
                getTasks();
            } else {
                props.handleLogOut();
            }
        }
        , [])

    if (!props.isLoggedIn) {
        return (
            <Redirect to="/login" />
        )
    }

    return (
        <div>
            <Row className='justify-content-center'>
                <Col>
                    <h1>My Tasks</h1>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col style={{ maxWidth: '70%' }}>
                    <div style={{ 'overflow-x': 'auto' }}>
                        <Table bordered style={{ textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th>Task Name</th>
                                    <th>Description</th>
                                    <th>Due Date</th>
                                    <th>Group</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    Tasks.map((task) =>
                                        <tr key={task.pk}>
                                            <td>{task.name}</td>
                                            <td>{task.desc}</td>
                                            <td>{task.due_date}</td>
                                            <td>
                                                <Link to={`/group/${task.group.pk}`}>
                                                    {task.group.name}
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row >

        </div >
    )
}

function Group(props) {
    const [Group, setGroup] = useState(null);
    const [AddMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
    const [AddTaskDialogOpen, setAddTaskDialogOpen] = useState(false);

    let { pk } = useParams();

    const jwt_token = localStorage.getItem('jwt');

    async function fetchGroupData() {
        const res = axios.get(
            `${api_url}/groups/${pk}`,
            {
                headers: {
                    'Authorization': ('Bearer ' + jwt_token)
                }
            }
        ).then(
            result => {
                setGroup(result.data);
            }
        ).catch(
            err => {
                console.log(err);
                if (err.response.status === 401) {
                    props.handleLogOut();
                }
            }
        );
    }

    useEffect(
        () => {
            fetchGroupData();
        }, []);

    function openAddMemberDialog() {
        setAddMemberDialogOpen(true);
    }

    function cancelAddMember() {
        setAddMemberDialogOpen(false);
        fetchGroupData();
    }

    function openAddTaskDialog() {
        setAddTaskDialogOpen(true);
    }

    function cancelAddTask() {
        setAddTaskDialogOpen(false);
        fetchGroupData();
    }

    if (!props.isLoggedIn) {
        return (
            <Redirect to='/login' />
        )
    }

    return (
        <div>
            {
                Group === null ?
                    <p>Loading...</p>
                    :
                    <div>

                        <h1>{Group.name}</h1>
                        <Row>
                            <Col>
                                <h2>Members</h2>
                            </Col>
                        </Row>
                        <Row className="m-3">
                            <Col>
                                <Button onClick={openAddMemberDialog}>Add Member</Button>
                            </Col>
                        </Row>
                        <AddMemberDialog
                            handleLogOut={props.handleLogOut}
                            open={AddMemberDialogOpen}
                            onClose={cancelAddMember}
                            groupId={Group.pk} />
                        <Row>
                            <Col>
                                <MembersList
                                    handleLogOut={props.handleLogOut}
                                    onUserChange={fetchGroupData}
                                    Users={Group.members}
                                    Group={Group} />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h2>Tasks</h2>
                            </Col>
                        </Row>
                        <Row className="m-3">
                            <Col>
                                <Button onClick={openAddTaskDialog}>Add New Task</Button>
                            </Col>
                        </Row>
                        <AddTaskDialog
                            handleLogOut={props.handleLogOut}
                            Group={Group}
                            Users={Group.members}
                            open={AddTaskDialogOpen}
                            onClose={cancelAddTask} />
                        <Row className="justify-content-center">
                            <Col>
                                <TaskList
                                    handleLogOut={props.handleLogOut}
                                    Tasks={Group.group_tasks}
                                    onTaskChange={fetchGroupData} />
                            </Col>
                        </Row>
                    </div>
            }
        </div>
    );
}

function MembersList(props) {
    const Users = props.Users
    const jwt_token = localStorage.getItem('jwt')

    async function deleteMember(userPk) {
        //What if the person delete himself
        const groupPk = props.Group.pk
        try {
            const response = await axios.delete(
                `${api_url}/groups/${groupPk}/users/${userPk}`,
                {
                    headers: {
                        'Authorization': ('Bearer ' + jwt_token)
                    }
                }
            )
            props.onUserChange();
        } catch (err) {
            if (err.response.status === 401) {
                props.handleLogOut();
            }
            console.log(err)
        }
    }

    return (
        <Row className="justify-content-center">
            <Col style={{ maxWidth: '70%' }}>
                {
                    Users.map((user) =>
                        <Row className="m-3" key={user.pk}>
                            <Col >
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{user.username}</Card.Title>
                                        <Button
                                            onClick={() => deleteMember(user.pk)}
                                            variant="danger"
                                            style={{ float: 'right' }} >
                                            Delete
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )
                }
            </Col>
        </Row>
    )
}

function TaskList(props) {
    const Tasks = props.Tasks

    const jwt_token = localStorage.getItem('jwt')

    async function deleteTask(taskPk) {
        try {
            const deleteResponse = await axios.delete(
                `${api_url}/tasks/${taskPk}`,
                {
                    headers: {
                        'Authorization': ('Bearer ' + jwt_token)
                    }
                }
            )
            props.onTaskChange();
        } catch (err) {
            if (err.response.status === 401) {
                props.handleLogOut();
            }
            console.log(err);
        }
    }

    return (
        <div>
            {
                Tasks.length ?
                    <Row className="justify-content-center">
                        <Col style={{ maxWidth: "70%" }}>
                            {
                                Tasks.map((task) =>
                                    <Row key={task.pk} className="m-3">
                                        <Card style={{ width: '100%', textAlign: 'start' }}>
                                            <Card.Header>
                                                <Row>
                                                    <Col>
                                                        <Card.Title>{task.name}</Card.Title>
                                                        <Card.Subtitle >
                                                            Due: <span className="text-muted">{task.due_date}</span>
                                                            <br />
                                                    In Charge: <span className="text-muted">{task.in_charge.username}</span>
                                                        </Card.Subtitle>
                                                    </Col>
                                                    <Col>
                                                        <Button
                                                            variant="danger"
                                                            onClick={() => deleteTask(task.pk)}
                                                            style={{ float: 'right' }}>Delete</Button>
                                                    </Col>
                                                </Row>
                                            </Card.Header>
                                            <Card.Body><p>{task.desc}</p></Card.Body>
                                        </Card>
                                    </Row>
                                )
                            }
                        </Col>
                    </Row>
                    :
                    <Row>
                        <Col><p>No task</p></Col>
                    </Row>
            }
        </div>
    )
}


function AddMemberDialog(props) {
    const [Username, setUsername] = useState('');

    const jwt_token = localStorage.getItem('jwt');

    function changeUsername(event) {
        setUsername(event.target.value);
    }

    async function convertUsernameToUserId(username) {
        try {
            const userId = await axios.get(
                `${api_url}/users/${username}`,
                {
                    headers: {
                        Authorization: 'Bearer ' + jwt_token
                    }
                }
            )
            return userId.data.pk
        } catch (err) {
            // the username doesn't exist
            throw err;
        }
    }

    function handleUserNotExist(username) {
        alert(username + " is not a registered user");
    }

    async function onSubmit(event) {
        event.preventDefault();
        let { groupId } = props
        try {
            const userId = await convertUsernameToUserId(Username);

            const response = await axios.put(
                `${api_url}/groups/${groupId}/users/${userId}`,
                {},
                {
                    headers: {
                        Authorization: 'Bearer ' + jwt_token
                    }
                }
            );
            props.onClose();
        } catch (err) {
            if (err.response.status === 404) {
                handleUserNotExist(Username);
            }
            if (err.response.status === 401) {
                props.handleLogOut();
                console.log();
            }
            console.log(err);
        }
    }

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title">
            <Row className="m-3">
                <Col>
                    <Form onSubmit={onSubmit}>
                        <Form.Group>
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder="Insert username"
                                name='username'
                                value={Username}
                                onChange={changeUsername} />
                        </Form.Group>
                        <Row>
                            <Col xs="auto" className="my-1">
                                <Button
                                    variant="success"
                                    type="submit">Add Member</Button>
                            </Col>
                            <Col xs="auto" className="my-1">
                                <Button
                                    variant="light"
                                    type="button"
                                    onClick={props.onClose}>Cancel</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Dialog>
    );
}

function AddTaskDialog(props) {
    const inChargeDefault = "Select in charge"
    const [Name, setName] = useState('');
    const [Desc, setDesc] = useState('');
    const [DueDate, setDueDate] = useState('');
    const [InChargePk, setInChargePk] = useState(inChargeDefault);
    const [Error, setError] = useState('')

    const jwt_token = localStorage.getItem('jwt')

    function changeName(event) {
        setName(event.target.value);
    }

    function changeDesc(event) {
        setDesc(event.target.value);
    }

    function changeDate(event) {
        setDueDate(event.target.value);
    }

    function changeInCharge(event) {
        setInChargePk(event.target.value);
    }

    async function addTask() {
        try {
            const response = await axios.post(
                `${api_url}/tasks`,
                {
                    name: Name,
                    desc: Desc,
                    group: props.Group.pk,
                    in_charge: InChargePk,
                    due_date: DueDate,
                },
                {
                    headers: {
                        'Authorization': ('Bearer ' + jwt_token)
                    }
                }
            )
        } catch (err) {
            if (err.response.status === 401) {
                props.handleLogOut();
            }
            console.log(err);
        }
    }

    async function onSubmit(event) {
        event.preventDefault();
        if (InChargePk === inChargeDefault) {
            setError("Select an in charge");
            return
        }
        const submit = await addTask();
        props.onClose();
    }

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title" >
            <Row className="m-3">
                <Col>
                    <Form onSubmit={onSubmit}>
                        <Form.Group>
                            <Form.Label>Task Name:</Form.Label>
                            <Form.Control
                                type='text'
                                name='name'
                                value={Name}
                                onChange={changeName} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Task Description:</Form.Label>
                            <Form.Control
                                type="text"
                                name='desc'
                                value={Desc}
                                onChange={changeDesc} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Due Date:</Form.Label>
                            <Form.Control
                                type="date"
                                value={DueDate}
                                onChange={changeDate} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>In Charge</Form.Label>
                            <Form.Control as="select" onChange={changeInCharge} multiple>
                                <option
                                    value={inChargeDefault}>
                                    Select in charge
                                </option>
                                {
                                    props.Users.map((user) =>
                                        <option
                                            key={user.pk}
                                            value={user.pk}>
                                            {user.username}
                                        </option>
                                    )
                                }
                            </Form.Control>
                        </Form.Group>
                        <Row>
                            <Col className="my-1" xs="auto">
                                <Button variant="success" type="submit">Add Task</Button>
                            </Col>
                            <Col className="my-1" xs="auto">
                                <Button type="button" variant="light" onClick={props.onClose} >Cancel</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Dialog>
    )
}


export { MyGroup, MyTask, Group }
