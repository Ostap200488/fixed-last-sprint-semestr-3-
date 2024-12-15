
# Real-Time Chat Application

This is a feature-complete real-time chat application developed as part of the **Final Sprint - Team Project**. The project demonstrates the integration of Express.js, MongoDB, EJS templates, and WebSockets for real-time communication.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Functionalities](#functionalities)
- [Project Structure](#project-structure)
- [Contributors](#contributors)

## Features
- **Real-Time Chat**: Send and receive messages instantly using WebSockets.
- **User Authentication**: Secure login and signup with bcrypt-hashed passwords.
- **Admin Dashboard**: Manage users, including the ability to ban or remove users.
- **Profiles**: View user profiles with username and join date.
- **Online Users Count**: Display the number of active users on the homepage.
- **Role-Based Access**: Separate features for admin and regular users.
- **Responsive Design**: User-friendly interface styled for clarity.

## Technologies Used
- **Backend**: Node.js, Express.js
- **Frontend**: EJS templates
- **Database**: MongoDB (via Mongoose)
- **WebSockets**: `express-ws`
- **Session Management**: `express-session`
- **Password Security**: `bcrypt`

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure MongoDB:
   - Ensure MongoDB is installed and running locally.
   - Update the `MONGO_URI` in `index.js` if required:
     ```javascript
     const MONGO_URI = 'mongodb://localhost:27017/chat_app';
     ```

4. Start the server:
   ```bash
   npm start
   ```
   - The server will run on [http://localhost:3000](http://localhost:3000).

## Usage
- **Homepage**: Unauthenticated users can view the number of online users and register or log in.
- **Chat**: Accessible only to logged-in users. Messages appear in real-time.
- **Admin Dashboard**: Admin users can view and manage all registered users.
- **Profile**: Users can view their profile or other users' profiles (admin only).

## Functionalities
### General
- Real-time communication via WebSockets.
- Online user notifications when someone joins or leaves the chat.

### User Authentication
- **Signup**:
  - Ensures unique usernames.
  - Stores passwords securely using bcrypt.

- **Login**:
  - Validates credentials and initializes a session.

### Admin
- View all users in the admin dashboard.
- Ban or remove users from the system.

### Profiles
- Display user join date and username.
- Restricted to logged-in users.


## Contributors
- **Ostap Demchuk**
- **Orest Demchuk**
- **Francis Nkowedi**
