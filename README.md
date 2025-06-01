# AI Employment Coach

An AI-powered recruitment platform that revolutionizes the hiring process with automated phone interviews, intelligent candidate screening, and comprehensive evaluation tools.

## 🚀 Features

- **AI-Powered Phone Interviews**: Automated interviews using VAPI integration
- **Smart Candidate Screening**: Intelligent evaluation and scoring system
- **Role-Specific Assessments**: Customized interview processes for different positions
- **Real-time Dashboard**: Track applications, candidates, and interview progress
- **Comprehensive Reporting**: Detailed analytics and candidate insights
- **Modern UI/UX**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: VAPI for voice AI interviews
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- VAPI account (for AI interviews)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mountainpass-ai-coach
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# VAPI Configuration
VAPI_API_KEY=your_vapi_api_key
VAPI_PHONE_NUMBER=your_vapi_phone_number
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the SQL script in your Supabase dashboard:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database-setup.sql`
   - Execute the script

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── candidates/         # Candidate management page
│   ├── job-setup/         # Job creation and setup
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
│   ├── layout/           # Layout components (navigation)
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   └── supabase.ts       # Supabase client configuration
└── types/                # TypeScript type definitions
    └── database.ts       # Database schema types
```

## 🗄️ Database Schema

The application uses the following main tables:

- **jobs**: Job postings with requirements and interview configuration
- **candidates**: Candidate profiles with skills and experience
- **applications**: Job applications linking candidates to jobs
- **interviews**: AI interview sessions with scores and feedback

## 🔧 Configuration

### VAPI Integration

To enable AI phone interviews:

1. Sign up for a VAPI account
2. Get your API key and phone number
3. Configure the environment variables
4. Set up your AI agents in the VAPI dashboard

### Supabase Setup

1. Create a new Supabase project
2. Enable Row Level Security (RLS)
3. Set up authentication (optional)
4. Run the provided SQL schema

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Usage

### Creating a Job

1. Navigate to "Job Setup"
2. Fill in job details, requirements, and benefits
3. Configure the AI interview process
4. Set up VAPI integration for phone interviews
5. Publish the job

### Managing Candidates

1. View all candidates in the "Candidates" page
2. Review applications and interview progress
3. Access detailed candidate profiles
4. View AI interview scores and feedback

### Interview Process

1. Candidates apply through your system
2. AI automatically conducts phone interviews
3. Review interview transcripts and scores
4. Make hiring decisions based on comprehensive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the database schema in `database-setup.sql`

## 🔮 Roadmap

- [ ] Advanced AI interview customization
- [ ] Integration with more job boards
- [ ] Enhanced analytics and reporting
- [ ] Mobile application
- [ ] Multi-language support
- [ ] Video interview capabilities

---

Built with ❤️ using Next.js, Supabase, and VAPI

# Triggering Vercel deployment as a new project member
