### E-Commerce Platform

Full-stack e-commerce platform for Pakistani fashion built with Node.js, Express.js, PostgreSQL, and EJS.

## Features

### Customer Features
- User registration and authentication
- Product browsing with search and filters
- Shopping cart with real-time updates
- Multiple checkout options (Cart checkout & Buy Now)
- Order tracking and history
- Profile management
- Contact form

### Admin Features
- Product management (CRUD)
- Inventory management
- Order management with status updates
- User management
- Contact message management
- Site settings (carousel images, popup)
- Sales dashboard with statistics

## Tech Stack

**Backend:**
- Node.js
- Express.js 
- PostgreSQL (pg)
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- cookie-parser
- dotenv

**Frontend:**
- EJS (templating)
- Vanilla JavaScript
- CSS3
- Font Awesome

## Installation

### Prerequisites
- Node.js 
- PostgreSQL


## Database Schema

### Tables
- **users** - User accounts and authentication
- **products** - Product catalog
- **product_variants** - Product sizes, colors, prices
- **product_images** - Product images
- **cart** - Shopping carts
- **cart_items** - Cart line items
- **orders** - Order records
- **order_items** - Order line items
- **contact_messages** - Contact form submissions
- **site_settings** - Site configuration

## API Endpoints

### Public Routes
- `GET /` - Home page
- `GET /list` - Product listing
- `GET /product/:id` - Product details
- `GET /contact` - Contact page
- `POST /contact/submit` - Submit contact form

### Auth Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /logout` - Logout

### Protected Routes (Require Authentication)
- `GET /account` - User account
- `GET /checkout` - Checkout page
- `POST /cart/add` - Add to cart
- `POST /order/create` - Create order
- `POST /buy-now` - Buy now (single product)

### Admin Routes (Require Admin Access)
- `GET /admin` - Dashboard
- `GET /admin/products` - Product management
- `GET /admin/orders` - Order management
- `GET /admin/users` - User management
- `GET /admin/messages` - Contact messages
- `GET /admin/settings` - Site settings

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- HttpOnly cookies
- SQL injection protection (parameterized queries)
- Transaction locks for cart operations
- Ownership verification for orders/cart
- Input validation and sanitization

## Project Structure
# 📁 Project Structure

```bash
root/
├── config/
│   └── db.js                     # PostgreSQL database configuration
│
├── controllers/
│   ├── adminController.js        # Admin dashboard and management logic
│   ├── authController.js         # Authentication and authorization
│   ├── cartController.js         # Cart operations and management
│   ├── contactController.js      # Contact form handling
│   ├── orderController.js        # Order creation and processing
│   ├── payoutController.js       # Payment and payout handling
│   ├── productController.js      # Product CRUD operations
│   ├── settingsController.js     # Website settings management
│   └── userController.js         # User profile and account management
│
├── middleware/
│   ├── authMiddleware.js         # JWT authentication middleware
│   ├── authPage.js               # Page protection middleware
│   └── cartData.js               # Inject cart data into views
│
├── models/
│   ├── productModel.js           # Product database queries
│   └── userModel.js              # User database queries
│
├── routes/
│   ├── adminRoutes.js            # Admin panel routes
│   ├── authRoutes.js             # Login/Register routes
│   ├── cartRoutes.js             # Cart-related routes
│   ├── orderRoutes.js            # Order and checkout routes
│   └── pageRoutes.js             # Main website pages
│
├── services/
│   └── cartServices.js           # Business logic for cart system
│
├── utils/
│   └── jwt.js                    # JWT token generation and verification
│
├── views/
│   ├── layouts/
│   │   ├── admin/                # Admin panel templates
│   │   └── (all page templates)  # Main EJS page templates
│   │
│   └── partials/
│       └── (header, footer, etc.) # Reusable EJS partial components
│
├── public/
│   ├── css/                      # Stylesheets
│   ├── js/                       # Frontend JavaScript files
│   ├── images/                   # Images and assets
│   └── sounds/                   # Audio files
│
├── .env                          # Environment variables
├── .gitignore                    # Ignored files for Git
├── app.js                        # Express application setup
├── index.js                      # Application entry point
├── package.json                  # Project metadata and dependencies
└── README.md                     # Project documentation




## Support

For support, email mehmoodtahir608@gmail.com or create an issue in the repository.
