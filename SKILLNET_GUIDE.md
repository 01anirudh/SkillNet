# SkillNet Project Interview Guide

This guide is designed to help you describe the **SkillNet** project in technical interviews. It covers the architecture, key features, and deep dives into the specific implementations of Authentication and Real-time Messaging.

## 1. Project Overview (The "Elevator Pitch")

**"SkillNet is a full-stack professional networking platform built with the MERN stack (MongoDB, Express, React, Node.js). It features secure user authentication, real-time messaging, story sharing, and professional connection management. I built it to understand complex full-stack patterns like handling real-time data streams and integrating third-party services like Clerk and ImageKit."**

### Core Tech Stack
- **Frontend**: React.js (Vite), TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose)
- **Authentication**: Clerk (Managed User Management & Auth)
- **Real-time**: Server-Sent Events (SSE) (Custom implementation)
- **File Storage**: ImageKit (with Multer for upload handling)
- **Background Jobs**: Inngest (Serverless queues/functions)

---

## 2. Technical Deep Dive: Authentication & Tokens

*How users are identified and secured.*

### The Implementation
Instead of building a custom JWT implementation from scratch, SkillNet uses **Clerk**, which provides robust security out of the box.

*   **Frontend**: The Clerk React SDK handles the login flow and manages the session token. It automatically attaches the session token (JWT) to the `Authorization` header of outgoing API requests.
*   **Backend**: I verified these tokens using `@clerk/express` middleware.
    *   **Middleware**: `app.use(clerkMiddleware())` runs on every request.
    *   **Route Protection**: In my controllers, I access `req.auth`. If `req.auth.userId` exists, the user is authenticated. If not, I block the request.

### Interview Q&A
**Q: Why did you choose Clerk over custom JWT auth?**
**A:** "Security is critical. Clerk handles session management, token rotation, and 2FA, allowing me to focus on building unique platform features like the chat and story systems rather than reinventing identity management."

**Q: How does the backend know who the user is?**
**A:** "The `clerkMiddleware` validates the Bearer token sent by the frontend. It decodes the JWT and injects the `userId` into the `req.auth` object, which I use to query my MongoDB database for the user's profile."

---

## 3. Technical Deep Dive: Real-time Messaging

*Handling live chat updates without refreshing the page.*

### The Implementation (Server-Sent Events)
Unlike traditional WebSockets (Socket.io), I implemented a lightweight **Server-Sent Events (SSE)** system for the chat.

1.  **Connection**: When a user opens current chat, the frontend opens a connection to `/api/message/events`.
2.  **Storage**: On the server, I maintain a global `connections` object:
    ```javascript
    connections = {
       "userId_123": res_object_A,
       "userId_456": res_object_B
    }
    ```
3.  **Sending**: When User A sends a message to User B via a POST request:
    *   The message is saved to MongoDB.
    *   I check `connections[to_user_id]`.
    *   If User B is connected, I use `res.write()` to push the message data instantly to their open stream.

### Interview Q&A
**Q: If 10 users are chatting, how do you ensure the message goes to the correct person?**
**A:** "It works like a phone book or a hash map. The `connections` object uses the unique `userId` as the key.
```javascript
connections = {
  "user_101": <response_object_A>,
  "user_102": <response_object_B>,
  ...
}
```
When User 101 sends a message to User 102, I don't loop through all 10 users. I directly access `connections['user_102']`. This is an **O(1)** operation, meaning it's instant regardless of whether there are 10 or 10,000 users connected to that server Instance."

**Q: What exactly is the "response object" you are storing?**
**A:** "In Express.js, the `res` (response) object represents the HTTP connection back to the user.
*   Normally, you send data once (`res.json(...)`) and the connection closes.
*   With SSE, we keep this `res` object 'alive' or open.
*   By storing `res` in the `connections` object, I am essentially saving the **open phone line** to that specific user. Whenever I want to speak to them, I just pick up that saved `res` object and write data to it."

**Q: Why did you use SSE instead of Socket.io?**
**A:** "Since this is a chat application where the primary need is server-to-client updates (receiving new messages), SSE is simpler and lighter than WebSockets. It runs over standard HTTP and doesn't require a complex handshake protocol, making it easier to debug and deploy."

**Q: How do you handle a user disconnecting?**
**A:** "I listen for the `close` event on the response object. When it fires, I delete their entry from the `connections` object to prevent memory leaks."

---

## 4. Technical Deep Dive: Background Jobs & Serverless (Inngest)

*Handling complex logic asynchronously without blocking the user.*

### The Implementation
I use **Inngest** as an event-driven queue to handle background tasks and scheduled jobs. This prevents the server from slowing down during heavy operations.

