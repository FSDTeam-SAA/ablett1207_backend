# Chat module

The chat module implements one private conversation between each user and the configured support account.

## Support account

The support account is an active user with role `admin`. Set `SUPPORT_USER_ID` to guarantee which admin receives user messages. If it is not set, the first active admin is used.

## REST endpoints

All endpoints require `Authorization: Bearer <accessToken>`.

- `GET /api/v1/chat/support` — resolve the support account.
- `GET /api/v1/chat/messages` — user message history with support.
- `GET /api/v1/chat/messages?userId=<id>` — admin history with one user.
- `POST /api/v1/chat/messages` — send text and/or attachments as `multipart/form-data`. Use `attachments` for up to five JPG, PNG, WEBP, GIF, or PDF files (10 MB each). Admin replies also include `userId`.
- `GET /api/v1/chat/inbox` — admin conversation list with latest message and unread count.
- `PATCH /api/v1/chat/read` — mark the current conversation as read. Admins pass `userId`.

## Socket.IO

Connect to the `/chat` namespace and send the JWT in `auth.token` (or an Authorization header).

- Client sends `message:send` with `{ text }` as a user, or `{ userId, text }` as support.
- Image/PDF messages are uploaded with `POST /api/v1/chat/messages`; the server broadcasts the saved message through Socket.IO after upload.
- Server emits `message:new` to both participants.
- Server emits `conversation:updated` to both participants.
- Client sends `conversation:read` with `{ userId? }`.
- Server emits `chat:ready` after successful authentication and `chat:error` for rejected events.

Messages are stored before delivery, so reconnecting clients can load the complete history through REST.
