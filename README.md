# Isntagram API

This is the backend API for my social media app. The API supports user authentication, posts, comments, and chats. Built with `Node.js` and `Express.js`, using `PostgreSQL` as the database and `Prisma ORM` for database management. Featuring custom `JWT-based authentication` and `GitHub OAuth` integration with WebSocket-based real-time chat functionality for direct messages and group conversations

## ER Diagram

|   ![Project Architecture](assets/er_diagram.png)   |
| :------------------------------------------------: |
| _In practice, the schemas might (slightly) differ_ |

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
| `/posts/following` (!!!)     | GET              | Get posts that the authenticated user follows                     |              ✅              |         ❌          |
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

Here are the steps required to run this locally:

Prerequisites:

- Have npm installed

### 1. Clone the repo

```bash
# HTTPS: Using the web URL
git clone https://github.com/drkchu/isntagram-api.git

# SSH: Using a password-protected SSH key
git clone git@github.com:drkchu/isntagram-api.git

# GitHub CLI: Using the GitHub CLI
gh repo clone drkchu/isntagram-api
```

### 2. Download dependencies

```
cd isntagram-api
npm i
```

### 3. Create a `.env` file to store environment variables

```
touch .env
```

Here's what your `.env` file should look like once populated with values

```.env
# Database
DATABASE_URL=postgresql://[USER]:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres

# GitHub OAuth
GITHUB_CLIENT_ID=[your_client_id]
GITHUB_CLIENT_SECRET=[your_client_secret]

# JWT
TOKEN_EXPIRY="1h"
JWT_SECRET=[something_long_and_secure_from_crypto]

# AWS S3 Stuff

AWS_REGION=[your_region]
AWS_ACCESS_KEY_ID=[your_iam_access_key]
AWS_SECRET_ACCESS_KEY=[your_iam_secret_access_key]
AWS_S3_BUCKET=[your_s3_bucket_name]

PORT=3000 # Whatever port you'd like to use
```

### 4. Setting up the database (Supabase)

- Visit [Supabase](https://supabase.com/) and sign up or log in.
- Click on "New Project" in the dashboard.
- Enter your project details and create the project.

#### Retrieve the database connection string:

- In the Supabase project dashboard, you can find project connect details by clicking _Connect_ in the top bar

In your Supabase project dashboard, navigate to Project Settings > Database.
Copy the Connection String provided for your database and add it to `.env` as `DATABASE_URL`

#### Create the necessary tables in your Supabase database

```bash
npx prisma migrate dev --name init
```

### 5. Grabbing GitHub OAuth stuff

#### Register a New OAuth Application on GitHub

- Log in to your GitHub account.
- Click on your profile picture in the upper-right corner and select Settings.
- In the left sidebar, click on Developer settings.

#### Create a New OAuth App

- In the left sidebar, click on OAuth Apps.
- Click the New OAuth App button.
- Fill in the required details:
  - Application Name: Your application's name.
  - Homepage URL: The URL of your application's homepage, e.g. `http://localhost:3000`
  - Application Description: A brief description of your application.
  - Authorization Callback URL: The URL where users will be redirected after authorization (e.g., `http://localhost:3000/auth/github/callback`).
- Click Register application to complete the process.
- Add your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env`

### 6. Setting JWT 
- Populate the values `TOKEN_EXPIRY` and `TOKEN_SECRET` in `.env`
  - `TOKEN_SECRET` is used to authenticate tokens, so make sure that this is secure
- Feel free to use the script below in the node runtime, to generate a token secret to use
```node
require('crypto').randomBytes(64).toString('hex')
```

### 7. Setting up AWS S3 for image storage

#### Sign Up for AWS and Access the S3 Console

- Visit the [AWS Management Console](https://aws.amazon.com/console/) and sign up for a new account if you don't have one.
- Follow the on-screen instructions to complete the registration process.
- Log In to the AWS Management Console:
- In the AWS Management Console, under "Storage," select S3 to open the Amazon S3 console.

#### Create a New S3 Bucket

- In the S3 console, click on Create bucket.
- Configure the bucket settings:
  - Bucket Name: Enter a unique name for your bucket. Bucket names must be globally unique and adhere to Amazon S3 bucket naming rules.
  - Region: Select the AWS Region where you want the bucket to reside. Choosing a region close to your location can reduce latency.
    - Add the region selected to your `.env` file as `AWS_REGION`
  - It's fine to leave the rest of the configurations the default options

- Review your settings and click _Create bucket_.


#### Obtain AWS Credentials

- Navigate to the IAM console to create a new IAM user
- Click on _Users_ and then _Add user_.
- Enter a username and select _Programmatic access_
- Assign Permissions:
  - Attach the policy `AmazonS3FullAccess` to grant full access to S3
- Review the settings and create the user.
- Save the `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` to the `.env` file, along with the bucket name as `AWS_S3_BUCKET`

#### Allow public viewing of image data
- Add this following JSON to the bucket policy under the _Permissions_ tab when viewing the S3 bucket created

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::[bucket_name]/*"
        }
    ]
}
```

#### This is a pain to setup for your first time, so here's a helpful [video walkthrough](https://www.youtube.com/watch?v=e6w9LwZJFIA). Good luck!!

