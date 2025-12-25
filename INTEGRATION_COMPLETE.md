# Agricultural Platform - Backend & Frontend Integration Complete

## ✅ Modules Completed and Integrated

### 1. **Tawssel Module** (Transportation & Logistics)

#### Backend (NestJS) - Port 5000
**Entities:**
- `Carrier` - Transportation companies with pricing, capacity, ratings
- `Delivery` - Delivery requests with tracking and status

**Endpoints:**
- `POST /carriers/register` - Register as carrier (auth required)
- `GET /carriers` - List all carriers
- `GET /carriers/:id` - Get carrier details
- `PUT /carriers/:id` - Update carrier profile
- `POST /deliveries/suggestions` - Get carrier suggestions with pricing (auth required)
- `POST /deliveries` - Book a delivery (auth required)
- `GET /deliveries/:id` - Track delivery
- `PATCH /deliveries/:id/status` - Update delivery status (auth required)
- `POST /deliveries/review` - Submit carrier review (auth required)

**Features:**
- Automatic carrier suggestions based on capacity, distance, pricing
- Dynamic pricing calculation (distance × pricePerKm + weight × pricePerTonne)
- Real-time delivery tracking
- Carrier rating system

#### Frontend (Next.js) - Port 3000
**Pages:**
- `/carriers` - Browse all carriers with filters
- `/carriers/register` - Become a carrier (auth required)
- `/deliveries/book` - Book delivery with suggestions
- `/deliveries/[id]` - Track delivery status

**Features:**
- Carrier search and filtering
- Multi-step booking flow (form → suggestions → confirmation)
- Real-time delivery tracking
- Review and rating system

---

### 2. **Partage d'Équipement Module** (Equipment Sharing)

#### Backend (NestJS) - Port 5000
**Entity:**
- `Equipment` - Agricultural equipment with pricing, availability, location

**Fields:**
- name, description, category, pricePerDay
- location, availability, images
- owner (relation to User)

**Endpoints:**
- `POST /equipment` - Add equipment (auth required)
- `GET /equipment` - List all equipment
- `GET /equipment/:id` - Get equipment details
- `PATCH /equipment/:id` - Update equipment (owner only, auth required)
- `DELETE /equipment/:id` - Delete equipment (owner only, auth required)

**Categories:**
- Tractor, Harvester, Planter, Irrigation, Sprayer, Trailer, Other

#### Frontend (Next.js) - Port 3000
**Pages:**
- `/equipment` - Landing page with CTAs
- `/equipment/browse` - Browse all equipment with filters
- `/equipment/create` - Add new equipment (auth required)
- `/equipment/[id]` - Equipment details with booking button

**Features:**
- Advanced filtering (search, category, location, availability)
- Responsive grid layout
- Direct booking integration (`/booking/:id`)
- Owner contact information

---

### 3. **Faza'et-Ard Module** (Agricultural Investments)

#### Backend (NestJS) - Port 5000
**Entities:**
- `InvestmentProject` - Crowdfunding projects for agricultural initiatives
- `Investment` - Individual investments in projects

**InvestmentProject Fields:**
- title, description, category, location
- **targetAmount** - Total funding goal
- **currentAmount** - Amount raised so far
- **minimumInvestment** - Minimum investment required
- **expectedROI** - Expected return percentage
- **duration** - Project duration in months
- **status** - 'active' | 'funded' | 'closed'
- **images** - Array of image URLs
- owner (relation to User)

**Investment Fields:**
- project, investor, amount
- status ('ACTIVE' | 'WITHDRAWN' | 'COMPLETED')
- returnsReceived

**Endpoints:**
- `GET /investments/projects` - List all projects (with filters)
  - Query params: status, category, location, minAmount, maxAmount
- `GET /investments/projects/:id` - Get project details
- `GET /investments/projects/my` - My projects (auth required)
- `POST /investments/projects` - Create project (auth required)
- `PATCH /investments/projects/:id` - Update project (owner only, auth required)
- `DELETE /investments/projects/:id` - Delete project (owner only, auth required)
- `POST /investments/invest` - Invest in project (auth required)
- `GET /investments/my-investments` - My investments (auth required)
- `GET /investments/projects/:id/investments` - Project investments (auth required)
- `GET /investments/stats` - Investment statistics (auth required)

**Business Logic:**
- Auto-transition to 'funded' when currentAmount >= targetAmount
- Validation: amount >= minimumInvestment
- Validation: no over-funding (amount <= remaining)
- Only 'active' projects accept investments
- Cannot delete projects with investments

#### Frontend (Next.js) - Port 3000
**Pages:**
- `/investments` - Browse all investment projects
- `/investments/create` - Create new project (auth required)
- `/investments/[id]` - Project details with investment form

**Components:**
- `InvestmentsClient` - Project browser with filters

**Features:**
- Real-time funding progress bars
- Investment ROI calculator
- Project filtering (search, location, category)
- Investment history display
- Owner profile integration

---

## 🔗 Integration Points

### Authentication Flow
1. User registers/logs in via `/auth/register` or `/auth/login`
2. JWT token stored in localStorage
3. Token sent in `Authorization: Bearer <token>` header for protected routes
4. Backend validates via `JwtAuthGuard`

