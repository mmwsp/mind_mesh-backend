# mind_mesh/ backend

Backend for a Q&A service designed for programmers, featuring functionality such as a rating system, security measures, and more.

## Installation

1. Clone project 
    ```sh
    git clone https://github.com/mmwsp/mind_mesh-backend
    ```
2. In the root of project run
    ```sh
    npm install
    ```
3. Create and fill config file .env with your data
4. Run the server
    ```sh
    npm start
    ```

## Stack

API uses a number of open source projects and packages:

- [Node.js](https://nodejs.org/en/) - evented I/O for the backend
- [Express](https://expressjs.com/) - fast node.js network app framework 
- [MySQL](https://www.mysql.com/) - open-source relational database management system 
- [TypeORM](https://typeorm.io) - modern TypeScript and Node.js ORM for Oracle, Postgres, MySQL, MariaDB, SQLite and SQL Server, and more
- [Nodemailer](https://nodemailer.com/about/) - module for Node.js applications to allow easy as cake email sending
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - implementation of JSON Web Tokens
- [cookie-parser](https://www.npmjs.com/package/cookie-parser) - cookie parser middleware
- [uuid](https://www.npmjs.com/package/uuid) -  used for generating universally unique identifiers
- [cheerio](https://cheerio.js.org) - library for parsing and manipulating HTML in node.js
- [dotenv](https://www.npmjs.com/package/dotenv) -  used for managing environment variables
- [bcrypt](https://www.npmjs.com/package/bcrypt) - library to help you hash passwords
- [cors](https://www.npmjs.com/package/cors) - node.js package for providing a middleware that can be used to enable CORS with various options



## Endpoints

### Authorization
| Method | Endpoint | Description | Parameters |
| ------ | -------- | ----------- | ---------- |
| POST   | `/api/auth/register` | Registration of a new user | login, password, email, fullname |
| POST   | `/api/auth/login` | Login. Only users with a confirmed email can use the full functionality of the service | email, password |
| POST   | `/api/auth/logout` | Logout. Refresh token from cookies | - |
| POST   | `/api/auth/password-reset` | Send email with a link for password reset | email |
| POST   | `/api/auth/password-reset/:link` | Reset the password | newPassword |
| GET    | `/api/auth/refresh` | Returns new access token and refresh token (refresh token attached in cookies) | refreshToken |
| GET    | `/api/auth/activate/:link` | Confirms users email and activates users account | - |

### User
| Method | Endpoint | Description | Parameters |
| ------ | -------- | ----------- | ---------- |
| GET    | `/api/users/` | Get users | - |
| GET    | `/api/users/:id` | Get a specified user | - |
| POST   | `/api/users/changepass` | Change user's password (not reset) | passwords |
| POST   | `/api/admin/user` | Create new user by Admin | login, password, email, role, fullname |
| PATCH  | `/api/users/update` | Update user info. updatedFields object (can contain fullname, login, email) | updatedFields |
| PATCH  | `/api/users/avatar` | Upload new profile image | photo |
| DELETE | `/api/users/avatar` | Delete user's profile image | - |
| DELETE | `/api/users` | Delete my account | - |
| DELETE | `/api/users/:id` | Delete user's account (for admins) | - |

### Post
| Method | Endpoint | Description | Parameters |
| ------ | -------- | ----------- | ---------- |
| POST   | `/api/posts/` | Create a new post | title, content, author_id, categories |
| POST   | `/api/posts/:id/reaction` | Create a reaction (like or dislike) | reactionType |
| GET    | `/api/posts/` | Get all posts with "active" status | - |
| GET    | `/api/posts/:id` | Get a specified post | - |
| GET    | `/api/posts/:id/reactions` | Get post's reactions | - |
| GET    | `/api/posts/user/:id` | Get all user's posts | - |
| GET    | `/api/posts/user-active/:id` | Get only user's active posts | - |
| GET    | `/api/posts/check-reaction/:id` | Check if the user put a reaction to the post and returns type of reaction | userId |
| GET    | `/api/admin/posts` | Get all posts | - |
| PATCH  | `/api/posts/:id` | Update post | updatedFields |
| PATCH  | `/api/admin/post/:id` | Update post by admin | updatedFields |
| DELETE | `/api/posts/:id` | Delete post | - |
| DELETE | `/api/posts/:id/reaction` | Delete user's reaction | - |

### Comment
| Method | Endpoint | Description | Parameters |
| ------ | -------- | ----------- | ---------- |
| POST   | `/api/comments/post/:id` | Create comment | content, reply |
| POST   | `/api/comments/mark/:id` | Mark a comment as an answer | postId |
| POST   | `/api/comments/unmark/:id` | Unmark answer | postId |
| POST   | `/api/comments/:id/reaction` | Create a reaction | reactionType |
| GET    | `/api/comments/post/:id` | Get post comments | - |
| GET    | `/api/comments/:id/reaction` | Get post reactions | - |
| GET    | `/api/comments/check-reaction/:id` | Check if the user put a reaction to the comment and returns type of reaction | - |
| PATCH  | `/api/comment/:id` | Update comment | content |
| PATCH  | `/api/admin/comment/:id` | Set comment status by admin | - |
| DELETE | `/api/comments/:id` | Delete comment | - |
| DELETE | `/api/comments/reaction/:id` | Delete reaction | - |

### Category
| Method | Endpoint | Description | Parameters |
| ------ | -------- | ----------- | ---------- |
| GET    | `/api/categories/` | Get categories | - |
| POST   | `/api/categories/` | Create a category | title, description |
| PATCH  | `/api/categories/` | Change a category | categoryId, newTitle, newDescription |
| DELETE | `/api/categories/:id` | Delete a category | - |


## Database schema

![Schema image](https://i.imgur.com/kxYYr3L.png)