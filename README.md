Visitor Entry Pass System

A full-stack application designed to streamline and digitize the visitor registration and tracking process for institutions like schools, offices, or gated communities.
🚀 Features

    Visitor Registration
    Register visitors by capturing their contact number, email, name, image, child’s name & class (if applicable), reason for visit, and location.

    Smart Visitor Lookup
    Automatically retrieves existing visitor details based on contact number, eliminating the need for re-entering information.

    Visitor Image Upload
    Visitors can upload a photo during registration, which is stored for identification purposes.

    Advanced Search
    Search visitors using various filters: contact number, name, date, location, child's name, etc.

    Visit History
    Maintains a comprehensive log of each visitor’s past visits, including date, time, reason, and location.

Sample Images

  ![Screenshot from 2025-05-03 10-10-54](https://github.com/user-attachments/assets/727d465f-790f-48f9-a694-464c6b5c88fe)
  ![Screenshot from 2025-05-06 11-12-22](https://github.com/user-attachments/assets/7c9767a7-64ca-450e-954e-bc12e96e5b8d)
  ![Screenshot from 2025-05-06 11-12-31](https://github.com/user-attachments/assets/f10c1753-bfff-48c7-9c5c-9b61f3021959)
  ![Screenshot from 2025-05-06 11-13-07](https://github.com/user-attachments/assets/78e7ee43-6972-410b-8b86-35354f0403f3)
  ![Screenshot from 2025-05-06 11-13-16](https://github.com/user-attachments/assets/2785b935-30e4-42aa-8195-57cc98fd12a0)
  ![Screenshot from 2025-05-06 11-13-39](https://github.com/user-attachments/assets/939674d1-40fa-465c-aecc-9a41170fbf31)
  ![Screenshot from 2025-05-06 11-13-53](https://github.com/user-attachments/assets/a64f620d-1256-4430-9fa6-fda964ca5ca6)
  ![Screenshot from 2025-05-06 11-14-16](https://github.com/user-attachments/assets/4cb20b83-f050-4807-91db-a4e7e9d8695c)

🛠 Tech Stack

    Spring Boot:-	Backend framework for building robust REST & GraphQL APIs.
    React.js:-	Frontend framework for building a responsive user interface.
    MongoDB:-	NoSQL database used to store visitor and visit records.
    Tailwind CSS:-	Utility-first CSS framework for efficient styling.
    GraphQL:-	Query language used for precise and flexible data fetching.
    REST API:-	Standard RESTful endpoints for interoperability.


🔐 Authentication & Security

The application includes a robust authentication system with the following features:

    JWT Authentication
    Secure user login using JSON Web Tokens (JWT). Access tokens are issued upon successful login and used to authorize API requests.

    Refresh Token Mechanism
    Refresh tokens are issued alongside access tokens to allow silent re-authentication without forcing users to log in repeatedly. This improves UX while maintaining security.

    JWT Blacklist on Logout
    When a user logs out, their JWT is invalidated by storing it in a blacklist to prevent reuse, even if it hasn’t expired. This protects against token theft and replay attacks.

    Role-Based Access Control (RBAC)
    Users are assigned roles (e.g., ADMIN, RECEPTIONIST), and access to API endpoints is restricted based on roles and authorities.

    Token Expiry Handling
    Access tokens have a short lifespan, and refresh tokens have a longer one. The backend handles token validation and expiry automatically.
    
