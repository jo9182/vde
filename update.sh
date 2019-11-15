#!/bin/bash
while $(true); do
  git pull
  npm install
  npm run build
  node index.js
done
