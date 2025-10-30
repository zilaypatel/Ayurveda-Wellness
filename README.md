# Ayurveda Wellness

A modern web application that brings the ancient wisdom of Ayurveda to the digital age. Built with React, TypeScript, and Supabase, this platform offers personalized Ayurvedic wellness solutions.

## Features

- 🔐 User Authentication
- 👤 User Profile Management
- 📋 Prakriti Quiz (Body Constitution Assessment)
- 🗓️ Daily Schedule Recommendations
- 👨‍⚕️ Admin Dashboard

## Tech Stack

- Frontend:
  - React with TypeScript
  - Vite (Build tool)
  - Tailwind CSS (Styling)
  - Context API (State Management)

- Backend:
  - Supabase (Backend as a Service)
  - PostgreSQL Database

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/zilaypatel/Ayurveda-Wellness
cd ayurveda-wellness
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/      # React components
├── contexts/       # React context providers
├── lib/           # Utility functions and configurations
└── App.tsx        # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
