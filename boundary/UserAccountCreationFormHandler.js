import { Link } from 'react-router-dom';
import React from "react";
import '../App.css'

// function to take in userInput and parse into JSON object
function MyForm() {
  async function handleSubmit(event) {
    // Prevent browser from refreshing; can remove for functioning app
    event.preventDefault();

    // read the form data
    const form = event.target;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());

    // to make the data and convert it to JSON format
    const myJSON = JSON.stringify(formJson);

    try {
      const res = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: myJSON,
      });

      const data = await res.json();
      console.log("User created:", data);
      // You can show a message or clear the form here
    } catch (err) {
      console.error("Error:", err);
    }
  }

  return(
    // calls the handleSubmit method inside the MyForm function when form is submmitted
    <form method='post' onSubmit={handleSubmit} className='form-container'>
      <Link to="/"><button className='backButton' type='button'>Back</button></Link>
      <h1><strong>Create User Page</strong></h1>
      <div className='form-row'>
        <p className='pFormat'>Name:</p> 
        <label>
          <input name='name' className="styled-input"/>
        </label>
      </div>
      <div className='form-row'>
        <p className='pFormat'>ID:</p> 
        <label>
          <input name='ID' className="styled-input"/>
        </label>
      </div>
      <div className='form-row'>
        <p className='pFormat'>Password:</p> 
        <label>
          <input type="password" name='pw' className="styled-input"/>
        </label>
      </div>
      <div className='form-row'>
        <p className='pFormat'>Phone Number:</p> 
        <label>
          <input name='phoneNo' className="styled-input"/>
        </label>
      </div>
      <div className='form-row'>
        <p className='pFormat'>Address:</p> 
        <label>
          <input name='address' className="styled-input"/>
        </label>
      </div>
      <div className='form-row'>
        <p className='pFormat'>Date of Birth:</p> 
        <label>
          <input name='dob' className="styled-input"/>
        </label>
      </div>
      <button type='reset'>Reset Form</button>
      <br/><br/>
      <button type='submit'>Submit Form</button>
      <br/><br/>
      
    </form>

  );
}

export default MyForm;
