FROM nginx:1-alpine

# Default values.
ENV OPENSHOCK_NAME=OpenShock
ENV OPENSHOCK_URL=http://webui.localhost:5002
ENV OPENSHOCK_API_URL=http://api.localhost:5001
ENV OPENSHOCK_SHARE_URL=

# Copy release artifacts (static JS and CSS bundles)
COPY dist /usr/share/nginx/html

# Copy custom startup script.
# This script performs environment variable substitution!
COPY startup.sh .
RUN ["chmod", "+x", "/startup.sh"]

# Start up nginx using the alternative entrypoint, but with the default CMD.
# See: https://github.com/nginxinc/docker-nginx/blob/master/mainline/debian/Dockerfile#L113-L119
ENTRYPOINT ["/startup.sh"]
CMD ["nginx", "-g", "daemon off;"]
