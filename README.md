# Sakila Film Verhuur

Een webapplicatie voor het beheren en verhuren van films. Medewerkers kunnen inloggen, klanten beheren, films bekijken en actieve verhuur inzien.

## Wat doet het
- Inloggen en uitloggen (sessies)
- Klantenoverzicht met **zoeken** en **paginering**
- Klant aanmaken, bewerken, soft delete en herstellen
- Klantdetails met adres (read-only) en actieve verhuur
- Filmoverzicht
- About Us-pagina met epics & user stories
- Health check endpoint

## Technologie
- Node.js + Express
- MySQL (Sakila database)
- Pug templates
- Bootstrap 5 voor styling
- `express-session` voor authenticatie/sessies

Belangrijke mappen/bestanden

app.js                     # Express app configuratie + middleware + route mounting
routes/
  index.js                 # home/about
  auth.js                  # login/logout
  users.js                 # klanten (paginering/zoeken/details/edit/create/soft delete)
  films.page.js            # filmoverzicht (views)
  rentals.js               # actieve verhuur
services/
  users.service.js         # validatie + domeinlogica voor users
dao/
  users.dao.js             # SQL-queries voor users (list/count/get/update/delete/restore/create)
views/
  layout.pug               # navbar + layout
  about.pug                # epics & user stories
  users/                   # table/details/create/edit
config/db.js               # MySQL connectie/pool (aangeroepen als database.query)
util/logger.js             # logging helper


## Setup
1. Installeer dependencies
   ```bash
   npm install

Maak een .env met je databasegegevens:

NODE_ENV=development
SESSION_SECRET=dev-secret

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=*****
DB_NAME=sakila
DB_PORT=3306

Start de server

npm run start
# draait op http://localhost:3000


Gemaakt door Manar Chahin