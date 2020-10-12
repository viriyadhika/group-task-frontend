import React, { Component, useEffect, useState } from 'react';
import './App.css';
import axios from 'axios'
import {
    Redirect,
    Link,
    useParams
} from 'react-router-dom';
import Dialog from '@material-ui/core/Dialog';

const api_url = 'http://127.0.0.1:8000'

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
            {dialogOpen: false}
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
            <div>
                <h1>My Groups</h1>
                {groups !== [] ?
                    <div>
                        <button onClick={this.openAddNewGroupDialog} >Add Group</ button>
                        <AddGroupDialog
                            open={dialogOpen}
                            onClose={this.closeDialog} />
                        <ul>
                            {groups.map((group) => (
                                <li key={group.pk}>
                                    <Link to={`/group/${group.pk}`}>
                                        {group.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div> :
                    <p>Loading...</p>
                }
            </div>
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
        props.onClose();
    }

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title">
            <form onSubmit={createNewGroup}>
                <label>Group Name
                <input
                        type='text'
                        name='username'
                        value={Name}
                        onChange={handleChangeName}
                    />
                </label>
                <br />
                <button type="submit">Create New Group</button>
                <button type="button" onClick={props.onClose}>Cancel</button>
            </form>
        </Dialog>
    )
}

function MyTask(props) {
    const [Tasks, setTasks] = useState([]);
    //What if user is not logged in
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
            <h1>My Tasks</h1>
            <table style={{ marginInlineStart: 'auto', marginInlineEnd: 'auto' }}>
                <thead>
                    <tr>
                        <th>Task Name</th>
                        <th>Desc</th>
                        <th>Group</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        Tasks.map((task) =>
                            <tr key={task.pk}>
                                <td>{task.name}</td>
                                <td>{task.desc}</td>
                                <td>
                                    <Link to={`/group/${task.group.pk}`}>
                                        {task.group.name}
                                    </Link>
                                </td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>
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
                        <h2>Members</h2>
                        <button onClick={openAddMemberDialog}>Add Member</button>
                        <AddMemberDialog
                            open={AddMemberDialogOpen}
                            onClose={cancelAddMember}
                            groupId={Group.pk} />
                        <MembersList
                            onUserChange={fetchGroupData}
                            Users={Group.members}
                            Group={Group} />
                        <h2>Tasks</h2>
                        <button onClick={openAddTaskDialog}>Add New Task</button>
                        <AddTaskDialog
                            Group={Group}
                            Users={Group.members}
                            open={AddTaskDialogOpen}
                            onClose={cancelAddTask} />
                        <TaskList
                            Tasks={Group.group_tasks}
                            onTaskChange={fetchGroupData} />
                    </div>
            }
        </div>
    );
}

function MembersList(props) {
    const Users = props.Users
    const jwt_token = localStorage.getItem('jwt')

    async function deleteMember(userPk) {
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
            console.log(err)
        }
    }

    return (
        <table style={{ marginInlineStart: 'auto', marginInlineEnd: 'auto' }}>
            <tbody>
                {
                    Users.map((user) =>
                        <tr key={user.pk}>
                            <td>{user.username}</td>
                            <td><button onClick={() => deleteMember(user.pk)}>Delete Member</button></td>
                        </tr>
                    )
                }
            </tbody>
        </table>
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
            console.log(err);
        }
    }

    return (
        <div>
            {
                Tasks.length ?
                    <table style={{ marginInlineStart: 'auto', marginInlineEnd: 'auto' }}>
                        <thead>
                            <tr>
                                <th>Task Name</th>
                                <th>In Charge</th>
                                <th>Due Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Tasks.map((task) =>
                                    <tr key={task.pk}>
                                        <td>{task.name}</td>
                                        <td>{task.in_charge.username}</td>
                                        <td>{task.due_date}</td>
                                        <td><button onClick={() => deleteTask(task.pk)}>Delete</button></td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                    :
                    <div>
                        <p>No task</p>
                    </div>
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
        const userId = await axios.get(
            `${api_url}/users/${username}`,
            {
                headers: {
                    Authorization: 'Bearer ' + jwt_token
                }
            }
        )
        return userId.data.pk
    }

    async function onSubmit(event) {
        event.preventDefault();
        let { groupId } = props
        try {
            const userId = await convertUsernameToUserId(Username);
            //What if username is invalid?
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
            console.log(err);
        }
    }

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title">
            <form onSubmit={onSubmit}>
                <label>Username
                    <input
                        type='text'
                        name='username'
                        value={Username}
                        onChange={changeUsername}
                    />
                </label>
                <br />
                <button type="submit">Add Member</button>
                <button type="button" onClick={props.onClose}>Cancel</button>
            </form>
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

            <form onSubmit={onSubmit}>
                <label>
                    Task Name:
                    <input
                        type='text'
                        name='name'
                        value={Name}
                        onChange={changeName} />
                </label>
                <br />
                <label>
                    Task Description:
                    <input
                        type="text"
                        name='desc'
                        value={Desc}
                        onChange={changeDesc} />
                </label>
                <br />
                <label>
                    Due Date:
                    <input
                        type="date"
                        label='due_date'
                        value={DueDate}
                        onChange={changeDate} />
                </label>
                <br />
                <label>
                    In Charge:
                    <select
                        value={InChargePk}
                        label='in_charge'
                        onChange={changeInCharge} >
                        <option
                            value={inChargeDefault}
                        >
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
                    </select>
                </label>
                {
                    Error !== '' ?
                        <p>*{Error}</p> :
                        <p></p>
                }
                <br />
                <button type="submit">Add Task</button>
                <button type="button" onClick={props.onClose} >Cancel</button>
            </form>
        </Dialog>
    )
}


export { MyGroup, MyTask, Group }
