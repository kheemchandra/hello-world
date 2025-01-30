# Chit Chat App - Real-time Chat Application

Chit Chat App is a real-time chat application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js) along with Socket.IO for real-time communication.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Design Decisions](#design-decisions)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

-   **User Authentication:**
    -   Secure user signup and login functionality.
    -   JWT (JSON Web Tokens) for session management.
    -   Password hashing using bcrypt.
-   **Profile Management:**
    -   Users can set up and update their profiles (first name, last name, profile image, color theme).
    -   Profile image upload and deletion.
-   **Real-time Messaging:**
    -   Direct messaging (DM) between users.
    -   Channel-based group messaging.
    -   Real-time updates using Socket.IO.
-   **File Sharing:**
    -   Users can share files in DMs and channels.
    -   File upload progress and download functionality.
    -   Visual display of images within the chat.
-   **Typing Indicators:**
    -   Real-time typing indicators for both DMs and channels.
-   **Message Reactions:**
    -   Users can react to messages with emojis.
    -   Real-time reaction updates.
-   **Contact Management:**
    -   Search and add contacts.
    -   Contact list sorted by the most recent message.
-   **Channel Management:**
    -   Create and join channels.
    -   Channel member list.

## Architecture

The Chit Chat App follows a client-server architecture with a clear separation of concerns:

-   **Client (Frontend):**
    -   Built using React.js.
    -   Uses `react-router-dom` for routing.
    -   Uses `zustand` for state management.
    -   Uses `socket.io-client` for real-time communication with the server.
    -   UI components built with `shadcn/ui` library.
    -   Styling with Tailwind CSS.
    -   Handles user interface, user interactions, and real-time updates.

-   **Server (Backend):**
    -   Built using Node.js and Express.js.
    -   Uses MongoDB as the database (with Mongoose as the ODM).
    -   Uses `jsonwebtoken` for authentication.
    -   Uses `bcrypt` for password hashing.
    -   Uses `multer` for file uploads.
    -   Uses `socket.io` to enable real-time communication.
    -   Implements RESTful APIs for various functionalities (authentication, contacts, messages, channels).
    -   Handles data persistence, business logic, and real-time event management.

-   **Socket.IO (Real-time Communication):**
    -   `socket.io` is integrated into the server to provide real-time bidirectional communication.
    -   Handles events like sending messages, typing indicators, and message reactions.
    -   Uses a `userSocketMap` to track connected users and their socket IDs.

## Design Decisions

-   **UI Library (shadcn/ui):** `shadcn/ui` is used for building reusable and accessible UI components, providing a consistent and modern look and feel.
-   **State Management (zustand):** `zustand` is chosen for its simplicity and ease of use for managing global state in the React application.
-   **Styling (Tailwind CSS):** Tailwind CSS is used for utility-first styling, enabling rapid development and customization.
-   **File Storage:** Files are stored locally on the server in the `uploads` directory. For production, consider using cloud storage solutions like AWS S3 or Cloudinary.
-   **Socket.IO Events:**
    -   `sendMessage`, `send-channel-message`: Send messages in DMs and channels.
    -   `typing-started`, `typing-stopped`: Emit typing indicator events.
    -   `send-reaction`, `reaction-update`: Handle message reactions.
-   **Error Handling:** The server uses try-catch blocks to handle errors gracefully and returns appropriate error codes and messages to the client.

## Prerequisites

-   **Node.js:** (v14 or higher recommended) - [Download Node.js](https://nodejs.org/)
-   **npm:** (usually comes with Node.js)
-   **MongoDB:** - [Download MongoDB](https://www.mongodb.com/try/download/community)

## Installation and Setup

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2. **Install server dependencies:**

    ```bash
    cd server
    npm install
    ```

3. **Install client dependencies:**

    ```bash
    cd ../client
    npm install
    ```

4. **Set up environment variables:**
    -   Create a `.env` file in the `server` directory.
    -   Add the following environment variables:

    ```
    PORT=3001
    DATABASE_URL=<your-mongodb-connection-string>
    ORIGIN=http://localhost:5173
    JWT_KEY=<your-secret-jwt-key>
    ```

    -   Create a `.env` file in the `client` directory.
    -   Add the following environment variable:

    ```
    VITE_SERVER_URL=http://localhost:3001
    ```

5. **Database Setup:**
    -   Make sure MongoDB is running on your local machine or set the correct `DATABASE_URL` in the `server/.env` to point to your MongoDB instance.

## Running the Application

1. **Start the server:**

    ```bash
    cd server
    npm start
    ```

2. **Start the client:**

    ```bash
    cd ../client
    npm run dev
    ```

3. **Access the application:**
    -   Open your web browser and go to `http://localhost:5173` (or the port specified in your client's `.env`).

## Folder Structure

## Folder Structure

<pre>
chitchat-app/
├── client/ # Frontend (React.js)
│ ├── public/
│ ├── src/
│ │ ├── assets/
│ │ ├── components/
│ │ ├── context/
│ │ ├── lib/
│ │ ├── pages/
│ │ ├── store/
│ │ ├── utils/
│ │ ├── App.jsx
│ │ ├── index.css
│ │ ├── main.jsx
│ │ └── index.html
│ ├── package.json
│ ├── package-lock.json
│ ├── postcss.config.js
│ ├── tailwind.config.js
│ └── vite.config.js
├── server/ # Backend (Node.js, Express.js)
│ ├── controllers/
│ │ ├── AuthController.js
│ │ ├── ChannelController.js
│ │ ├── ContactsController.js
│ │ └── MessagesController.js
│ ├── middlewares/
│ │ └── AuthMiddleware.js
│ ├── models/
│ │ ├── ChannelModel.js
│ │ ├── MessagesModel.js
│ │ └── UserModel.js
│ ├── routes/
│ │ ├── AuthRoutes.js
│ │ ├── ChannelRoutes.js
│ │ ├── ContactRoutes.js
│ │ └── MessagesRoutes.js
│ ├── uploads/ # File storage (consider cloud storage for production)
│ │ ├── files/
│ │ └── profiles/
│ ├── index.js
│ ├── socket.js
│ ├── package.json
│ └── package-lock.json
├── .gitignore
└── README.md
</pre>




## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m "Add your commit message"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Create a pull request.

## License

This project is licensed under the MIT License 
