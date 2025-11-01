import axios from 'axios';

const users = await axios.get('http://localhost:8090/api/user');
console.log(users); 