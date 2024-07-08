# OpenShock WebUI

This is the OpenShock Web UI. It is a single-page application that communicates with the [OpenShock API](https://github.com/OpenShock/API). It is written using JavaScript and SCSS using the Vue 3 framework.

## Contents

- [OpenShock WebUI](#openshock-webui)
  - [Contents](#contents)
- [Configuring](#configuring)
    - [Technical environment runtime variables](#technical-environment-runtime-variables)
- [Deployment](#deployment)
  - [Using Docker](#using-docker)
  - [Using `docker-compose`](#using-docker-compose)
- [Development](#development)
  - [Dependencies](#dependencies)
  - [Development](#development-1)
  - [Build](#build)
  - [Support](#support)

# Configuring

The [webui](https://github.com/OpenShock/WebUI/pkgs/container/webui) container supports configuration via environment variables.

|Variable|Default|Description|
|-|-|-|
|`OPENSHOCK_NAME`|`LocalShock`| Name of the OpenShock instance. |
|`OPENSHOCK_URL`|`http://webui:80`| URL of the OpenShock WebUI. (NO trailing slash!) |
|`OPENSHOCK_SHARE_URL`|`https://webui:80/`| URL to prefix share links with. (NO trailing slash!) When visited, should redirect to `${OPENSHOCK_WEBUI_URL}/public/proxy/shares/links/{ID}`. |
|`OPENSHOCK_API_URL`|`http://api:80/`| URL of the API. (NO trailing slash!) |

### Technical environment runtime variables
These lines might be interesting if you are wanting to modify something related to the environment variables.

- src/globals/config/config.{profile-name}.js"
- (for container) startup.sh
- for static index.html: webpack.config.js L81/82

# Deployment

This documentation describes how to self-host the WebUI container. This might not be of interest to you if you are content using a public OpenShock instance such as [openshock.app](https://openshock.app).

## Using Docker
Assuming you are running on `localhost`, with [the API](https://github.com/OpenShock/API) running on port `5001`:

```bash
$ docker run \
    -p 5002:80/tcp \
    -e OPENSHOCK_NAME=LocalShock \
    -e OPENSHOCK_URL=http://localhost:5002 \
    -e OPENSHOCK_API_URL=http://localhost:5001 \
    -e OPENSHOCK_SHARE_URL=http://localhost:5002/#/public/proxy/shares/links/ \
    --name openshock-webui \
    ghcr.io/openshock/webui:latest
```

## Using `docker-compose`

See [docker-compose.yml](docker-compose.yml).

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
