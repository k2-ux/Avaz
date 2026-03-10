# Avaz — Cloud-Synced Voice Diary (React Native + AWS)

Avaz is a cross-platform mobile voice diary that allows users to record personal audio entries and automatically synchronize them to the cloud. The application demonstrates a production-style mobile architecture combining React Native with AWS Cognito authentication and Amazon S3 storage.

The project focuses on offline-first design, secure user authentication, and cloud synchronization. Audio entries are recorded locally, uploaded to S3 when the user is authenticated, and streamed from the cloud when needed.

---

## Overview

Avaz is designed as a personal audio journal. Users can:

- Record voice entries
- View a timeline of previous recordings
- Automatically sync recordings to the cloud
- Stream recordings directly from S3 after upload

The app supports offline recording and automatically uploads entries once the user logs in.

---

## Key Features

### Secure Authentication

User authentication is handled using AWS Cognito. Each user receives a unique identity that is mapped to AWS credentials through Cognito Identity Pools.

### Offline-First Recording

Audio entries are first stored locally on the device. This ensures recordings work even without network connectivity.

### Automatic Cloud Sync

Once the user logs in, the app detects unsynced entries and uploads them to Amazon S3.

### Per-User Cloud Storage

Each user’s recordings are stored in an isolated S3 folder based on their Cognito identity ID.

### Streaming Playback

After upload, recordings are streamed from S3 using signed URLs instead of local storage.

---

## Architecture

The system follows a modern mobile cloud architecture.

```
React Native App
       │
       ▼
AWS Cognito (User Authentication)
       │
       ▼
Cognito Identity Pool
       │
       ▼
Temporary AWS Credentials
       │
       ▼
Amazon S3 (Audio Storage)
```

Workflow:

1. User records audio
2. Audio saved locally on device
3. User logs in via Cognito
4. App obtains temporary AWS credentials
5. Unsynced recordings upload to S3
6. Local file is removed
7. Playback streams from S3 using signed URLs

---

## Technology Stack

Frontend

- React Native
- TypeScript
- Zustand (state management)
- React Navigation
- React Native Reanimated

Audio

- Nitro Sound / MediaPlayer integration
- Local file system storage via react-native-fs

Backend (AWS)

- AWS Cognito User Pools (authentication)
- Cognito Identity Pools (temporary AWS credentials)
- Amazon S3 (audio storage)

Libraries

- aws-amplify
- react-native-get-random-values
- web-streams-polyfill
- buffer

---

## Project Structure

```
src
 ├─ navigation
 │   └─ AppNavigator.tsx
 │
 ├─ screens
 │   ├─ LoginScreen.tsx
 │   ├─ SignupScreen.tsx
 │   ├─ HomeScreen.tsx
 │   ├─ RecordScreen.tsx
 │   └─ PreviewScreen.tsx
 │
 ├─ services
 │   ├─ amplify.ts
 │   ├─ authService.ts
 │   ├─ s3Service.ts
 │   └─ syncService.ts
 │
 ├─ store
 │   ├─ authStore.ts
 │   ├─ entryStore.ts
 │   └─ playerStore.ts
 │
 ├─ models
 │   └─ Entry.ts
 │
 └─ utils
     └─ time.ts
```

---

## Synchronization System

The synchronization logic ensures that local recordings are uploaded once authentication and AWS credentials are available.

Process:

1. App starts
2. Authentication state is checked
3. Unsynced entries are identified
4. AWS credentials are obtained
5. Audio files are uploaded to S3
6. Local files are deleted after successful upload

Example S3 path:

```
users/{identityId}/{entryId}.m4a
```

---

## Security Model

Security is handled using AWS Identity and Access Management (IAM).

Each authenticated user receives temporary credentials with permissions limited to:

```
s3:PutObject
s3:GetObject
s3:DeleteObject
```

Access is restricted to their own storage path.

---

## Running the Project

### 1 Install Dependencies

```
npm install
```

### 2 Start Metro

```
npx react-native start
```

### 3 Run Android

```
npx react-native run-android
```

---

## Environment Requirements

- Node.js
- React Native CLI
- Android Studio / Android Emulator
- AWS Account
- Amplify CLI

---

## Future Improvements

Potential enhancements for the project include:

- DynamoDB metadata storage for entries
- Multi-device synchronization
- Waveform visualization
- Audio tagging and search
- Background upload service
- End-to-end encryption

---

## Learning Goals

This project demonstrates:

- React Native mobile architecture
- Offline-first application design
- Cloud authentication with AWS Cognito
- Secure file uploads to Amazon S3
- Temporary AWS credentials using identity pools
- Mobile cloud synchronization patterns

---

## Author

Kamal Khastagir
React Native Developer
