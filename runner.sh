#!/bin/bash

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
  echo "Error: Bun is not installed. Please install Bun and try again."
  exit 1
fi

# Check if arguments are provided
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: runner <hotel_ids> <destination_ids>"
  exit 1
fi

# Pass the arguments to the CLI application
bun run ./index.ts "$1" "$2"
