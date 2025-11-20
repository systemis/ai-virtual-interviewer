# Interview Storage Setup (Backend-Based)

This guide explains how the interview system saves data to Supabase through the Django backend.

## Overview

The interview system automatically saves completed interviews to Supabase **via the Django backend**, including:
- Interview configuration (job role, experience level, interview type)
- Full conversation history (all messages between interviewer and user)
- AI-generated feedback with scores
- Completion timestamp

**Important**: All database operations go through the Django backend API. The frontend does NOT directly access Supabase for data storage (only for authentication).

## Architecture

```
Frontend (React/Next.js)
    ↓
    | HTTP POST /api/interviews/save
    ↓
Django Backend
    ↓
    | Supabase Python Client
    ↓
Supabase Database
```

## Database Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://pmpmrefqhcpjvnxculna.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration Script

1. Open the file `supabase_migration.sql` in this directory
2. Copy the entire SQL script
3. Paste it into the Supabase SQL Editor
4. Click **Run** to execute the script

The script will create:
- **`interviews` table** with all required columns and constraints
- **Indexes** for optimized query performance
- **Row Level Security (RLS)** policies to protect user data
- **Statistics view** for analytics (optional)

### Step 3: Verify the Setup

After running the migration, verify the table was created:

1. Go to **Table Editor** in Supabase
2. You should see the `interviews` table
3. Click on it to view the schema

## Database Schema

### `interviews` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Foreign key to auth.users (nullable for anonymous) |
| `job_role` | TEXT | Target job position |
| `experience_level` | TEXT | Junior, Mid-level, or Senior |
| `interview_type` | TEXT | Behavioral, Technical, or System Design |
| `conversation` | JSONB | Full chat history as JSON |
| `feedback` | JSONB | AI feedback object with scores and recommendations |
| `overall_score` | INTEGER | Overall score (1-10) |
| `communication_score` | INTEGER | Communication score (1-10) |
| `technical_score` | INTEGER | Technical score (1-10) |
| `question_count` | INTEGER | Number of questions asked |
| `completed_at` | TIMESTAMPTZ | When interview was completed |
| `created_at` | TIMESTAMPTZ | When record was created (auto) |

## Backend API

### Django Endpoint: `POST /api/interviews/save`

**Location**: `/backend/llm_api/views/interview_views.py`

**Request Body**:
```json
{
  "user_id": "optional-user-uuid",
  "job_role": "Software Engineer",
  "experience_level": "Mid-level",
  "interview_type": "Behavioral",
  "conversation": [
    {"role": "interviewer", "content": "Tell me about yourself"},
    {"role": "user", "content": "I'm a software engineer..."}
  ],
  "feedback": {
    "overallScore": 8,
    "communicationScore": 9,
    "technicalScore": 7,
    "strengths": ["Clear communication"],
    "areasForImprovement": ["More technical depth"],
    "detailedFeedback": "You performed well...",
    "recommendations": ["Practice STAR method"]
  },
  "question_count": 5
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Interview saved successfully",
  "data": {
    "id": "uuid-here",
    "created_at": "2024-11-20T...",
    ...
  }
}
```

## How It Works

### Automatic Storage

When an interview ends (either by completing all questions or user requesting early termination), the system automatically:

1. Generates AI feedback
2. Calls Django backend API endpoint
3. Backend saves to Supabase database
4. Transitions to the feedback screen

### Code Integration

**Frontend** (`useInterview.ts` and `InterviewApp.tsx`):
```typescript
import { saveInterview } from "../lib/django-client";

// Save interview via Django backend
await saveInterview({
  jobRole,
  experience,
  interviewType,
  messages,
  feedback: feedbackData,
  questionCount,
});
```

**Backend** (`llm_api/supabase_client.py`):
```python
def save_complete_interview(
    user_id, job_role, experience_level,
    interview_type, conversation, feedback, question_count
):
    interview_data = {
        'user_id': user_id,
        'job_role': job_role,
        'experience_level': experience_level,
        'interview_type': interview_type,
        'conversation': conversation,
        'feedback': feedback,
        'overall_score': feedback.get('overallScore'),
        'communication_score': feedback.get('communicationScore'),
        'technical_score': feedback.get('technicalScore'),
        'question_count': question_count,
        'completed_at': datetime.utcnow().isoformat()
    }

    response = supabase.table('interviews').insert(interview_data).execute()
    return response.data[0]
```

## Security

### Row Level Security (RLS)

The database is configured with RLS policies:

- ✅ **Authenticated users** can only view, insert, update, and delete their own interviews
- ✅ User data is automatically isolated by `user_id`
- ✅ Prevents unauthorized access to other users' interview data

### Backend Security

- Django backend uses **service role key** for database operations
- Frontend cannot directly access database (except auth)
- All data validation happens in Django serializers
- CORS configured to only allow frontend origin

## Querying the Database

### View All Interviews (in Supabase Dashboard)

```sql
SELECT
  job_role,
  experience_level,
  overall_score,
  completed_at
FROM interviews
ORDER BY completed_at DESC;
```

### Get User Statistics

```sql
SELECT * FROM interview_statistics
WHERE user_id = 'your-user-id';
```

### Find High-Scoring Interviews

```sql
SELECT
  job_role,
  overall_score,
  communication_score,
  technical_score
FROM interviews
WHERE overall_score >= 8
ORDER BY overall_score DESC;
```

## Testing

To test the integration:

1. **Start Django backend**: `cd backend && python manage.py runserver`
2. **Start frontend**: `cd frontend && npm run dev`
3. Complete an interview (either all questions or request early end)
4. Check browser console for "Interview saved successfully"
5. Go to Supabase Table Editor → `interviews` table
6. Verify a new record was created with your conversation and feedback

## Troubleshooting

### Data Not Saving

1. **Check Django backend is running**: `http://localhost:8000/api/health`
2. **Check browser console** for error messages
3. **Check Django logs** in the terminal where you ran `runserver`
4. **Verify Supabase connection**: Check `.env` file in backend folder
5. **Check RLS policies**: Ensure the migration script ran successfully

### Permission Errors

If you get permission errors:
- Verify the migration script ran successfully
- Check that RLS policies were created
- Ensure Django backend is using service role key (not anon key)

### CORS Errors

If you get CORS errors:
- Check Django `settings.py` has your frontend URL in `CORS_ALLOWED_ORIGINS`
- Default: `http://localhost:3000`

## Next Steps

Potential features to add:

- Build an interview history dashboard (fetch from backend API)
- Add analytics and progress tracking
- Export interviews to PDF
- Compare scores across multiple interviews
- Add search and filter functionality
- Create Django admin interface for viewing interviews

## API Endpoints (To Be Implemented)

You can extend the backend with additional endpoints:

```python
# Get user's interview history
GET /api/interviews/list?user_id=uuid

# Get specific interview
GET /api/interviews/<id>

# Delete interview
DELETE /api/interviews/<id>

# Get interview statistics
GET /api/interviews/stats?user_id=uuid
```

---

**Questions or Issues?**
- Check browser console for frontend errors
- Check Django terminal logs for backend errors
- Review Supabase logs in dashboard for database errors