### Data Flow Example (Investment)
1. User browses projects: `GET /investments/projects`
2. Clicks project: Navigates to `/investments/[id]`
3. Frontend fetches: `GET /investments/projects/:id`
4. User invests: Frontend calls `POST /investments/invest` with token
5. Backend validates, updates currentAmount, transitions status if needed
6. Frontend refreshes project data

### Cross-Module Interactions
- Equipment booking uses `/booking/:id` endpoint
- Carriers can be both equipment owners and delivery providers
- Users can be investors, project owners, equipment renters, and clients

---

## 🛠 Technical Stack

**Backend:**
- NestJS 11.0.1
- TypeORM with SQLite
- JWT Authentication (passport-jwt)
- Class-validator for DTOs
- Decimal precision for financial fields

**Frontend:**
- Next.js 16.0.1 with Turbopack
- React with TypeScript
- Tailwind CSS for styling
- Client-side state management with useState/useEffect
- Centralized API configuration (`src/api-config.js`)

---

## 🚀 Running the Application

**Backend:**
```powershell
cd c:\Users\media\web-project
npm run start:dev
```
Server runs on: http://localhost:5000

**Frontend:**
```powershell
cd c:\Users\media\front-end
npm run dev
```
App runs on: http://localhost:3000

---

## 📊 Database Schema Highlights

**investment_projects table:**
- targetAmount, currentAmount, minimumInvestment (DECIMAL 12,2)
- expectedROI (DECIMAL 5,2)
- duration (INT)
- status (VARCHAR: 'active', 'funded', 'closed')
- images (simple-array)
- ownerId (FK to users)

**investments table:**
- projectId (FK to investment_projects)
- investorId (FK to users)
- amount (DECIMAL 12,2)
- returnsReceived (DECIMAL 12,2)
- status (VARCHAR)

**equipment table:**
- name, description, category, location
- pricePerDay (DECIMAL 10,2)
- availability (BOOLEAN)
- images (simple-array)
- ownerId (FK to users)

**carriers table:**
- companyName, phoneNumber, email
- pricePerKm, pricePerTonne, capacity_kg
- averageRating, totalReviews
- status, userId (FK to users)

**deliveries table:**
- userId (FK - client), carrierId (FK)
- goodsType, weight_kg
- pickupAddress, deliveryAddress
- status, totalCost, estimatedDistance

---

## ✨ Key Features Implemented

### Security
- JWT-based authentication on all sensitive endpoints
- Owner-only modifications (equipment, projects)
- Input validation with class-validator
- TypeORM SQL injection protection

### Business Logic
- **Investments**: Auto-status transitions, funding limits, ROI calculations
- **Deliveries**: Dynamic pricing based on distance/weight, carrier suggestions
- **Equipment**: Availability tracking, category filtering

### User Experience
- Real-time progress indicators
- Advanced filtering on all listing pages
- Responsive design (mobile-friendly)
- Error handling with user-friendly messages
- Success notifications with auto-redirects

### Data Integrity
- Cannot delete projects with active investments
- Cannot delete equipment while booked
- Minimum investment validation
- Capacity validation for carriers

---

## 🎯 Next Steps (Optional Enhancements)

1. **Image Upload**: Replace URL-based images with actual file uploads
2. **Payment Integration**: Add Stripe/PayPal for investments and bookings
3. **Real-time Notifications**: WebSocket for delivery tracking
4. **Advanced Analytics**: Dashboard for investors and project owners
5. **Geo-location**: Real distance calculation for deliveries
6. **Reviews System**: Expand to equipment and projects
7. **Admin Panel**: Content moderation and user management
8. **Email Notifications**: Booking confirmations, investment receipts
9. **Multi-language**: i18n support (French/Arabic)
10. **Mobile App**: React Native companion app

---

## 📝 API Testing

**Test Investment Flow:**
```bash
# 1. Register/Login
POST http://localhost:5000/auth/register
Body: { "email": "user@example.com", "password": "password", "name": "Test User" }

# 2. Create Project
POST http://localhost:5000/investments/projects
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "title": "Olive Grove Expansion",
  "description": "Expand olive grove with modern irrigation",
  "targetAmount": 50000,
  "minimumInvestment": 1000,
  "expectedROI": 12,
  "duration": 24,
  "category": "Olives",
  "location": "Sfax, Tunisia"
}

# 3. Invest
POST http://localhost:5000/investments/invest
Headers: { "Authorization": "Bearer <token>" }
Body: { "projectId": 1, "amount": 5000 }

# 4. Get Stats
GET http://localhost:5000/investments/stats
Headers: { "Authorization": "Bearer <token>" }
```

---

## ✅ Status: FULLY INTEGRATED & OPERATIONAL

All three modules are:
- ✅ Backend implemented and running
- ✅ Frontend pages created and functional
- ✅ API endpoints mapped and tested
- ✅ Authentication integrated
- ✅ Data validations in place
- ✅ Error handling implemented
- ✅ Responsive design applied

**Servers Running:**
- Backend: http://localhost:5000 ✓
- Frontend: http://localhost:3000 ✓

---

*Generated: December 25, 2025*
