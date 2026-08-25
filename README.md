# Vue System Real-time

A lightweight, open-source real-time system monitoring application built with Vue, WebSocket, and systeminformation.

Monitor your system resources directly from a web interface, including CPU, RAM, GPU, temperature, clock speed, and per-core usage.

## Features

- Real-time CPU monitoring
- Real-time RAM monitoring
- Real-time GPU monitoring
- CPU temperature and clock speed
- Per-core CPU usage
- Multiple GPU support
- WebSocket-based communication
- Minimal and responsive interface

## Tech Stack

- Vue 3
- Vite
- Tailwind CSS
- Node.js
- WebSocket
- systeminformation

## Installation

```bash
git clone https://github.com/PluemStudio/system-realtime.git
cd system-realtime/main-app
pnpm install
```

Start the development server:

```bash
pnpm run dev
```

Start the WebSocket server:

```bash
cd main-backend
node index.js
```

The frontend will connect to:

```bash
ws://localhost:8080
```

### Contributing

Contributions are welcome.

- Fork this repository.
- Create a new branch.
- Make your changes.
- Commit and push your branch.
- Open a Pull Request.

Feel free to contribute new features, improvements, bug fixes, or documentation.

### License

Licensed under the MIT License.
