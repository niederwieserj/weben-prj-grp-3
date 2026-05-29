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

# Naming Conventions
[PHP Naming Conventions - Compile N Run](https://www.compilenrun.com/docs/language/php/php-best-practices/php-naming-conventions)


```
weben-prj-grp-3
├─ .env
├─ bin
│  ├─ mariadb106
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
│  ├─ insert-statements.sql
│  └─ webshop.sql
├─ docker-compose.yml
├─ README.md
└─ www
   ├─ backend
   │  ├─ controllers
   │  │  ├─ ProductController.php
   │  │  └─ UserController.php
   │  ├─ models
   │  │  ├─ Address.php
   │  │  ├─ Category.php
   │  │  ├─ Product.php
   │  │  ├─ ProductImage.php
   │  │  ├─ ProductRating.php
   │  │  └─ User.php
   │  ├─ product-pictures
   │  │  └─ RTX-5080-16g-vanguard-msi.png
   │  ├─ request-handler.php
   │  └─ services
   │     ├─ AuthService.php
   │     ├─ DbService.php
   │     └─ ProductService.php
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
   │  │  ├─ product-card.html
   │  │  ├─ theme.html
   │  │  └─ toast.html
   │  ├─ css
   │  │  ├─ checkout.css
   │  │  ├─ headers.css
   │  │  ├─ home.css
   │  │  ├─ product.css
   │  │  ├─ products.css
   │  │  ├─ sign-in.css
   │  │  └─ style.css
   │  ├─ img
   │  │  ├─ base-frame-4500x-config.png
   │  │  ├─ bootstrap-logo.svg
   │  │  ├─ case-white-3500x.png
   │  │  ├─ coreGear-logo-copy.png
   │  │  ├─ coreGear-logo.png
   │  │  ├─ icue-link-h100i-lcd-liquid-cooler.png
   │  │  ├─ icue-link-rx140-max-rgb140mm-pwm-w.png
   │  │  ├─ m370-NVMe-m.2.png
   │  │  ├─ mag-z890-tomahawk-wifi_II-mb.png
   │  │  ├─ rmx-series-rm750x-corsair.png
   │  │  ├─ RTX-5080-16g-vanguard-msi.png
   │  │  ├─ vengeance-ddr5-blk.png
   │  │  └─ vengeance-gaming-pc-hero.png
   │  ├─ js
   │  │  ├─ components
   │  │  │  ├─ auth.js
   │  │  │  ├─ cart.js
   │  │  │  ├─ checkout.js
   │  │  │  ├─ product.js
   │  │  │  ├─ products.js
   │  │  │  ├─ profile.js
   │  │  │  ├─ reset-password.js
   │  │  │  ├─ search.js
   │  │  │  └─ sign-up.js
   │  │  ├─ layout.js
   │  │  ├─ main.js
   │  │  └─ modules
   │  │     ├─ api.js
   │  │     ├─ cart.js
   │  │     ├─ toast.js
   │  │     ├─ utils.js
   │  │     └─ validators.js
   │  └─ sites
   │     ├─ checkout.html
   │     ├─ home.html
   │     ├─ product.html
   │     ├─ products.html
   │     ├─ profile.html
   │     ├─ reset-password.html
   │     ├─ sign-in.html
   │     ├─ sign-up.html
   │     └─ template.html
   ├─ index.php
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