# Build the image
docker build -f backend.dockerfile -t fastapi-backend:v1.0 .

# Run the container
docker run --name fastapi-backend -p 8000:8000 fastapi-backend:v1.0