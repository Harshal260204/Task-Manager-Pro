# Task Manager Pro - Mobile App

React Native mobile application for Task Manager Pro.

## Setup

1. Install dependencies:
```bash
npm install
```

2. For iOS:
```bash
cd ios && pod install && cd ..
npm run ios
```

3. For Android:
```bash
npm run android
```

## Configuration

Update the API URL in `api/axios.ts` to match your backend server.

## Features

- Login with token persistence
- Task list with pull-to-refresh
- Create and edit tasks
- Offline error handling
- Activity indicators for loading states