### Key Use Cases in SkillNet
1.  **User Syncing (Webhooks)**: When a user signs up via Clerk, Clerk sends a webhook event (`clerk/user.created`). Inngest catches this and automatically syncs the user data to my MongoDB database.
2.  **Story Expiration**: Stories disappear after 24 hours. Instead of running a check every minute, I use Inngest's `step.sleepUntil`. When a story is created, I schedule a "wake up" event 24 hours later to delete it.
3.  **Notifications**:
    *   **Connection Reminders**: If a connection request isn't accepted within 24 hours, Inngest sends a specifically timed email reminder.
    *   **Unseen Messages**: A CRON job runs every day at 9 AM to check for unread messages and batch-email users.

### How it works (The Flow)
1.  **Event Occurs**: (e.g., User creates account on Clerk).
2.  **Webhook Fired**: Clerk sends a POST request to your `/api/inngest` endpoint.
3.  **Inngest SDK**: The `serve()` middleware in `server.js` receives this request.
4.  **Function Match**: It looks at the event name `clerk/user.created` and finds the matching function `syncUserCreation` defined in `server/inngest/index.js`.
5.  **Execution**: The function runs securely on your server (or Inngest's cloud in production).

### Interview Q&A
**Q: What is a "Serverless Function" in this context?**
**A:** "Serverless functions are small pieces of code that run only when triggered by an event (like a file upload or a database change), rather than running constantly on a server. Inngest allows me to write these functions in my standard Node.js code, but they run in the background, reliably, with automatic retries if they fail."

**Q: Why use Inngest for Story Deletion instead of just checking the date on the frontend?**
**A:** "Security and Reliability. If I only checked on the frontend, the data would still exist in the database. Using Inngest, the deletion happens on the server side exactly 24 hours later, ensuring the data is truly removed according to the logic, without me needing to manage a complex scheduler server."

**Q: Does Inngest create a new function for every single story?**
**A:** "No. There is **one function definition** in my code (`deleteStory`). However, for every story posted, Inngest creates a **new execution (run)** of that function.
*   If 100 users post stories, there are 100 'runs' sleeping in the background.
*   Each run is independent and remembers its own `storyId`.
*   It's similar to how one `addUser` controller handles thousands of user signups; one code definition, many executions."

---

## 5. Technical Deep Dive: File Uploads & Multer

*Handling images for posts and chat.*

### The Implementation
*   **Multer**: Used as middleware to parse `multipart/form-data` requests.
*   **Storage Strategy**: I configured Multer with `diskStorage`. This means when a user uploads a file, it is briefly saved to the server's temporary disk space.
*   **Cloud Upload**: I then read this file from the disk and stream it to **ImageKit**.
*   **Cleanup**: One the upload is complete, the temporary file is redundant (and usually cleaned up by the OS or manually).

### Interview Q&A
**Q: Why do you need Multer? Can't Express handle files?**
**A:** "No, by default, Express can only parse `application/json` (text data). It doesn't know how to handle `multipart/form-data` (which is how files are sent).
Multer acts as a **bridge/middleware**. It intercepts the incoming stream, pieces together the binary file data, and makes it available to me as `req.file`. Without it, `req.body` would be empty for file uploads."

---

## 6. Architectural Decision: Why MongoDB?

*Choosing the right database for a social platform.*

**Q: Why did you choose MongoDB (NoSQL) over a SQL database like PostgreSQL?**
**A:** I chose MongoDB for three main reasons:

1.  **Flexible Schema (Schemaless)**:
    *   In a social media app, data structures evolve fast. For example, if I want to add "Reactions" to a Message document later, I can just add that field without running complex migration scripts (ALTER TABLE) that would fetch down the database in SQL.
2.  **JSON-Native**:
    *   I'm using JavaScript everywhere (React frontend, Node backend). MongoDB stores data in BSON (Binary JSON). This means objects look exactly the same in my database, my backend code, and my frontend. There fits naturally without needing an ORM to convert "Rows" into "Objects".
3.  **Horizontal Scalability (Sharding)**:
    *   Social apps generate massive amounts of unstructured data (chat logs, activity feeds). MongoDB works great for this because it's designed to be distributed across many servers easily if the app grows to millions of users.

---

## 7. Potential Scenario Questions

**Scenario 1: Scaling**
*Interviewer: "If you had 10,000 active users, would your current SSE implementation work?"*
*Answer:* "Currently, the `connections` object is stored in the server's memory. If I scaled to multiple server instances (horizontal scaling), User A might be connected to Server 1, but User B connects to Server 2. User A's message wouldn't reach User B. To fix this, I would introduce **Redis Pub/Sub** to broadcast events across all server nodes."

**Scenario 2: Database Design**
*Interviewer: "How do you store messages?"*
*Answer:* "I use a `Message` model in MongoDB with references to `from_user_id` and `to_user_id`. This allows me to easily query conversation history using an `$or` query to find all messages between two specific users, sorting by timestamp."
