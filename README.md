# Isntagram API

This is the backend API for my social media app. The API supports user authentication, posts, comments, and chats. Built with Node.js and Express.js, using PostgreSQL as the database and Prisma ORM for database management. Featuring custom JWT-based authentication and GitHub OAuth integration.

## ER Diagram

![Project Architecture](assets/er_diagram.png)

## Features

- Custom JWT-based authentication
- GitHub OAuth integration
- CRUD operations for posts, comments, and chats

## Endpoints

| **Endpoint**            | **HTTP Request** | **Description**                                              | **Requires Authentication?** |
| ----------------------- | ---------------- | ------------------------------------------------------------ | ---------------------------- |
| `/auth/register`        | POST             | Registers a new user with email and password.                | ❌                           |
| `/auth/login`           | POST             | Logs in a user with email and password.                      | ❌                           |
| `/auth/github`          | GET              | Redirects the user to GitHub for OAuth authentication.       | ❌                           |
| `/auth/github/callback` | GET              | Handles the callback from GitHub after OAuth authentication. | ❌                           |
| `/auth/logout` (TODO)   | POST             | Logs out the currently authenticated user.                   | ✅                           |
| `/posts`                | POST             | Create a post with an image upload                           | ✅                           |
| `/posts`                | GET              | Get all posts from the authenticated user                    | ✅                           |
| `/posts/:id`            | GET              | Get a single post by post ID if authorized                   | ✅                           |
| `/posts/:id `           | PATCH            | Update a specific post by ID                                 | ✅                           |
| `/posts/:id`            | DELETE           | Deletes a specific post by ID                                | ✅                           |
| `/posts/:id/like`       | POST             | Authenticated user likes the specific post by ID             | ✅                           |
| `/posts/:id/like      ` | DELETE           | Authenticated user unlikes the specific post by ID           | ✅                           |

## Development

## Future Steps

idk
