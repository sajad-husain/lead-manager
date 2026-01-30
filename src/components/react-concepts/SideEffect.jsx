import React, { useEffect, useMemo, useState } from 'react'

const SideEffect = () => {
    const [text, setText] = useState("")
    const [users, setUsers] = useState([])

    useEffect(() => { // no dependency array it runs on every render
        console.log("runs on every render")
    })

    useEffect(() => { // it has dependency array with no value it will run once 
        console.log("runs once due to empty dependency array.");
        console.log("Component Mounted");

    }, [])

    useEffect(() => {
        console.log("runs when value in dependency array changes");
        console.log("Component updating");

        fetch("https://jsonplaceholder.typicode.com/users").
            then(res => res.json()).
            then(data => setUsers(data))
    }, [])

    function expensiveCalculation({ num }) {
        const expensiveValue = useMemo(() => {
            console.log("Running Expensive");
            return num * 1000000
        }, [num])
    }

    return (
        <div>
            <h1>Practicing UseEffect</h1>
            <p>good paragraph</p>
            {users.map(item => <li key={item.id}>{item.name}</li>)}
            <h1>Expensive calculation Result: {expensiveValue}</h1>
        </div>
    )
}

export default SideEffect