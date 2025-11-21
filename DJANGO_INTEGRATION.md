# Django Backend Integration Guide

This guide explains how to integrate your Next.js AI Virtual Interview app with the Django LLM backend.

## Overview

The Django backend provides a centralized API for LLM requests, replacing direct API calls from Next.js. This provides:

- **Better separation of concerns** - Backend logic stays in Django
- **Easier API key management** - Keys stored in Django backend only
- **Multi-provider support** - Easy switching between OpenAI and Anthropic
- **Centralized rate limiting** - Manage all LLM requests in one place
- **Improved security** - API keys never exposed to frontend

## Setup

### 1. Start Django Backend

```bash
cd ../django-backend
./start.sh
# Django backend will run on http://localhost:8000
```

### 2. Update Next.js Environment

The `.env.local` file has been created with:

```env
NEXT_PUBLIC_DJANGO_API_URL=http://localhost:8000/api
```

### 3. Start Next.js App

```bash
npm run dev
# Next.js will run on http://localhost:3000
```

## Integration Methods

### Method 1: Direct Client-Side Calls (Recommended)

Use the new Django client library directly in your components:

```typescript
import { useDjangoLLM } from '@/app/hooks/useDjangoLLM';

function MyComponent() {
  const { callClaude, loading, error } = useDjangoLLM();

  const handleChat = async () => {
    const response = await callClaude({
      messages: [{ role: 'user', content: 'Hello!' }],
      systemPrompt: 'You are a helpful assistant.',
      maxTokens: 1000,
    });

    if (response) {
      console.log(response.content);
    }
  };

  return (
    <button onClick={handleChat} disabled={loading}>
      {loading ? 'Loading...' : 'Send Message'}
    </button>
  );
}
```

### Method 2: Through Next.js API Route (Proxy)

Replace your existing API route with the Django proxy:

```bash
# Backup original
mv app/api/chat/route.ts app/api/chat/route.original.ts

# Use Django proxy
mv app/api/chat/route-django.ts app/api/chat/route.ts
```

Then use your existing API utility:
## Migrating Existing Code

### Option A: Minimal Changes (Use Compatibility Layer)

Replace imports in your existing code:

### Option B: Use New Django Client Directly

For better type safety and features:

```typescript
import { callAnthropicAPI } from '@/app/lib/django-client';

const response = await callAnthropicAPI({
  messages,
  systemPrompt,
  maxTokens: 300,
});

// Access response
const text = response.content;
```

## Available Functions

### Django Client (`app/lib/django-client.ts`)

```typescript
// Generic chat completion
import { chatCompletion } from '@/app/lib/django-client';

const response = await chatCompletion({
  provider: 'anthropic', // or 'openai'
  model: 'claude-3-5-sonnet-20241022',
  messages: [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Hello!' }
  ],
  temperature: 0.7,
  max_tokens: 1000,
});

// Anthropic-specific
import { callAnthropicAPI } from '@/app/lib/django-client';

const response = await callAnthropicAPI({
  messages: [{ role: 'user', content: 'Hello!' }],
  systemPrompt: 'You are helpful.',
  maxTokens: 1000,
  model: 'claude-3-5-sonnet-20241022', // optional
});

// OpenAI-specific
import { callOpenAIAPI } from '@/app/lib/django-client';

const response = await callOpenAIAPI({
  messages: [{ role: 'user', content: 'Hello!' }],
  systemPrompt: 'You are helpful.',
  maxTokens: 1000,
  model: 'gpt-4o-mini', // optional
});

// Health check
import { checkDjangoBackendHealth } from '@/app/lib/django-client';

const isHealthy = await checkDjangoBackendHealth();
```

### React Hook (`app/hooks/useDjangoLLM.ts`)

```typescript
import { useDjangoLLM } from '@/app/hooks/useDjangoLLM';

function MyComponent() {
  const {
    callClaude,
    callOpenAI,
    sendMessage,
    loading,
    error
  } = useDjangoLLM();

  // Call Claude
  const response1 = await callClaude({
    messages: [...],
    systemPrompt: '...',
  });

  // Call OpenAI
  const response2 = await callOpenAI({
    messages: [...],
    systemPrompt: '...',
  });

  // Generic call
  const response3 = await sendMessage({
    provider: 'anthropic',
    messages: [...],
  });
}
```

