![Golang Build Status Check](https://github.com/DannyHinshaw/local-library/workflows/Golang%20Build%20Status%20Check/badge.svg)
![ESLint Status Check](https://github.com/DannyHinshaw/local-library/workflows/ESLint%20Status%20Check/badge.svg)
![React Build Status Check](https://github.com/DannyHinshaw/local-library/workflows/React%20Build%20Status%20Check/badge.svg)

# local-library

An example library management application built with Golang and MySQL on the backend and React on the front.

### Requirements (Given)

* API for CRUD of a books, managing title, author, isbn, description
* Ability to manage books through a web interface
* Ability to check in and check out a book
* Ability to track state changes for a book
* Report that contains the current state of all books

### Assumptions

Assumptions made from the list of requirements. Most are to save time as this is just a prototype and not a fully fledged production ready platform.

* It is assumed this application is for only one Library (no other branches or locations etc).
* It is assumed that all books have an ISBN.
* It is assumed this solution can be for small scale (no need for caching layers, multiple services, workers or any other over-architecting).

### Other Notes

* Requirements asked for a single repo, otherwise this would normally be split into at least two (frontend/backend).
* Updates tracking could be improved in many different ways but it is assumed this is very small scale.

### Run

```bash
docker-compose up --build
```

The first build takes some time... maybe grab a cup of java while you wait :coffee: (subsequent builds are way faster).

Once all services are available, visit `http://localhost:8000/` in your favorite browser.
