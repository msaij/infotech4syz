#!/bin/bash

docker build -f frontend.dockerfile -t frontend .

docker run -p 3000:3000 --name frontend-app frontend