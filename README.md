# Jellyfin Alexa Skill Locally Hosted
This repository contains the code and instructions to set up a locally hosted Alexa Skill for controlling your Jellyfin media server. This skill allows you to use voice commands to interact with your Jellyfin server through Amazon Alexa-enabled devices.

## ENV File Configuration
To configure the Alexa Skill, you need to set up the `.env` file with the following variables:
```plaintext
RADARR_APIKEY = your_radarr_api_key
RADARR_SERVER = http://your_radarr_server:port
RADARR_ROOT = /path_to_movies

SONARR_APIKEY = your_sonarr_api_key
SONARR_SERVER = http://your_sonarr_server:port
SONARR_ROOT = /path_to_tvshows
// Optional logging configuration
LOG = YES

NGROK_AUTHTOKEN = your_ngrok_authtoken
```

## Docker Build
docker build -t node-alexa-skill:latest .
docker save node-alexa-skill:latest -o node-alexa-skill.tar