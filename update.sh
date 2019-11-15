#!/bin/bash
while $(true); do
  git pull
  npm install
  npm run build
  node index.js

  VERSION="$(node version.update.js)"
  git add package.json
  git commit -m "Update to ${VERSION}"
  git push
done
