# Isntagram API

This is the backend API for my social media app. The API supports user authentication, posts, comments, and chats. Built with Node.js and Express.js, using PostgreSQL as the database and Prisma ORM for database management. Featuring custom JWT-based authentication and GitHub OAuth integration with WebSocket-based real-time chat functionality for direct messages and group conversations

## ER Diagram

| ![Project Architecture](assets/er_diagram.png) | 
|:--:| 
| *In practice, the schemas might (slightly) differ* |

## Features

- Custom JWT-based authentication
- GitHub OAuth integration
- CRUD operations for posts, comments, and chats

## Endpoints

| **Endpoint**                 | **HTTP Request** | **Description**                                                   | **Requires Authentication?** | **Requires Admin?** |
| ---------------------------- | ---------------- | ----------------------------------------------------------------- | :--------------------------: | :-----------------: |
| `/auth/register`             | POST             | Registers a new user with email and password.                     |              ❌              |         ❌          |
| `/auth/login`                | POST             | Logs in a user with email and password.                           |              ❌              |         ❌          |
| `/auth/github`               | GET              | Redirects the user to GitHub for OAuth authentication.            |              ❌              |         ❌          |
| `/auth/github/callback`      | GET              | Handles the callback from GitHub after OAuth authentication.      |              ❌              |         ❌          |
| `/auth/logout` (!!!)         | POST             | Logs out the currently authenticated user.                        |              ✅              |         ❌          |
| `/posts`                     | POST             | Create a post with an image upload                                |              ✅              |         ❌          |
| `/posts`                     | GET              | Get all posts from the authenticated user                         |              ✅              |         ❌          |
| `/posts/:id`                 | GET              | Get a single post by post ID if authorized                        |              ✅              |         ❌          |
| `/posts/:id `                | PATCH            | Update a specific post by ID                                      |              ✅              |         ❌          |
| `/posts/:id`                 | DELETE           | Deletes a specific post by ID                                     |              ✅              |         ❌          |
| `/posts/:id/like`            | POST             | Authenticated user likes the specific post by ID                  |              ✅              |         ❌          |
| `/posts/:id/like`            | DELETE           | Authenticated user unlikes the specific post by ID                |              ✅              |         ❌          |
| `/users/`                    | GET              | Get information from all users, no passwords                      |              ✅              |         ✅          |
| `/users/` (!!!)              | PATCH            | Update user information, **_admin allowed_**                      |              ✅              |         ❌          |
| `/users/self`                | GET              | Get information for the authenticated user                        |              ✅              |         ❌          |
| `/users/search`              | GET              | Search based on email or username                                 |              ❌              |         ❌          |
| `/users/:id`                 | GET              | Get a user's profile information                                  |              ❌              |         ❌          |
| `/users/:id/followers`       | GET              | Get a user's followers information (id, username, profile)        |              ❌              |         ❌          |
| `/users/:id/following`       | GET              | Get a user's following information (id, username, profile)        |              ❌              |         ❌          |
| `/users/:userId/profile`     | PATCH            | Update's a user's profile information                             |              ✅              |         ❌          |
| `/users/:userId`             | DELETE           | Deletes a user, **_admin allowed_**                               |              ✅              |         ❌          |
| `/users/:userId/follow`      | POST             | The authenticated user follows the user w/ userId                 |              ✅              |         ❌          |
| `/users/:userId/unfollow`    | POST             | The authenticated user unfollows the user w/ userId               |              ✅              |         ❌          |
| `/users/:userId/role`        | PATCH            | Update the role of a user                                         |              ✅              |         ✅          |
| `/comments/:postId`          | GET              | Get all the comments on a post if authorized                      |              ✅              |         ❌          |
| `/comments/:postId`          | POST             | Post a comment to a post, optional parent                         |              ✅              |         ❌          |
| `/comments/:commentId`       | PATCH            | Update a specific comment, **_admin allowed_**                    |              ✅              |         ❌          |
| `/comments/:commentId`       | DELETE           | Delete a specific comment, **_admin allowed_**                    |              ✅              |         ❌          |
| `/chats/`                    | GET              | Get all conversations for the authenticated user                  |              ✅              |         ❌          |
| `/chats/`                    | POST             | Create a new conversation                                         |              ✅              |         ❌          |
| `/chats/:chatId`             | GET              | Get details of a specific conversation if authorized              |              ✅              |         ❌          |
| `/chats/:chatId`             | DELETE           | Delete a specific conversation if authorized, **_admin allowed_** |              ✅              |         ❌          |
| `/chats/:chatId/messages`    | GET              | Get all messages in a conversation                                |              ✅              |         ❌          |
| `/chats/:chatId/messages`    | POST             | Send a new message to a specific conversation                     |              ✅              |         ❌          |
| `/chats/messages/:messageId` | PATCH            | Update a specific message                                         |              ✅              |         ❌          |
| `/chats/messages/:messageId` | DELETE           | Delete a specific message, **_admin allowed_**                    |              ✅              |         ❌          |

## Development

...
