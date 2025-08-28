# NSO Admin Dashboard

A modern, responsive admin dashboard for the Nigerian Standard Organization (NSO) Healthcare Management System. Built with React, TypeScript, and Material-UI.

## 🚀 Features

### 📊 **Dashboard Overview**
- Real-time statistics and metrics
- Interactive charts and visualizations
- User activity trends
- System health monitoring
- Geographic distribution analytics

### 👥 **User Management**
- Comprehensive user directory
- Role-based access control
- User activity tracking
- Account status management
- Bulk operations support

### 📈 **Analytics & Reporting**
- User growth trends
- Feature usage analytics
- Geographic distribution
- Device platform statistics
- Performance metrics

### 🔄 **Sync Management**
- Real-time sync monitoring
- Operation status tracking
- Error handling and retry logic
- Progress visualization
- Detailed sync logs

### 📋 **Activity Logs**
- Comprehensive audit trail
- Advanced filtering options
- Real-time activity monitoring
- Security event tracking
- Export capabilities

### ⚙️ **Settings & Configuration**
- System configuration
- User profile management
- Notification preferences
- Security settings
- Theme customization

## 🎨 **Design Features**

### **Modern UI/UX**
- Clean, professional interface
- Responsive design for all devices
- Dark/light theme support
- Smooth animations and transitions
- Intuitive navigation

### **Material Design 3**
- Latest Material-UI components
- Consistent design language
- Accessibility compliance
- Mobile-first approach
- Custom theme integration

### **Interactive Elements**
- Animated charts and graphs
- Real-time data updates
- Interactive data tables
- Modal dialogs and forms
- Toast notifications

## 🛠 **Technology Stack**

### **Frontend**
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Material-UI v5** - Component library
- **React Router v6** - Client-side routing
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization

### **State Management**
- **React Query** - Server state management
- **React Context** - Global state
- **React Hook Form** - Form handling

### **Development Tools**
- **Create React App** - Build tooling
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static typing

## 📦 **Installation**

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Git

### **Setup Steps**

1. **Navigate to admin directory**
   ```bash
   cd nso_v11/admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔐 **Demo Accounts**

### **Super Admin**
- **Email:** `admin@nso.gov.ng`
- **Password:** `admin123`
- **Permissions:** Full system access

### **Data Analyst**
- **Email:** `analyst@nso.gov.ng`
- **Password:** `analyst123`
- **Permissions:** Analytics and reporting

## 📱 **Responsive Design**

The dashboard is fully responsive and works seamlessly across:
- **Desktop** (1920px+)
- **Laptop** (1366px+)
- **Tablet** (768px+)
- **Mobile** (320px+)

## 🎯 **Key Components**

### **Layout Components**
- `Sidebar` - Navigation sidebar with collapsible menu
- `Header` - Top navigation with user profile and notifications
- `LoadingScreen` - Animated loading screen

### **Page Components**
- `Dashboard` - Main overview with statistics and charts
- `Users` - User management with data grid
- `Analytics` - Comprehensive analytics dashboard
- `SyncManagement` - Sync operation monitoring
- `ActivityLogs` - System activity and audit logs
- `Settings` - System and user configuration

### **Common Components**
- `AuthProvider` - Authentication context
- `LoadingScreen` - Loading states
- Various UI components and utilities

## 🔧 **Configuration**

### **Environment Variables**
Create a `.env` file in the admin directory:

```env
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_APP_NAME=NSO Admin Dashboard
REACT_APP_VERSION=1.0.0
```

### **API Integration**
The dashboard connects to the NSO backend API:
- Base URL: `http://localhost:3000/api/v1`
- Authentication: JWT tokens
- Real-time updates via WebSocket (planned)

## 📊 **Dashboard Sections**

### **1. Overview Dashboard**
- Total users: 12,847
- Active sessions: 3,421
- Sync operations: 8,934
- Error rate: 0.8%

### **2. User Analytics**
- User growth trends
- Geographic distribution
- Device platform breakdown
- Activity patterns

### **3. System Monitoring**
- Sync success rates
- Error tracking
- Performance metrics
- System health status

## 🚀 **Deployment**

### **Build for Production**
```bash
npm run build
```

### **Deploy to Server**
```bash
# Copy build folder to web server
cp -r build/* /var/www/nso-admin/

# Configure nginx/apache
# Point domain to build directory
```

### **Docker Deployment**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 **Security Features**

- JWT-based authentication
- Role-based access control
- Session management
- CSRF protection
- Input validation
- Audit logging

## 📈 **Performance**

- Lazy loading for routes
- Code splitting
- Image optimization
- Caching strategies
- Bundle size optimization

## 🧪 **Testing**

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📝 **Contributing**

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 **License**

Copyright © 2024 Nigerian Standard Organization. All rights reserved.

## 🆘 **Support**

For technical support or questions:
- Email: support@nso.gov.ng
- Documentation: [NSO Admin Docs](https://docs.nso.gov.ng)
- Issues: [GitHub Issues](https://github.com/nso/admin/issues)

---

**NSO Admin Dashboard v1.0** - Modern healthcare management interface for the Nigerian Standard Organization.
