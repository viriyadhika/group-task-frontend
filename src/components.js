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
            group_urls: [],
            groups: [],
            jwt_token: localStorage.getItem('jwt'),
            username: localStorage.getItem('username'),
            loggedIn: true,
        };
        this.getGroupName = this.getGroupName.bind(this);
        this.getUserData = this.getUserData.bind(this);
    }

    getGroupName(group_urls) {

        let { jwt_token } = this.state;

        for (let group_url of group_urls) {
            axios.get(group_url,
                {
                    headers: {
                        'Authorization': ('Bearer ' + jwt_token)
                    }
                }).then(
                    (res) => {
                        let { groups } = this.state;
                        this.setState({
                            groups: [...groups, res.data]
                        });
                    }
                ).catch(
                    (err) => {
                        console.log(err);
                        if (err.response.status === 401) {
                            this.setState({ loggedIn: false });
                            this.props.logOutApplication();
                        }
                    }
                );
        }
    }

    async getUserData() {
        let { username } = this.state;

        try {
            const userData = await axios.get(
                `${api_url}/users/?username=${username}`
            )
            const groupName = this.getGroupName(userData.data[0].my_groups);
        }
        catch (err) {
            console.log(err);
        }
    }

    componentDidMount() {
        this.getUserData();
    }

    render(props) {
        let { loggedIn, groups } = this.state;
        if (!loggedIn) {
            return (<Redirect to='/login' />)
        }
        return (
            <div>
                {groups !== [] ?
                    <div>
                        <h1>My Groups</h1>
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

function MyTask(props) {
    const [Tasks, setTasks] = useState([]);
    const [LoggedIn, setLoggedIn] = useState(true);

    const username = localStorage.getItem('username');
    const jwt_token = localStorage.getItem('jwt');

    async function fetchTaskData(userPk) {
        try {
            const taskData = await axios.get(
                `${api_url}/users/${userPk}/tasks/`,
                {
                    headers: {
                        Authorization: 'Bearer ' + jwt_token
                    }
                }
            );
            setTasks(taskData.data.my_tasks);
        } catch (err) {
            console.log(err);
            if (err.response.status === 401) {
                setLoggedIn(false);
                props.logOutApplication();
            }
        }
    }

    async function getUserData() {

        try {
            const userData = await axios.get(
                `${api_url}/users/?username=${username}`
            );
            const taskData = fetchTaskData(userData.data[0].pk);
        }
        catch (err) {
            console.log(err);
        }
    }

    useEffect(
        () => {
            getUserData();
        }
        , [])

    if (!LoggedIn) {
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
    const [Users, setUsers] = useState([]);
    const [Tasks, setTasks] = useState([]);
    const [AddMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
    const [AddTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
    const [LoggedIn, setLoggedIn] = useState(true);

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
                getUserData(result.data.members);
                getTaskData(result.data.group_tasks);
            }
        ).catch(
            err => {
                console.log(err);
                if (err.response.status === 401) {
                    setLoggedIn(false);
                    props.logOutApplication();
                }
            }
        );
    }

    async function getUserData(user_urls) {

        let getUser = function () {
            return user_urls.map((url) => axios.get(url))
        }
        const usersData = await axios.all(getUser())
        const users = usersData.map(
            (userData) => userData.data
        );
        setUsers(users);
    }

    async function getTaskData(task_urls) {
        let getTask = function () {
            return task_urls.map((url) => axios.get(url,
                {
                    headers: {
                        'Authorization': ('Bearer ' + jwt_token)
                    }
                }
            ))
        }
        const tasksData = await axios.all(getTask());
        const tasks = tasksData.map(
            (taskData) => taskData.data
        );
        setTasks(tasks);
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

    if (!LoggedIn) {
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
                            Users={Users}
                            Group={Group} />
                        <p>{Users.username}</p>
                        <h2>Tasks</h2>
                        <button onClick={openAddTaskDialog}>Add New Task</button>
                        <AddTaskDialog
                            Group={Group}
                            Users={Users}
                            open={AddTaskDialogOpen}
                            onClose={cancelAddTask} />
                        <TaskList
                            Tasks={Tasks}
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
        const relatedMembershipUrl = await getMembershipId(userPk, props.Group.pk);
        try {
            const deleteMember = await axios.delete(
                relatedMembershipUrl,
                {
                    headers: {
                        'Authorization': ('Bearer ' + jwt_token)
                    }
                }
            );
            props.onUserChange();
        } catch (err) {
            console.log(err);
        }
    }

    async function getMembershipId(userPk, groupPk) {
        try {
            const relatedMembership = await axios.get(
                `${api_url}/memberships/?user=${userPk}&group=${groupPk}`);
            return relatedMembership.data[0].url;
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

    function changeUsername(event) {
        setUsername(event.target.value);
    }

    async function onSubmit(event) {
        event.preventDefault();
        try {
            const response = await axios.post(
                `${api_url}/memberships/`,
                {
                    user: Username,
                    group: props.groupId,
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
            <form onSubmit={(event) => onSubmit(event)}>
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
                <button onClick={props.onClose}>Cancel</button>
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
                `${api_url}/tasks/`,
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
                <button onClick={props.onClose} >Cancel</button>
            </form>
        </Dialog>
    )
}


export { MyGroup, MyTask, Group }
