# 🚀 Multi-Tenant Social Management Platform

A comprehensive automation platform for managing Instagram content across multiple clients using n8n workflows, Airtable, and AI-powered features.

---

## 📋 Overview

This platform automates the entire Instagram content lifecycle for multiple clients:
- **Automated posting** to Instagram (Feed, Story, Reels, Carousel)
- **AI-powered text proofreading** using OpenAI
- **PDF generation** for content calendars via Google Slides
- **Real-time notifications** via Telegram
- **Error tracking** and automated recovery
- **Multi-tenant architecture** with centralized client management

---

## ✨ Features

### 🎯 Core Capabilities
- ✅ Multi-client support with isolated configurations
- ✅ Instagram posting (Feed, Story, Reels, Carousel)
- ✅ Scheduled and manual posting options
- ✅ AI text proofreading and optimization
- ✅ Automated PDF content calendar generation
- ✅ Real-time Telegram notifications
- ✅ Comprehensive error tracking and logging
- ✅ Client analytics and reporting

### 📱 Instagram Platform Support
| Platform | Image | Video | Multiple Media | Status |
|----------|-------|-------|----------------|--------|
| **IG Feed** | ✅ | ✅ | ❌ | Production |
| **IG Story** | ✅ | ✅ | ❌ | Production |
| **IG Reels** | ❌ | ✅ | ❌ | Production |
| **IG Carousel** | ✅ | ❌ | ✅ (2-10 images) | Production |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AIRTABLE                                │
│                    (Content Database)                           │
│  • Client posts & content                                       │
│  • Scheduling information                                       │
│  • Media files                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      N8N WORKFLOWS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📤 Posting Router V4                                           │
│     ├─→ Instagram Publishing V4                                 │
│     │   ├─→ IG Carousel V4                                      │
│     │   └─→ IG Container Publisher V4                           │
│     │                                                            │
│     ├─→ PDF Generation V4                                       │
│     └─→ Proofread V4                                            │
│                                                                 │
└────────┬────────────────────────┬───────────────────────────────┘
         │                        │
         ▼                        ▼
┌──────────────────┐    ┌──────────────────┐
│   INSTAGRAM      │    │    SUPABASE      │
│   GRAPH API      │    │   (Analytics)    │
│                  │    │                  │
│  • Post content  │    │  • Logs          │
│  • Get results   │    │  • Statistics    │
└──────────────────┘    └──────────────────┘
         │
         ▼
┌──────────────────┐
│    TELEGRAM      │
│ (Notifications)  │
│                  │
│  • Success msgs  │
│  • Error alerts  │
└──────────────────┘
```

---

## 🗂️ Project Structure

```
social-management-platform/
│
├── n8n-workflows/
│   ├── v4-production/              # Active workflows
│   │   ├── The-Posting-Router-V4.json
│   │   ├── Instagram-Publishing-V4.json
│   │   ├── IG-Carousel-V4.json
│   │   ├── IG-Container-Publisher-V4.json
│   │   ├── PDF-Generation-V4.json
│   │   └── Proofread-V4.json
│   │
│   └── v3-legacy/                  # Archive
│       └── Error-Management-AI-Powered-V3.json
│
├── airtable-automations/           # Airtable scripts
│   ├── scheduled-post.js
│   ├── share-now.js
│   ├── pdf-generation.js
│   └── text-edit.js
│
├── google-apps-script/             # Google Apps Script
│   └── pdf-slide-generator.gs
│
├── database/                       # Database schemas
│   ├── supabase-tables.md
│
├── docs/                           # Documentation
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   ├── WORKFLOW-GUIDE.md
│   └── CLIENT-ONBOARDING.md
│
├── .gitignore
└── README.md                       # This file
```

---

## 🔧 Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Workflow Engine** | n8n | Automation orchestration |
| **Database** | Airtable | Content management |
| **Analytics** | Supabase | Logging and analytics |
| **Social Media** | Instagram Graph API | Posting to Instagram |
| **AI Processing** | OpenAI Assistant | Text proofreading |
| **PDF Generation** | Google Apps Script | Google Slides to PDF |
| **Notifications** | Telegram Bot API | Real-time alerts |

---

## 🚦 How It Works

### 1. **Scheduled Posting Flow**
```
Airtable Automation (scheduled)
    ↓
The Posting Router V4 (validation & routing)
    ↓
Instagram Publishing V4 (creates container)
    ↓
IG Container Publisher V4 (publishes)
    ↓
Updates Airtable + Logs to Supabase + Telegram notification
```

### 2. **Manual "Share Now" Flow**
```
User clicks "Share Now" button in Airtable
    ↓
Same workflow as scheduled posting
    ↓
Immediate posting to Instagram
```

### 3. **PDF Generation Flow**
```
Airtable button "Generate PDF"
    ↓
PDF Generation V4 workflow
    ↓
Google Apps Script creates slides
    ↓
