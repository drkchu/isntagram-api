# Isntagram API

This is the backend API for my social media app. The API supports user authentication, posts, comments, and chats. Built with Node.js and Express.js, using PostgreSQL as the database and Prisma ORM for database management. Featuring custom JWT-based authentication and GitHub OAuth integration.

## ER Diagram

![Project Architecture](assets/er_diagram.png)

## Features

- Custom JWT-based authentication
- GitHub OAuth integration
- CRUD operations for posts, comments, and chats

## Endpoints

| **Endpoint**             | **HTTP Request** | **Description**                                              | **Requires Authentication?** | **Requires Admin?** |
| ------------------------ | ---------------- | ------------------------------------------------------------ | :--------------------------: | :-----------------: |
| `/auth/register`         | POST             | Registers a new user with email and password.                |              ❌              |         ❌          |
| `/auth/login`            | POST             | Logs in a user with email and password.                      |              ❌              |         ❌          |
| `/auth/github`           | GET              | Redirects the user to GitHub for OAuth authentication.       |              ❌              |         ❌          |
| `/auth/github/callback`  | GET              | Handles the callback from GitHub after OAuth authentication. |              ❌              |         ❌          |
| `/auth/logout` (!!!)     | POST             | Logs out the currently authenticated user.                   |              ✅              |         ❌          |
| `/posts`                 | POST             | Create a post with an image upload                           |              ✅              |         ❌          |
| `/posts`                 | GET              | Get all posts from the authenticated user                    |              ✅              |         ❌          |
| `/posts/:id`             | GET              | Get a single post by post ID if authorized                   |              ✅              |         ❌          |
| `/posts/:id `            | PATCH            | Update a specific post by ID                                 |              ✅              |         ❌          |
| `/posts/:id`             | DELETE           | Deletes a specific post by ID                                |              ✅              |         ❌          |
| `/posts/:id/like`        | POST             | Authenticated user likes the specific post by ID             |              ✅              |         ❌          |
| `/posts/:id/like`        | DELETE           | Authenticated user unlikes the specific post by ID           |              ✅              |         ❌          |
| `/users/`                | GET              | Get information from all users, no passwords                 |              ✅              |         ✅          |
| `/users/` (!!!)          | PATCH            | Update user information, admins can too                      |              ✅              |         ❌          |
| `/users/self`            | GET              | Get information for the authenticated user                   |              ✅              |         ❌          |
| `/users/search`          | GET              | Search based on email or username                            |              ❌              |         ❌          |
| `/users/:id`             | GET              | Get a user's profile information                             |              ❌              |         ❌          |
| `/users/:id/followers`   | GET              | Get a user's followers information (id, username, profile)   |              ❌              |         ❌          |
| `/users/:id/following`   | GET              | Get a user's following information (id, username, profile)   |              ❌              |         ❌          |
| `/users/:userId/profile`  | PATCH            | Update's a user's profile information                        |              ✅              |         ❌          |
| `/users/:userId`          | DELETE           | Delete's a user, either self delete or admin deletion        |              ✅              |         ❌          |
| `/users/:userId/follow`   | POST             | The authenticated user follows the user w/ userId            |              ✅              |         ❌          |
| `/users/:userId/unfollow` | POST             | The authenticated user unfollows the user w/ userId          |              ✅              |         ❌          |
| `/users/:userId/role`     | PATCH            | Update the role of a user (admin or nah)                     |              ✅              |         ✅          |
| `/comments/:postId`       | GET              | Get all the comments on a post if authorized                 |              ✅              |         ❌          |
| `/comments/:postId`       | POST             | Post a comment to a post, optional parent                    |              ✅              |         ❌          |
| `/comments/:commentId`    | PATCH            | Update a specific comment                                    |              ✅              |         ✅          |
| `/comments/:commentId`    | DELETE           | Delete a specific comment, admins can too                    |              ✅              |         ❌          |

## Development

## Future Steps

idk
