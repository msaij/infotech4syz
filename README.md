# Infotech4syz Website

## Project Details

### Overview
This project is a Next.js-based website for Infotech4syz, showcasing various services, projects, and contact information.

### Features
- **Home Navigation**:
  - "Our Work" page: Displays projects interactively.
  - "Contact Us" page: Includes a form for inquiries and direct contact details.
  - "Services" section: Covers various offerings like corporate events, housekeeping, pantry, and stationery.
- **Dynamic Assets**: Uses SVG files and placeholder images from the `public` folder.
- **Modern UI**: Built with Tailwind CSS for responsive and visually appealing design.

### Development
- **Framework**: Next.js v15.3.3
- **Languages**: TypeScript and JavaScript
- **Styling**: Tailwind CSS v4
- **Linting**: ESLint v9

### Installation
Run the following command to install dependencies:
```bash
npm install
```

### Running the Project
Start the development server:
```bash
npm run dev
```

### Folder Structure
- `src/app/home-navigation/`: Contains pages for navigation.
- `public/`: Stores assets like SVGs and images.
- `src/styles/`: Custom styles.

### Prerequisites
Before running the project, ensure you have met the following requirements:
- Node.js installed (version 14.x or later)
- npm (Node Package Manager) installed

### Contribution
To contribute to this project, follow these steps:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeatureName`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/YourFeatureName`
5. Submit a pull request detailing your changes.

### Contact Information
For inquiries, visit the "Contact Us" page or email info@4syz.com.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Setup

To set up the database for this project, follow these steps:

1. **Install MySQL**:
   - Ensure MySQL is installed on your system. You can download it from [MySQL Downloads](https://dev.mysql.com/downloads/).

2. **Create a Database**:
   - Log in to your MySQL server and create a new database:
     ```sql
     CREATE DATABASE infotech4syz;
     ```

3. **Configure Environment Variables**:
   - Add the following environment variables to your `.env` file:
     ```env
     MYSQL_HOST=localhost
     MYSQL_USER=your_username
     MYSQL_PASSWORD=your_password
     MYSQL_DATABASE=infotech4syz
     ```

4. **Set Up Tables**:
   - Use the following SQL command to create the `contact_us` table:
     ```sql
     CREATE TABLE 4syz.contact_us (
         id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
         name VARCHAR(100) NOT NULL,
         phone VARCHAR(15),
         email VARCHAR(320) NOT NULL,
         city VARCHAR(50),
         zip VARCHAR(10) NOT NULL,
         message TEXT NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```

5. **Test the Connection**:
   - Ensure the database connection is working by running the application and submitting a test message through the "Contact Us" form.

6. **Retrieve Data**:
   - To retrieve data from the `contact_us` table, use the following SQL query:
     ```sql
     SELECT BIN_TO_UUID(id) AS id, name, email FROM `4syz`.`contact_us`;
     ```
   - This query converts the binary `id` into a readable UUID format and retrieves the `name` and `email` fields from the table.
