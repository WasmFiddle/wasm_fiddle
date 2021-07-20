# Work in progress README for Nodejs backend of WASM Fiddle

You will need to ensure you have npm and Node.js installed on your computer

After those have been installed:

-To run in development mode type 'npm run start-dev' and then navigate to 'http://localhost:8080/'

This will run the server via nodemon, so any changes made to the .js files will automatically restart the server

-To run standard type 'npm run start' and then navigate to 'http://localhost:8080/'

This wil run the server via node, so changes in files will not be loaded until the server is restarted

-Use 'Ctrl+C' to kill the nodemon or node server

###### Flask Backend
This is built to be containerized into a Dockerfile using Dockerfile. To build a Docker image, enter the commands:
```
docker build -t docker-file-name .
docker run -d --name image-name -P docker-file-name
```
These steps will build and run the docker image. To access the web portal, open docker and find the specified docker-file-name as set above to get the port. Use this port by entering http://localhost:xxxx/ into your webbrowser (where xxxx is the port number) to access the site with its current functionality. 
