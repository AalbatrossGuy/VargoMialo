# Vargo Myaló
Config files and other READMEs for my server, Vargo. Instructions and other stuff also included to document my experience.
Trivia: "Myaló" is a common way of saying "Brain" in Greek. Due to my fascination towards Greek mythology, everything related to the server has a Greek essence to it.

# Contents
→  [The Story](https://github.com/AalbatrossGuy/VargoDotfiles/blob/main/README.md#the-story) <br>
→  [Pi Pictures](https://github.com/AalbatrossGuy/VargoDotfiles/blob/main/README.md#some-pictures-of-the-pi) <br>
→  [The Configuration](https://github.com/AalbatrossGuy/VargoDotfiles/blob/main/README.md#the-configuration) <br>
→  [Services](https://github.com/AalbatrossGuy/VargoDotfiles/blob/main/README.md#services) <br>
→  [Item Links](https://github.com/AalbatrossGuy/VargoDotfiles/blob/main/README.md#item-links) <br>

# The Story
I always wanted to tinker with Raspberry Pis and other Single Board Computers (SBCs). Got an idea to make a server out of it cause why not. After going through various Pi models, I decided to get the Raspberry Pi 5 16GB version. Alibaba gave the cheapest option however the delivery date was too late, around 2-3 months 🥲 I couldn't wait that long, hence, bought it off a third-party website. Other components for the Pi were available in Amazon and were delivered within 2-3 days. I'll attach links at the end if someone wants to have a look at them. 

P.S. - The Blog site for Vargo is up and can be viewed at [Vargo Blog](https://vargo.vargoseus.com).

<details>
<summary><strong>Some Pictures Of The Pi</strong></summary>
<img src="https://github.com/user-attachments/assets/2910c986-d3b2-429c-be5d-6bcb38cbae01" width="500" height="500"/>
<img src="https://github.com/user-attachments/assets/a9971994-a230-408d-a210-2ad77cc02784" width="500" height="500"/>
<img src="https://github.com/user-attachments/assets/584fa932-6a6f-4350-844e-fbf324cf407f" width="500" height="500"/>
<img src="https://github.com/user-attachments/assets/4b82657d-f016-40fd-bbd3-8e292881722c" width="500" height="500"/>

</details>

<details>
<summary><strong>The Configuration</strong></summary>
## The Configuration
After getting the Pi, I decided on what services to self-host. I didn't want to host any mediaserver because I have lots of subscriptions for watching movies, tv, anime, etc. (don't judge). Eventually, zeroed down to:
- NextCloud (for files, images, etc.)
- LinkWarden (bookmark manager)
- VaultWarden (password manager)
- Glance Dashboard (for viewing certain server & self-hosted services metrics)
- Stirling PDF (pdf utils)
- Mazanoke (image utils)
- Portainer (for easier docker container management)
- Speedtest Tracker (internet speed test)

Note - I'm exposing all my services to the internet via cloudflare tunnel. That enables me to access these services from anywhere in the world.
</details>

# Services

<details>
<summary><strong>NextCloud</strong></summary>

<img width="600" height="600" alt="2025-10-25_18-48" src="https://github.com/user-attachments/assets/65ee1419-36fc-457b-989b-9e5e21e755bf" />

I would say, setting up nextcloud was the most challenging considering it was my first time doing something like that. Eventually after slogging through the docs, reddit posts and some ChatGPT help, I was able to configure it to my taste. The `docker-compose.yml` file that I'm using for the service:

```yaml
services:
  nextcloud:
    image: linuxserver/nextcloud:latest
    container_name: nextcloud
    environment:
      - PUID=${PUID}
      - PGID=${PGID}
      - TZ=${TIMEZONE}
    volumes:
      - /portainer/Files/AppData/Config/Nextcloud/Config:/config
      - /portainer/Files/AppData/Config/Nextcloud/Data:/data
    ports:
      - 5443:443
      - 8080:80
    restart: unless-stopped
    depends_on:
      - nextcloud_db
  nextcloud_db:
    image: linuxserver/mariadb:latest
    container_name: nextcloud_db
    environment:
      - PUID=${PUID}
      - PGID=${PGID}
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - TZ=${TZ}
      - MYSQL_DATABASE=nextcloud_db
      - MYSQL_USER=nextcloud
      - MYSQL_PASSWORD=${DATABASE_PASSWORD}
    volumes:
      - /portainer/Files/AppData/Config/Nextcloud/DB:/config
    restart: unless-stopped
```

Rest of the configurations were done from the interface itself so I cannot include them here. The process is quite straightforward, so setting it up according to one’s preferences should not be a problem.

</details>

<details>
<summary><strong>LinkWarden</strong></summary>

<img width="600" height="600" alt="image" src="https://github.com/user-attachments/assets/365e1974-232a-4671-8ae0-cabc3a7f8603" />

After combing through the internet for a clean, simple yet elegant looking bookmark/article manager, I eventually found LinkWarden. I didn't configure LinkWarden much, just used the `compose.yml` from their [docs](https://docs.linkwarden.app/self-hosting/installation). That seemed to work right out of the box. I just had to setup `AUTH` by myself. The `docker-compose.yml` file that I"m using for the service:

```yaml
services:
  linkwarden:
    container_name: linkwarden
    image: ghcr.io/linkwarden/linkwarden:latest
    restart: unless-stopped
    volumes:
      - /app/linkwarden/data:/data/data
    environment:
      - DATABASE_URL=<postgres-database-url>
      - NEXTAUTH_SECRET=<sus-password>
      - NEXTAUTH_URL=http://localhost/api/v1/auth
    ports:
      - "port"
    networks:
      - linkwarden_net

  linkwarden-db:
    container_name: linkwarden-db
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=<user>
      - POSTGRES_PASSWORD=<password>
      - POSTGRES_DB=<db>
    volumes:
      - /app/linkwarden/pgdata:/var/lib/postgresql/data
    networks:
      - linkwarden_net

networks:
  linkwarden_net:
    driver: bridge
```

</details>

<details>
<summary><strong>VaultWarden</strong></summary>

<img width="600" height="600" alt="2025-10-25_19-11" src="https://github.com/user-attachments/assets/58ce224f-9c5c-40af-98ac-29ba462b03f0" />

Well, I always knew I wanted to host my own password manager because I am super forgetful. While searching the internet for a decent self-hosted password manager, I immediately stumbled upon VaultWarden and BitWarden. After searching around for other options, I figured vaultwarden was the best option. I just used the unmodified `compose.yml` from their github page which was by far the easiest to setup. The `docker-compose.yml` file that I'm using for the service:

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: unless-stopped
    ports:
      - "8280:80"
    environment:
      DOMAIN: "https://your.domain.com"
      SIGNUPS_ALLOWED: "true" # Change it to "false" after first sign up.
      WEBSOCKET_ENABLED: "true"
      ADMIN_TOKEN: "token"
    volumes:
      - ./data:/data
```

</details>

<details>
<summary><strong>Glance Dashboard</strong></summary>

<img width="700" height="700" alt="2025-10-25_19-18" src="https://github.com/user-attachments/assets/152251f6-8328-40e9-a472-28acddd60b33" />

One thing I noticed maximum server owners had was a really beautiful looking dashboard that contained various info for the services they are hosting. I wanted one too but couldn't find anything nice off the internet. After searching for a long time, I found this [YouTube video](https://www.youtube.com/watch?v=9QCdPP9rujc&t=701s) and was instantly hooked on Glance. After spending a whole day in customizing the widgets and other stuff to my liking, I was finally satisfied with the setup shown in the image.

I am not going to include the `docker-compose.yml` file for this service in this `README.md` but will give a link to it: [`docker-compose.yml`](https://github.com/AalbatrossGuy/VargoDotfiles/blob/main/glance-docker-compose.yml)

</details>

<details>
<summary><strong>Stirling PDF</strong></summary>

<img width="600" height="600" alt="2025-10-25_19-28" src="https://github.com/user-attachments/assets/8f6bc324-85f9-4e9c-9c9b-518c127c83fc" />

I have to deal with PDFs more or less everyday due to university and my own work. Decided to self-host a PDF utility service that was feature-rich. Their 50+ PDF tools are more than enough for what I need daily. I used their [docs](https://docs.stirlingpdf.com/Installation/Docker%20Install/) to modify the compose file as needed and added `AUTH` to it so only verified users could use the service. The `docker-compose.yml` file for the service:

```yaml
services:
  stirling-pdf:
    image: frooodle/s-pdf:latest
    container_name: stirling-pdf
    restart: unless-stopped
    ports:
      - "8088:8080"
    environment:
      - DISABLE_ADDITIONAL_FEATURES=false
      - SECURITY_ENABLELOGIN=true
      - SECURITY_LOGINMETHOD=normal
      - SECURITY_INITIALLOGIN_USERNAME=<initial_username>
      - SECURITY_INITIALLOGIN_PASSWORD=<initial_password> # Do change this afterwards!
      - LANGS=en_GB
    volumes:
      - ./data:/usr/share/stirling-pdf/config
      - ./pdfs:/usr/share/stirling-pdf/pdfs
```

</details>

<details>
<summary><strong>Mazanoke</strong></summary>

<img width="600" height="600" alt="2025-10-25_19-40" src="https://github.com/user-attachments/assets/7a4f7c9e-ebdc-4379-a40c-1c8084282e08" />

I wanted a simple yet useful self-hosted image compression service. Found Mazanoke from a reddit post and was instantly impressed by it's simplicity and beautiful interface. Used the basic `compose.yml` file from their github page and added `AUTH` to it so only verified users could use the service. The `docker-compose.yml` file for the service:

```yaml
services:
  mazanoke:
    container_name: mazanoke
    image: ghcr.io/civilblur/mazanoke:latest
    ports:
      - "3474:80"
```

</details>

<details>
<summary><strong>Speedtest Tracker</strong></summary>

<img width="600" height="600" alt="2025-10-25_19-51" src="https://github.com/user-attachments/assets/720b7ea7-107f-4a16-9fd4-dc8cfd7e7a29" />

I didn't really need to host an internet speedtest tracker but I found this interesting hence I did. It is pretty lightweight too. The tracker seems to work properly and it has a few features that I found really nice. The customization process was tedious but it worked out well in the end. The `docker-compose.yml` file for this service:

```yaml
version: "3.8"

services:
  db:
    image: postgres:17
    container_name: speedtest-tracker-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: <db>
      POSTGRES_USER: <user>
      POSTGRES_PASSWORD: <password>
    volumes:
      - speedtest-db:/var/lib/postgresql/data
    # healthcheck:
    #   test: ["CMD-SHELL", "pg_isready -U speedtest_tracker -d speedtest_tracker || exit 1"]
    #   interval: 5s
    #   timeout: 5s
    #   retries: 10

  speedtest-tracker:
    image: lscr.io/linuxserver/speedtest-tracker:latest
    container_name: speedtest-tracker
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:80"     # Change
      - "8280:80"     # Them
    environment:
      PUID: 1000
      PGID: 1000
      TZ: ${TIMEZONE}
      APP_KEY: ${SUPER SECRET APP KEY}
      DB_CONNECTION: pgsql
      DB_HOST: db
      DB_PORT: 5432
      DB_DATABASE: <database>
      DB_USERNAME: <username>
      DB_PASSWORD: <db_password>
      SPEEDTEST_SCHEDULE: "0 */2 * * *" # (Cron job) Run a speedtest every 2 hours.
      SPEEDTEST_ON_START: "true" # Run a test when the container is started.
      APP_URL: <url>
      ASSET_URL: <could_be_same_url>
      DISPLAY_TIMEZONE: ${TIMEZONE}
    volumes:
      - /srv/speedtest/config:/config

volumes:
  speedtest-db:
```

</details>

<details>
<summary><strong>Portainer</strong></summary>

<img width="600" height="600" alt="2025-10-25_19-55" src="https://github.com/user-attachments/assets/0bafc4b6-0321-412e-87ac-1142e357cbb6" />

Managing docker containers via the command line is honestly a pain, hence, portainer.

Installed portainer by following the instructions in their docs - [Portainer Installation Instructions](https://docs.portainer.io/start/install/server/docker/linux)

</details>

<details>
<summary><strong>Paperless</strong></summary>

<img width="600" height="600" alt="2025-11-03_19-34" src="https://github.com/user-attachments/assets/5d416196-5746-40c6-b6f2-ea8ba6d42cf3" />

Amongst document management system, paperless ngx shines bright. It was a no-brainer to self-host this too! With it's OCR capabilities and it's search on steroids, it is one of the most feature-rich service in my self-hosted services drawer.
The `docker-compose.yml` for paperless is:

```yaml
services:
  paperless:
    image: ghcr.io/paperless-ngx/paperless-ngx:latest
    container_name: paperless
    restart: unless-stopped
    depends_on:
      - db
      - redis
    ports:
      - "8080:80"
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=TIMEZONE
      - PAPERLESS_TIME_ZONE=TIMEZONE
      - PAPERLESS_DBHOST=DB_HOST
      - PAPERLESS_DBPORT=DB_PORT
      - PAPERLESS_DBNAME=DB
      - PAPERLESS_DBUSER=USER
      - PAPERLESS_DBPASS=PASSWORD
      - PAPERLESS_REDIS=redis://redis:5330/0
      - PAPERLESS_CONSUMPTION_DIR=PATH # Give the path of the directory you want paperless to watch for files
      - PAPERLESS_CONSUMPTION_DIR_MONITOR=0 # Paperless polls instead of inotify monitoring
      - PAPERLESS_CONSUMPTION_DIR_RECURSIVE=1 # Read through nested folders
      - PAPERLESS_CONSUMER_RECURSIVE=true
      - PAPERLESS_OCR_MODE=skip # Skip if unable to OCR any document
      - PAPERLESS_OCR_SKIP_IF_OCR_FAILS=false
      - PAPERLESS_OCR_RETRY_ON_FAIL=false
      - PAPERLESS_CONSUMER_ENABLE_IMAGE_CONVERSION=true # Enables image pre-processing
      - PAPERLESS_CONSUMER_GS_OPTIONS=--continue-on-soft-render-error
      - PAPERLESS_CONSUME_COPY=true # If set to true, it copies files in the watch dir instead of moving them.
      - PAPERLESS_ALLOWED_HOSTS=PAPERLESS_URL
      - PAPERLESS_CSRF_TRUSTED_ORIGINS=PAPERLESS_URL_WITH_HTTPS
      - PAPERLESS_URL=PAPERLESS_URL
      - PAPERLESS_CONSUMER_POLLING=1
      - PAPERLESS_CONSUMER_POLLING_SECONDS=15 # Check every 15 seconds for new file addition in watch dir
      - PAPERLESS_WORKER_TIMEOUT=3600  # 1 hour
      - PAPERLESS_WORKER_SOFT_TIME_LIMIT=3500 # 58 minutes 20 seconds

    volumes:
      - /opt/paperless/data:/usr/src/paperless/data
      - /opt/paperless/media:/usr/src/paperless/media

  db:
    image: postgres:16-alpine
    container_name: paperless-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=DB
      - POSTGRES_USER=USER
      - POSTGRES_PASSWORD=PASSWORD
      - TZ=TIMEZONE
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U paperless -d paperless || exit 1"]
      interval: 5s
      timeout: 5s
      retries: 20
    volumes:
      - paperless-pg:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: paperless-redis
    restart: unless-stopped
    command: ["redis-server","--appendonly","yes"]
    healthcheck:
      test: ["CMD","redis-cli","ping"]
      interval: 5s
      timeout: 3s
      retries: 20
    volumes:
      - paperless-redis:/data

volumes:
  paperless-pg:
  paperless-redis:
```

One thing to be noted is, I've set paperless to watch a specific folder in nextcloud for consumption. Hence, whenever I upload a document in that particular folder, paperless consumes the file and archives it.

</details>

<details>
<summary><strong>ConvertX</strong></summary>

<img width="600" height="600" alt="image" src="https://github.com/user-attachments/assets/5c748528-fffb-4558-9b13-1e98c5d5a853" />

With the frequent need for a secure, easy to use file conversion service, I wanted to host mine. With over 1000+ file type conversion support, ConvertX was my choice. It is light-weight, simple and secure. 
The `docker-compose.yml` for this service:

```yaml
# docker-compose.yml
services:
  convertx:
    image: ghcr.io/c4illin/convertx
    container_name: convertx
    restart: unless-stopped
    ports:
      - "53400:3000"
    environment:
      - TZ=TIMEZONE
      - ALLOW_UNAUTHENTICATED=false
      - ACCOUNT_REGISTRATION=false
      - AUTO_DELETE_EVERY_N_HOURS=24
      - HIDE_HISTORY=false
      - JWT_SECRET=generate_your_own_token # will use randomUUID() if unset
      # - HTTP_ALLOWED=true # uncomment this if accessing it over a non-https connection
    volumes:
      - ./data:/app/data
      - ./bin/soffice:/usr/local/bin/soffice:ro
      - ./bin/libreoffice:/usr/local/bin/libreoffice:ro
      - ./bin/loffice:/usr/local/bin/loffice:ro
```

</details>

## Item Links
→ Rasberry Pi 5 (16GB) - [Amazon](https://www.amazon.com/Raspberry-Pi-SC1113-5-16GB/dp/B0DSPYPKRG) <br>
→ Rasberry Pi M.2 Hat - [Amazon](https://a.co/d/24XtJFv) <br>
→ Rasberry Pi 27W Power Supply - [raspberrypi.com](https://www.raspberrypi.com/products/27w-power-supply/) <br>
→ Rasberry Pi 5 Active Cooler  - [Amazon](https://a.co/d/f49ZXOp) <br>
→ Crucial P310 1TB M.2 2230 SSD  - [Amazon](https://a.co/d/31NJVJh) <br>
