# PlanHattan-FrontEnd
Build a web application that helps users plan their day in New York City by recommending attractions and restaurants based on Predicted busyness levels 

## Project Demo Pictures
![image alt](https://github.com/RaghulPrasath-Here/PlanHattan-FrontEnd/blob/943d0cb6b6923e61cb5a70a2b500c44fc5541dd3/1.png)
![image alt](https://github.com/RaghulPrasath-Here/PlanHattan-FrontEnd/blob/943d0cb6b6923e61cb5a70a2b500c44fc5541dd3/2.png)

## Project Structure
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
├── App.css                      
├── App.jsx                      
├── index.css                    
└── main.jsx                     

