# CostCrew 💰

**CostCrew** is a modern expense sharing and group management application that helps you track shared expenses, manage groups, and calculate who owes whom. Perfect for roommates, travel groups, or any shared expenses!

## ✨ Features

- **👥 User Management** - Create and manage user profiles
- **🏢 Group Management** - Organize users into groups for different purposes (roommates, trips, etc.)
- **💳 Expense Tracking** - Add expenses with custom splits among group members
- **⚖️ Balance Calculation** - Automatically calculate who owes whom and by how much
- **📊 Expense Details** - View detailed breakdowns of shared costs
- **🗄️ SQLite Database** - Persistent data storage with better-sqlite3

## 🚀 Technology Stack

### Frontend

- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe development
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Clay UI** - Component library for consistent design
- **Vite** - Fast build tool and dev server

### Backend

- **Express.js** - Web server framework
- **better-sqlite3** - Embedded SQLite database
- **CORS** - Cross-origin resource sharing support
- **TypeScript** - Type-safe backend development

### Development Tools

- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Installation

### Prerequisites

- Node.js (v22 or higher recommended)
- npm or yarn

### Setup

1. Clone the repository:

```sh
git clone https://github.com/patrykr2001/costcrew.git
cd costcrew
```

2. Install dependencies:

```sh
npm install
```

## 🛠️ Development

### Run Frontend Only

```sh
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Run Backend Server Only

```sh
npm run dev:server
```

The backend will be available at `http://localhost:3000`

### Run Full Stack (Frontend + Backend)

```sh
npm run dev:full
```

Runs both frontend and backend concurrently.

## 🏗️ Building for Production

### Type-Check and Build

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## 🧪 Testing

### Run Unit Tests

```sh
npm run test:unit
```

### Run E2E Tests with Playwright

```sh
# Install browsers for the first run
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run tests in a specific browser
npm run test:e2e -- --project=chromium

# Run tests in debug mode
npm run test:e2e -- --debug
```

## 🎨 Code Quality

### Lint Code

```sh
npm run lint
```

### Format Code

```sh
npm run format
```

## 📁 Project Structure

```
costcrew/
├── src/                      # Frontend source code
│   ├── components/          # Vue components
│   │   ├── UserManagement.vue
│   │   ├── GroupManagement.vue
│   │   ├── ExpenseManagement.vue
│   │   └── BalanceView.vue
│   ├── stores/              # Pinia state management
│   ├── router/              # Vue Router configuration
│   └── views/               # Page components
├── server/                   # Backend source code
│   ├── index.ts             # Express server entry point
│   ├── database/            # Database configuration
│   └── routes/              # API routes
│       ├── users.ts
│       ├── groups.ts
│       ├── expenses.ts
│       └── balances.ts
├── e2e/                      # End-to-end tests
└── public/                   # Static assets
```

## 🔌 API Endpoints

### Users

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID

### Groups

- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create a new group
- `POST /api/groups/:id/members` - Add member to group
- `GET /api/groups/:id/members` - Get group members

### Expenses

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/:id/shares` - Get expense shares

### Balances

- `GET /api/balances/:groupId` - Get balances for a group

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🔧 IDE Setup

### Recommended

- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur if installed)

### Configuration

TypeScript support for `.vue` imports is provided by `vue-tsc`. Make sure Volar is installed in your editor for proper TypeScript language service support.

## 📚 Learn More

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vite.dev/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Express Documentation](https://expressjs.com/)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
