# Prisma Setup Guide

**Assuming you already have PostgreSQL or MySQL installed and running.**

**Note:** The Prisma schema is already configured in this repository. You only need to set up your database connection and run migrations.

---

## 🚀 Quick Start (2 Minutes)

### 1. Install Dependencies

```bash
cd backend
npm install
```

This installs Prisma and all required packages.

---

### 2. Configure Database Connection

**Create `.env` file in the `backend` folder:**

**For PostgreSQL (Recommended):**
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/notesdb?schema=public"
PORT=4000
JWT_SECRET="your-secret-key-here"
FRONTEND_URL="http://localhost:3000"
```

**For MySQL:**
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/notesdb"
PORT=4000
JWT_SECRET="your-secret-key-here"
FRONTEND_URL="http://localhost:3000"
```

**Important:** Replace `yourpassword` with your actual database password.

---

### 3. Create Database

**PostgreSQL:**
```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE notesdb;

# Exit
\q
```

**MySQL:**
```bash
# Access MySQL
mysql -u root -p

# Create database
CREATE DATABASE notesdb;

# Exit
exit;
```

---

### 4. Run Migrations

```bash
npx prisma migrate dev
```

This will:
- Apply all migrations to your database
- Generate Prisma Client
- Create tables: User, Folder, Note

---

### 5. Start the Server

```bash
npm run dev
```

Your backend should now be running on `http://localhost:4000`! ✅

---

## 📝 Common Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create new migration
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio (Database GUI)
npx prisma studio

# Format schema file
npx prisma format

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

---

## 🔧 Quick Troubleshooting

**Can't connect to database?**
- Check if PostgreSQL/MySQL is running
- Verify connection string in `.env`

**Type errors after schema change?**
```bash
npx prisma generate
```

**Migration failed?**
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

## ✅ Setup Checklist

- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file with DATABASE_URL
- [ ] Create database (PostgreSQL/MySQL)
- [ ] Run migrations: `npx prisma migrate dev`
- [ ] Start server: `npm run dev`
- [ ] Done! Backend running on port 4000

---

## 📚 Resources

- **Docs**: [prisma.io/docs](https://www.prisma.io/docs)
- **Examples**: [github.com/prisma/prisma-examples](https://github.com/prisma/prisma-examples)

**Done! You're ready to use Prisma! 🎉**
