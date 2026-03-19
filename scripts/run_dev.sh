#!/bin/bash
# Run development servers

echo "Starting Backend..."
cd backend && uvicorn app.main:app --reload &

echo "Starting Frontend..."
cd frontend && npm run dev
