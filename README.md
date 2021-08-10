###### Flask Backend
This is built to be containerized into a Dockerfile using Docker (install it from https://docs.docker.com/get-docker/). To build a Docker image, enter the commands:
```
docker build -t docker-file-name .
docker run -d --name image-name -P docker-file-name
```
These steps will build and run the docker image. To access the web portal, open docker and find the specified docker-file-name as set above to get the port. Use this port by entering http://localhost:xxxx/ into your webbrowser (where xxxx is the port number) to access the site with its current functionality. 
