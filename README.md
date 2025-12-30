# PlanHattan-FrontEnd
[Planhattan](https://zeli8888.ddns.net/planhattan/) is a responsive web application that helps users plan their day in New York City by recommending attractions and restaurants based on Predicted busyness levels 

**Machine Learning Model Repository:** https://github.com/zeli8888/COMP47360_Team8_Data.git

**Backend Repository:** https://github.com/zeli8888/COMP47360_Team8_Backend.git

## Project Demo Pictures
![image alt](https://github.com/RaghulPrasath-Here/PlanHattan-FrontEnd/blob/943d0cb6b6923e61cb5a70a2b500c44fc5541dd3/1.png)
![image alt](https://github.com/RaghulPrasath-Here/PlanHattan-FrontEnd/blob/943d0cb6b6923e61cb5a70a2b500c44fc5541dd3/2.png)

## Project Structure
```
src/
├── api/                          # API configuration and service calls
├── assets/                       # Static assets (images, icons, fonts)
├── components/                   # Reusable React components having dateTime pickers etc
├── contexts/                     # React Context providers for state management
├── pages/                        # Main application pages and routes
│   ├── home/                     # Home page components and logic
│   ├── login-signup/             # Authentication pages (login/register)
│   └── planner/                  
│       ├── Categories/           # Types of Category Pages
│       ├── CategoryComponents/   # Common Template which will be reused by all Category pages
│       ├── discover/             # Plan discovery and browsing
│       ├── myplans/              # User's personal plans management
│       ├── recommendation/       # Plan recommendation system
│       ├── PlannerLayout.css     # Planner module styling
│       └── PlannerLayout.jsx     # Main planner layout component which is reused by all pages
```

---

## How to Run Locally

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd your-project-name
```

2. **Set up virtual environment**

```bash
npm install
#or
yarn install
```

3. **Run the app**

```bash
npm run dev
# or
yarn dev
```
---

## API Keys & Secrets

You need:
- MapBox API key
- Google Places API key
- Create a Mapbox Style and replace style url in [MapPanel.jsx](my-app/src/components/map/MapPanel.jsx#L627)

Store them in a `.env` file or as environment variables.
- VITE_PLANHATTAN_API_BASE_URL=https://zeli8888.ddns.net/planhattan/api
- VITE_REACT_APP_CONTEXT=/planhattan
- VITE_MAPBOX_TOKEN=YOUR_MAPBOX_TOKEN
- VITE_GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_MAP_KEY

---