## Example Component

See `app/components/DjangoChatExample.tsx` for a complete working example:

```bash
# Add to a page to test
import DjangoChatExample from '@/app/components/DjangoChatExample';

export default function TestPage() {
  return <DjangoChatExample />;
}
```

## Update Existing Components

### Example: Update Interview Hook

```typescript
// In app/hooks/useInterview.ts

// Add at top
import { callAnthropicAPI } from '@/app/lib/django-client';

// Replace Anthropic call
const response = await callAnthropicAPI({
  messages: conversationHistory,
  systemPrompt: systemPrompt,
  maxTokens: 300,
});

// Access response content
const assistantMessage = response.content;
```
## Environment Variables

### Next.js (`.env.local`)
```env
NEXT_PUBLIC_DJANGO_API_URL=http://localhost:8000/api
```

### Django (`django-backend/.env`)
```env
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
SECRET_KEY=...
```

## Health Checks

### Check Django Backend

```typescript
import { checkDjangoBackendHealth } from '@/app/lib/django-client';

const isHealthy = await checkDjangoBackendHealth();
console.log('Django backend healthy:', isHealthy);
```

### Check Both Services

```bash
# Replace health route
mv app/api/health/route.ts app/api/health/route.original.ts
mv app/api/health/route-django.ts app/api/health/route.ts
```

Then access: `http://localhost:3000/api/health`

## Troubleshooting

### "Failed to fetch" or CORS errors

**Problem**: Django backend not running or CORS not configured

**Solution**:
1. Start Django backend: `cd django-backend && ./start.sh`
2. Verify CORS settings in `django-backend/backend/settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
       "http://127.0.0.1:3000",
   ]
   ```

### "Connection refused"

**Problem**: Django backend not running

**Solution**:
```bash
cd django-backend
./start.sh
```

### API key errors

**Problem**: API keys not set in Django backend

**Solution**:
```bash
cd django-backend
cp .env.example .env
# Edit .env and add your API keys
```

### Different response format

**Problem**: Django returns different response structure

**Solution**: Use `api-django.ts` compatibility layer or update your code to use the new response format:

```typescript
// Old format
response.content[0].text

// New format
response.content
```

## Production Deployment

### 1. Update API URL

```env
# .env.production
NEXT_PUBLIC_DJANGO_API_URL=https://your-django-backend.com/api
```

### 2. CORS Configuration

Update Django CORS settings:

```python
# django-backend/backend/settings.py
CORS_ALLOWED_ORIGINS = [
    "https://your-nextjs-app.com",
]
```

### 3. Security

- Set `DEBUG=False` in Django
- Use HTTPS for both services
- Set unique `SECRET_KEY` in Django
- Use environment variables for all secrets

## Files Created

| File | Purpose |
|------|---------|
| `app/lib/django-client.ts` | Django backend API client |
| `app/hooks/useDjangoLLM.ts` | React hook for Django backend |
| `app/utils/api-django.ts` | Compatibility layer for existing code |
| `app/api/chat/route-django.ts` | Proxy route to Django |
| `app/api/health/route-django.ts` | Health check for both services |
| `app/components/DjangoChatExample.tsx` | Example component |
| `.env.local` | Environment configuration |

## Migration Checklist

- [ ] Django backend running on port 8000
- [ ] `.env.local` created with `NEXT_PUBLIC_DJANGO_API_URL`
- [ ] Tested Django backend health: `curl http://localhost:8000/api/health`
- [ ] Imported `useDjangoLLM` or `django-client` in components
- [ ] Updated API calls to use Django backend
- [ ] Tested chat functionality
- [ ] Updated health checks
- [ ] Verified CORS configuration

## Need Help?

- Django backend docs: `../django-backend/README.md`
- Example component: `app/components/DjangoChatExample.tsx`
- Test the integration: Run both servers and test the example component