PDF saved to Airtable + Logged to Supabase
```

### 4. **Text Proofreading Flow**
```
Airtable button "Proofread Text"
    ↓
Proofread V4 workflow
    ↓
OpenAI Assistant improves text
    ↓
Updates Airtable + Logs to Supabase
```

---

## 📊 Database Schema

### Supabase Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `client_registry` | Client configurations | One per client |
| `posting_success_logs` | Instagram posting results | One per post |
| `error_logs` | Error tracking | One per error |
| `pdf_generation_logs` | PDF generation tracking | One per PDF |
| `text_processing_logs` | AI proofreading logs | One per batch |

**Views:**
- `active_clients` - Active clients with stats
- `client_stats` - Client analytics
- `recent_executions` - Recent activity

See [database/supabase/tables.md](database/supabase-tables.md) for complete schema.

---

## 🔐 Security & Configuration

### Environment Variables (Not in Git)
- Instagram Access Tokens (stored in n8n credentials)
- Airtable API Keys (stored in n8n credentials)
- OpenAI API Keys (stored in n8n credentials)
- Telegram Bot Tokens (stored in n8n credentials)
- Supabase Connection Strings (stored in n8n credentials)

### Client Registry
All client configurations are stored in Supabase `client_registry` table:
- Instagram Page IDs
- Airtable Table IDs
- Telegram Channel IDs
- Timezone settings
- Active/inactive status

---

## 📈 Analytics & Monitoring

### What We Track
- ✅ Every Instagram post (success/failure)
- ✅ Execution times for performance monitoring
- ✅ Error rates by workflow and client
- ✅ PDF generation statistics
- ✅ AI proofreading metrics (texts changed vs unchanged)

### Available Views
- Client activity dashboard (via `client_stats` view)
- Recent executions (via `recent_executions` view)
- Error tracking and patterns
- Performance metrics per client

---

## 🚀 Getting Started

### Prerequisites
- n8n instance (cloud or self-hosted)
- Airtable account with base
- Instagram Business Account
- Meta Developer App with permissions
- Supabase project
- Google Apps Script access
- Telegram Bot
- OpenAI API account

### Setup Steps

1. **Import n8n workflows** from `n8n-workflows/v4-production/`
2. **Configure credentials** in n8n for all services
3. **Set up Supabase** tables using schemas in `database/supabase/`
4. **Add clients** to `client_registry` table
5. **Deploy Airtable automations** from `airtable-automations/`
6. **Deploy Google Apps Script** from `google-apps-script/`
7. **Test with one client** before going live

See [docs/SETUP.md](docs/SETUP.md) for detailed instructions.

---

## 👥 Adding New Clients

### Required Information
1. Client name and identifier (lowercase, normalized)
2. Instagram Business Account ID
3. Instagram Page Name
4. Airtable Base ID and Table ID
5. Telegram Channel ID (optional)
6. Timezone

### Steps
1. Add record to `client_registry` table in Supabase
2. Create Airtable table with proper structure
3. Test posting with sample content
4. Monitor logs for any issues

See [docs/CLIENT-ONBOARDING.md](docs/CLIENT-ONBOARDING.md) for details.

---

## 🐛 Troubleshooting

### Common Issues

**Posts not publishing:**
- Check `error_logs` table in Supabase
- Verify Instagram token is valid
- Check Airtable "Aksiyon" field is "Paylaşıma Hazır"
- Verify media files are accessible

**PDF not generating:**
- Check `pdf_generation_logs` table
- Verify Google Apps Script is deployed
- Check presentation template exists

**Text proofreading not working:**
- Check `text_processing_logs` table
- Verify OpenAI API key is valid
- Check thread ID in logs

---

## 📝 Workflow Versions

### V4 (Current - Production)
- ✅ The Posting Router V4
- ✅ Instagram Publishing V4
- ✅ IG Carousel V4
- ✅ IG Container Publisher V4
- ✅ PDF Generation V4
- ✅ Proofread V4

### V3 (Legacy - Reference Only)
- Archived in `n8n-workflows/v3-legacy/`
- Use for reference only
- Not actively maintained

---

## 🤝 Contributing

This is a private project. Contact the admin for access.

### Development Workflow
1. Make changes in a test n8n instance
2. Export workflow JSON
3. Update version in filename if needed
4. Commit to Git with descriptive message
5. Test thoroughly before deploying to production

---

## 📄 License

Private - All Rights Reserved

---

## 📞 Support

For issues or questions:
- Check `error_logs` in Supabase
- Review workflow execution logs in n8n
- Contact the development team

---

## 🔄 Updates

### Latest Changes
- **V4 Workflows** - Complete rewrite with improved error handling
- **Supabase Integration** - Comprehensive logging and analytics
- **Multi-tenant Support** - Centralized client registry
- **AI Proofreading** - OpenAI Assistant integration

---

**Last Updated:** October 2025  
**Status:** Production  
**Active Clients:** Check `active_clients` view in Supabase
