# Authentication Migration Plan

This document outlines the strategy for handling user authentication as we migrate from Parse Server to a Supabase-based backend, with the key decision to continue using Firebase as our identity provider.

## 1. Current Authentication Flow

The existing process works as follows:

1.  The client application authenticates a user via Firebase Auth.
2.  The resulting JSON Web Token (JWT) is sent to our Parse Server with each request.
3.  A custom adapter (`bloomFirebaseAuthAdapter.js`) validates the token by checking its signature, issuer, and expiration.
4.  The adapter ensures the user's email is verified and matches the email to a `username` in the Parse `_User` table.
5.  If the user does not exist, the adapter creates a new user record implicitly.
6.  This confirms the user's identity and authorizes the request.

## 2. Proposed Architecture

We will replicate the current authentication logic in our new Supabase-centric backend, maintaining the use of Firebase for identity management.

The key components will be:

- **Firebase Auth:** Remains the identity provider for all client applications.
- **Client Applications:** No changes are needed. They will continue to sign in with Firebase and send the JWT to our backend.
- **Backend Endpoint:** A new backend endpoint (e.g., a Supabase Edge Function) will replace the current Parse Server logic for handling authentication and user creation.
- **Custom `users` Table:** We will use a custom `users` table in Supabase, keyed by the user's email, to store user information. We will **not** use the built-in `auth.users` table, as it is tied to Supabase's own authentication service.
- **Row Level Security (RLS):** We will use a custom PostgreSQL function to validate the Firebase JWT and extract the user's identity, which can then be used in RLS policies to secure data access.

## 3. Implementation Details: Login and User Creation

The core of the new implementation is a single backend endpoint that handles both logging in existing users and creating new ones, just as the current system does.

The flow will be as follows:

1.  The client calls a dedicated backend endpoint (e.g., `/functions/login-or-create-user`) with the Firebase JWT.
2.  The endpoint validates the JWT using logic reimplemented from `bloomFirebaseAuthAdapter.js`.
3.  Upon successful validation, the function extracts the user's email and performs an **"upsert"** operation on our custom `users` table:
    - If a user with that email **exists**, the function proceeds to establish a session.
    - If a user with that email does **not exist**, the function first creates a new record in the `users` table and then establishes a session.
4.  The endpoint returns a new session token to the client for use in subsequent authenticated requests.

The existing `bloomLink` function, which handles linking existing users, will also be reimplemented as a backend endpoint that can be called before the login/signup attempt.
