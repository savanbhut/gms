const fetch = require('node-fetch');

async function testUpdate() {
    console.log("Testing PUT /api/staff/4403...");
    const reqBody = {
        firstName: "savan",
        lastName: "bhut",
        role: "Mechanic",
        phone: "7069704523",
        email: "savan@gmail.com",
        salary: "20000",
        education: "iti",
        address: "b-103 jivan residency, vastral, ahmedabad",
        is_active: true
    };
    
    try {
        const res = await fetch('http://localhost:5000/api/staff/4403', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody)
        });
        
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text);
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

testUpdate();
