# ShockLink WebUI

This is the ShockLink Web UI. It is a single-page application that communicates with the [ShockLink API](https://github.com/Shock-Link/API). It is written using JavaScript and SCSS using the Vue 3 framework.

## Contents

- [Configuring](#configuring)
- [Deployment](#deployment)
  - [Using Docker](#using-docker)
  - [Using `docker-compose`](#using-docker-compose)
- [Development](#development)
  - [Dependencies](#dependencies)
  - [Development](#development-1)
  - [Build](#build)
  - [Support](#support)

# Configuring

The [shocklink-webui](https://github.com/Shock-Link/WebUI/pkgs/container/shocklink-webui) container unfortunately does not support any configuration beyond nginx configuration, as it is currently based on `nginx:alpine`. 

If you wish to change the API that the WebUI communicates with, locally modify the [configuration file](src/globals/config/config.production.js) and build the container manually.

# Deployment

This documentation describes how to self-host the WebUI container. This might not be of interest to you if you are content using [ShockLink.net](https://shocklink.net).

## Using Docker

```bash
$ docker run \
    -p 80:80/tcp \
    --name shocklink-webui \
    ghcr.io/shocklink/shocklink-webui:latest
```

## Using `docker-compose`
At the time of writing, the [ShockLink API](https://github.com/Shock-Link/API) is not yet readily available. This example contains **only** the WebUI.

```yml
version: '3.9'

services:
  webui:
    image: ghcr.io/shock-link/shocklink-webui:latest
    container_name: shocklink-webui
    ports:
      - "80:80/tcp"
```

# Development
Contributions are welcome! We're eager to see what you come up with. Make sure to [join us on Discord](https://discord.gg/AHcCbXbEcF).

## Dependencies

To get started with development, you will need the following things:
- NodeJs 17.9.1 or newer.
- An IDE or editor:
  - VSCode
  - Web- or PhpStorm

## Development
To start a local development server, check out the repository and run the command `npm run start`.

## Build
To make a production ready build, use the command `npm run build`.
This will output static web files to `./dist/` which can be deployed on pretty much any webserver.

This also works for cloudflare pages auto build pipeline.

## Support
You can support me and my projects here [Ko-fi.com/LucHeart](https://ko-fi.com/lucheart)