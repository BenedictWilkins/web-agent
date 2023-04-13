#!/usr/bin/env bash

PROTOCOL="https"
HOST="127.0.0.1"
PORT=8000
APPLICATION_PATH="webserver.webserver.asgi:application"

INVENV=$(python3 -c 'import sys; print ("1" if sys.prefix != sys.base_prefix else "0")')

# is there an activate virtual environment? 
if [[ ${INVENV} -eq 0 ]]; then 
    # is there an active conda environment?
    if [[ "$CONDA_DEFAULT_ENV" == "" ]] || [[ "$CONDA_DEFAULT_ENV" == "base" ]]; then 
        echo "No virtual environment active."
        echo "Either activate a virtual environment or run 'source virtualenv_manager.sh' to create and activate one."
        echo "If you wish to use you own virtual environment, make sure it has django, django-extensions, Twisted[tls, http2], daphne installed."
        echo "Then you can run './deploy.sh [--launch]' to deploy and start the Web-Agent server.'"
        echo "Exiting..."
        exit 1
    fi
fi
echo "Python virtual environment active, proceeding..."

# Determine the operating system to ensure cross-platform "open" for URLS
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     opener=xdg-open;;
    Darwin*)    opener=open;;
    *)          echo "Unsupported operating system: ${unameOut}" && exit 1;;
esac

cd webserver

if [ ! -d "tls" ]; then
    PROTOCOL="http"
    echo "tls not found, using HTTP protocol."
fi

cd - &> /dev/null

if ! command -v python3 -m pip show django &> /dev/null; then
    echo "django could not be found. Please install it (python3 -m pip install django) before running Web-Agent."

    exit
elif ! command -v python3 -m pip show django-extensions &> /dev/null; then
    echo "django-extensions could not be found. Please install it (python3 -m pip install django-extensions) before running Web-Agent."

    exit
elif ! command -v daphne &> /dev/null; then
    echo "daphne could not be found. Please install it (python3 -m pip install daphne) before running Web-Agent."

    exit
elif [ ${PROTOCOL} == "https" ]; then
    if [ "${1}" == "--launch" ]; then
        sleep 2 && ${opener} ${PROTOCOL}://${HOST}:${PORT} &
    fi

    cd webserver/tls

    python3 find_key_and_cert.py

    cd - &> /dev/null

    KEY_PATH="webserver/tls/active/key.pem"
    CERT_PATH="webserver/tls/active/cert.pem"

    if [ ! -f "${KEY_PATH}" ] || [ ! -f "${CERT_PATH}" ]; then
        echo "Could not find a valid certificate and key. The content will be served in plain HTTP."
        daphne -b ${HOST} -p ${PORT} ${APPLICATION_PATH}
    else
        daphne -e ssl:${PORT}:privateKey=${KEY_PATH}:certKey=${CERT_PATH} ${APPLICATION_PATH}
    fi
elif [ ${PROTOCOL} == "http" ]; then
    if [ "${1}" == "--launch" ]; then
        sleep 2 && ${opener} ${PROTOCOL}://${HOST}:${PORT} &
    fi
    daphne -b ${HOST} -p ${PORT} ${APPLICATION_PATH}
fi
