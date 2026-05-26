# Task Repos (not production)

### Fast start

Reqirements:

 * PostgreSQL: 9.x +

```bash
    git clone https://github.com/wnloved/test-task
```
### Frontend (http://localhost:5173)
```bash
  cd test-task
  npm install
  npm run dev
```
### Backend api (http://localhost:3000)
```bash
  cd backend
  npm install
  echo "DATABASE_URL=postgresql:postgres:postgres//localhost:5432/YOURDB > .env
  npm run start:dev
```
### Admin panel (http://localhost:5173/admin)
  * login: admin
  * password: agrotech2025
