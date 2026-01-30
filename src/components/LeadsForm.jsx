import React, { useState } from 'react'

const LeadsForm = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [leadType, setLeadType] = useState("")

    // const findLeads = (e) => {
    //     e.preventDefault()

    //     fetch("http://localhost:5678/webhook-test/lead-form", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ name, email })
    //     }).
    //         then(() => console.log("lead sent")).
    //         catch((err) => console.log("Error", err))

    //     console.log({ name, email });

    // }

    const findLeads = (e) => {
        e.preventDefault()

        fetch("http://localhost:5678/webhook-test/lead-form", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, leadType })
        }).
            then(console.log("lead sent")).
            catch(err => console.log("Error: ", err))
    }

    return (
        <div>
            <input onChange={(e) => setName(e.target.value)} type="text" placeholder='Enter name' value={name} />
            <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder='Enter email' value={email} />
            <input onChange={(e) => setLeadType(e.target.value)} type="text" placeholder='Describe type of lead' value={leadType} />
            <button onClick={findLeads} type="submit">Find Leads</button>
        </div>
    )
}

export default LeadsForm