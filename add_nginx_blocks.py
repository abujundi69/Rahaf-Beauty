#!/usr/bin/env python3
import shutil

PATH = "/opt/marketplace/nginx/nginx.conf"

content = open(PATH).read()

if "rahafbeauty.com" in content:
    print("Rahaf Beauty blocks already exist — nothing to do.")
    exit(0)

shutil.copy2(PATH, PATH + ".bak")
print(f"Backup saved to {PATH}.bak")

blocks = """
    # ── RAHAF BEAUTY ─────────────────────────────────────────────
    server {
        listen 80;
        server_name rahafbeauty.com www.rahafbeauty.com;

        location / {
            proxy_pass         http://rahaf-frontend:80;
            proxy_http_version 1.1;
            proxy_set_header   Host              $host;
            proxy_set_header   X-Real-IP         $remote_addr;
            proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
        }
    }

    server {
        listen 80;
        server_name api.rahafbeauty.com;

        location / {
            proxy_pass         http://rahaf-api:8080;
            proxy_http_version 1.1;
            proxy_set_header   Host              $host;
            proxy_set_header   X-Real-IP         $remote_addr;
            proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
            proxy_read_timeout 120s;
        }
    }
"""

last = content.rfind("}")
new_content = content[:last] + blocks + "\n}"
open(PATH, "w").write(new_content)
print("Done — Rahaf Beauty server blocks added.")
