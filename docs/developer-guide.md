# Developer Guide

Use Node.js 20+. Run `npm install`, copy `.env.example` to `.env`, then `npm run dev`. Keep route handlers thin: add validation in `backend/src/validations`, business rules in services, and storage queries in repository implementations. Add focused tests alongside backend or frontend code. Oracle SQL must use bind variables and should be covered by integration tests against the supported Oracle version.
