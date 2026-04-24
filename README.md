# PlaceReady

A full-stack web application built with the MERN stack.

## Tech Stack

| Layer      | Technology          |
| ---------- | ------------------- |
| Frontend   | React (Vite)        |
| Backend    | Node.js + Express   |
| Database   | MongoDB (Mongoose)  |
| Auth       | JWT                 |
| AI         | Google Gemini API   |

## Project Structure

```
PlaceReady/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── context/
├── server/          # Express backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── config/
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB instance (local or Atlas)

### Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Copy `.env.example` to `server/.env` and fill in the values.

### Running the App

```bash
# Start the backend
cd server
npm run dev

# Start the frontend (in a separate terminal)
cd client
npm run dev
```

## API

| Method | Endpoint       | Description        |
| ------ | -------------- | ------------------ |
| GET    | /api/health    | Server health check |

## License

MIT
