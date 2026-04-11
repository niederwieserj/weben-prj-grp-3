# weben-prj-grp-3
WEBEN Project Group 3

[Project specification](https://moodle.technikum-wien.at/pluginfile.php/2838149/mod_resource/content/1/BWI_Webshop_ProjektSpezifikation.pdf)

Execute Docker container by running

```sh
docker compose up -d
```

in this folder (the root folder of the git repo).

# 3rd Party Tools
| Tool                  | Version | Date       | Note                    |
| --------------------- | ------- | ---------- | ----------------------- |
| Bootstrap             | 5.3.8   | 15.03.2026 |                         |
| Bootstrap icons       | 1.13.1  | 15.03.2026 |                         |
| Bootstrap color modes | -       | 15.03.2026 | From Bootstrap examples |

```
weben-prj-grp-3
├─ .env
├─ bin
│  ├─ mariadb103
│  │  └─ Dockerfile
│  ├─ mariadb104
│  │  └─ Dockerfile
│  ├─ mariadb105
│  │  └─ Dockerfile
│  ├─ mariadb106
│  │  └─ Dockerfile
│  ├─ mysql57
│  │  └─ Dockerfile
│  ├─ mysql8
│  │  └─ Dockerfile
│  ├─ php54
│  │  └─ Dockerfile
│  ├─ php56
│  │  └─ Dockerfile
│  ├─ php71
│  │  └─ Dockerfile
│  ├─ php72
│  │  └─ Dockerfile
│  ├─ php73
│  │  └─ Dockerfile
│  ├─ php74
│  │  └─ Dockerfile
│  ├─ php8
│  │  └─ Dockerfile
│  ├─ php81
│  │  └─ Dockerfile
│  ├─ php82
│  │  └─ Dockerfile
│  ├─ php83
│  │  └─ Dockerfile
│  └─ php84
│     └─ Dockerfile
├─ config
│  ├─ initdb
│  ├─ mysql
│  │  └─ my.cnf
│  ├─ php
│  │  └─ php.ini
│  └─ vhosts
│     └─ default.conf
├─ db-scripts
│  └─ users.sql
├─ docker-compose.yml
├─ README.md
└─ www
   ├─ backend
   │  ├─ config
   │  │  ├─ constants.php
   │  │  └─ db_access.php
   │  ├─ logic
   │  │  ├─ admin.php
   │  │  ├─ auth.php
   │  │  ├─ cart.php
   │  │  ├─ orders.php
   │  │  ├─ products.php
   │  │  └─ request_handler.php
   │  ├─ models
   │  │  ├─ cart_item.class.php
   │  │  ├─ coupon.class.php
   │  │  ├─ order.class.php
   │  │  ├─ product.class.php
   │  │  └─ user.class.php
   │  └─ product-pictures
   │     └─ placeholder.txt
   ├─ frontend
   │  ├─ bootstrap
   │  │  ├─ color-modes
   │  │  │  └─ color-modes.js
   │  │  ├─ css
   │  │  │  ├─ bootstrap-grid.css
   │  │  │  ├─ bootstrap-grid.css.map
   │  │  │  ├─ bootstrap-grid.min.css
   │  │  │  ├─ bootstrap-grid.min.css.map
   │  │  │  ├─ bootstrap-grid.rtl.css
   │  │  │  ├─ bootstrap-grid.rtl.css.map
   │  │  │  ├─ bootstrap-grid.rtl.min.css
   │  │  │  ├─ bootstrap-grid.rtl.min.css.map
   │  │  │  ├─ bootstrap-reboot.css
   │  │  │  ├─ bootstrap-reboot.css.map
   │  │  │  ├─ bootstrap-reboot.min.css
   │  │  │  ├─ bootstrap-reboot.min.css.map
   │  │  │  ├─ bootstrap-reboot.rtl.css
   │  │  │  ├─ bootstrap-reboot.rtl.css.map
   │  │  │  ├─ bootstrap-reboot.rtl.min.css
   │  │  │  ├─ bootstrap-reboot.rtl.min.css.map
   │  │  │  ├─ bootstrap-utilities.css
   │  │  │  ├─ bootstrap-utilities.css.map
   │  │  │  ├─ bootstrap-utilities.min.css
   │  │  │  ├─ bootstrap-utilities.min.css.map
   │  │  │  ├─ bootstrap-utilities.rtl.css
   │  │  │  ├─ bootstrap-utilities.rtl.css.map
   │  │  │  ├─ bootstrap-utilities.rtl.min.css
   │  │  │  ├─ bootstrap-utilities.rtl.min.css.map
   │  │  │  ├─ bootstrap.css
   │  │  │  ├─ bootstrap.css.map
   │  │  │  ├─ bootstrap.min.css
   │  │  │  ├─ bootstrap.min.css.map
   │  │  │  ├─ bootstrap.rtl.css
   │  │  │  ├─ bootstrap.rtl.css.map
   │  │  │  ├─ bootstrap.rtl.min.css
   │  │  │  └─ bootstrap.rtl.min.css.map
   │  │  └─ js
   │  │     ├─ bootstrap.bundle.js
   │  │     ├─ bootstrap.bundle.js.map
   │  │     ├─ bootstrap.bundle.min.js
   │  │     ├─ bootstrap.bundle.min.js.map
   │  │     ├─ bootstrap.esm.js
   │  │     ├─ bootstrap.esm.js.map
   │  │     ├─ bootstrap.esm.min.js
   │  │     ├─ bootstrap.esm.min.js.map
   │  │     ├─ bootstrap.js
   │  │     ├─ bootstrap.js.map
   │  │     ├─ bootstrap.min.js
   │  │     └─ bootstrap.min.js.map
   │  ├─ bootstrap-icons
   │  │  ├─ bootstrap-icons.min.css
   │  │  └─ bootstrap-icons.svg
   │  ├─ components
   │  │  ├─ footer.html
   │  │  ├─ head.html
   │  │  ├─ navbar.html
   │  │  └─ theme.html
   │  ├─ css
   │  │  ├─ checkout.css
   │  │  ├─ headers.css
   │  │  ├─ product.css
   │  │  ├─ sign-in.css
   │  │  ├─ style.css
   │  │  └─ theme.css
   │  ├─ img
   │  │  └─ bootstrap-logo.svg
   │  ├─ js
   │  │  ├─ app.js
   │  │  ├─ auth.js
   │  │  ├─ cart.js
   │  │  ├─ checkout.js
   │  │  ├─ layout.js
   │  │  └─ search.js
   │  └─ sites
   │     ├─ checkout.html
   │     ├─ home.html
   │     ├─ products.html
   │     ├─ sign-in.html
   │     └─ template.html
   └─ legacy
      ├─ assets
      │  ├─ css
      │  │  ├─ bulma.css.map
      │  │  └─ bulma.min.css
      │  └─ images
      │     └─ favicon.svg
      ├─ index.php
      ├─ phpinfo.php
      ├─ test_db.php
      └─ test_db_pdo.php

```