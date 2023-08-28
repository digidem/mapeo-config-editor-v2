#!/bin/bash
# Pull the latest code from the main branch
git pull origin main
# Install dependencies
yarn
# Build the project
yarn build
# Check if the application is running using PM2
pm2 describe app > /dev/null
# If it's not running, start it
if [ $? != 0 ]; 
then
    pm2 start npm --name "app" -- start
else
    pm2 restart app
fi
