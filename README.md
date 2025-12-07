# Task Manager Pro

A full-stack task management application built with the MERN stack (MongoDB, Express.js, React, Node.js). This project features a monorepo structure with separate frontend (web and mobile) and backend applications.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Task Filtering**: Filter tasks by status and priority
- **Search Functionality**: Search tasks by title and description
- **Pagination**: Efficient pagination for large task lists
- **Task Sorting**: Sort tasks by various fields (createdAt, dueDate, title, priority, status)
- **Priority Levels**: Assign low, medium, or high priority to tasks
- **Status Tracking**: Track task status (todo, in-progress, done)
- **Due Dates**: Set and track due dates for tasks
- **Multi-Platform**: Web application (React + Vite) and Mobile application (React Native + Expo)
- **Security**: Rate limiting, helmet security headers, CORS protection
- **Input Validation**: Comprehensive validation using Joi schemas

## 📁 Project Structure

```
Task-Manager-Pro/
├── backend/              # Backend API server (Node.js + Express)
│   ├── src/
│   │   ├── app.js       # Express app configuration
│   │   ├── server.js    # Server entry point
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Custom middleware (auth, validation, error handling)
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Utility functions
│   │   └── validators/  # Joi validation schemas
│   └── package.json
├── web/                  # Web frontend (React + Vite)
│   ├── src/
│   │   ├── api/         # API client configuration
│   │   ├── components/  # React components
│   │   ├── features/    # Feature-based modules (auth, tasks)
│   │   ├── hooks/       # Custom React hooks
│   │   └── pages/       # Page components
│   └── package.json
├── mobile/               # Mobile application (React Native + Expo)
│   ├── app/             # Expo Router pages
│   ├── components/      # React Native components
│   ├── screens/         # Screen components
│   ├── contexts/        # React contexts
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Joi** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

### Web Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Axios** - HTTP client
- **Material-UI** - UI component library
- **React Toastify** - Toast notifications

### Mobile
- **React Native** - Mobile framework
- **Expo** - Development platform
- **Expo Router** - File-based routing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Task-Manager-Pro
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-manager-pro
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:5173
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

### 3. Web Frontend Setup

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the web directory (if needed):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`.

5. Build for production:
   ```bash
   npm run build
   ```

### 4. Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm run dev
   ```

   Follow the Expo CLI instructions to run on iOS simulator, Android emulator, or physical device.

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRE` | JWT token expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

### Web (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

## 📚 API Documentation

For detailed API documentation, see [APIDOCS.md](./APIDOCS.md).

## 🧪 Testing

### Backend Health Check

Test if the backend server is running:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🏗️ Development

### Code Quality

This project uses ESLint and Prettier for code quality and formatting.

**Run linting:**
```bash
npx eslint .
```

**Format code:**
```bash
npx prettier --write .
```

### Project Scripts

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

#### Web
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### Mobile
- `npm run dev` - Start Expo development server
- `npm start` - Start Expo (alias for dev)

## 🔒 Security Features

- **Password Hashing**: Passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks on auth endpoints
- **Helmet**: Security headers for Express
- **Input Validation**: Comprehensive validation using Joi schemas
- **CORS**: Configurable cross-origin resource sharing

## 📝 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering, search, pagination)
- `GET /api/tasks/:id` - Get a single task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Health Check
- `GET /health` - Server health check

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or your MongoDB Atlas connection string is correct
- Check that the `MONGODB_URI` in your `.env` file is properly formatted

### Port Already in Use
- Change the `PORT` in your `.env` file to an available port
- Or stop the process using the port

### CORS Errors
- Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Check that the backend server is running

### Authentication Issues
- Verify that JWT tokens are being sent in the `Authorization` header
- Check that `JWT_SECRET` is set in your backend `.env` file

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC

## 👨‍💻 Author

Task Manager Pro Development Team

## 🙏 Acknowledgments

- Express.js community
- React community
- MongoDB documentation
- All contributors and users

---

For detailed API documentation, please refer to [APIDOCS.md](./APIDOCS.md).
