## Project Description

This project simulates a telemedicine system that enables communication between primary care doctors (MAP) and specialized care doctors (ME) using a hybrid distributed architecture.

- The **MAP client** interacts with the server via **RESTful APIs**.
- The **ME client** communicates through **RPC (Remote Procedure Call)**.
- **WebSockets** are used for real-time, bidirectional messaging between both clients.

All medical data and communication logs are stored in a **MySQL database**, managed through **phpMyAdmin** (XAMPP).

The system demonstrates how different communication paradigms can coexist in a distributed healthcare application.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js
- **Database**: MySQL (phpMyAdmin with XAMPP)
- **Protocols**: REST (MAP), RPC (ME), WebSockets (real-time messaging)
- **Data format**: JSON
