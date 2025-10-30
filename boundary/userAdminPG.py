import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import '../App.css';

const App = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/users')
            .then(res => res.json())
            .then(data => {
                setItems(data);
            })
            .catch(err => console.error('Error fetching users:', err));
    }, []);

    return (
        <div>
            <h1><strong>User Accounts Summary</strong></h1>
            <div className="scroll">
                {items.map(item => (
                    <div className="card" key={item.id}>
                        {item.id}: {item.name}
                        <br/> 
                        {item.phoneNo}
                        <Link to={`/item/${item.id}`}>
                            View Account
                        </Link>
                    </div>
                ))}
            </div>
            <Link to="/create-user"><button type="button">Create new User Account</button></Link>
        </div>
    );
};

export default App;
