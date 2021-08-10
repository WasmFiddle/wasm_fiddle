FROM emscripten/emsdk:latest

RUN echo "## Start building" \
    && echo "## Update and install packages" \
    && apt-get -qq -y update \
    && apt-get -qq install -y --no-install-recommends \
        binutils \
        build-essential \
        ca-certificates \
        file \
        git \
        python3 \
        python3-pip \
    && echo "## Done"
		
WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
ENV PORT=8000
EXPOSE ${PORT}
CMD [ "python3", "main.py" ]