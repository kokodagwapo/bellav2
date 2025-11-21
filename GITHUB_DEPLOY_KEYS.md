# GitHub Deployment API Keys Setup Guide

This guide will help you set up the required API keys as GitHub Secrets for automatic deployment to GitHub Pages.

## Required API Keys

Your application needs the following API keys to function properly:

### 1. **VITE_API_KEY** (Required)
- **Purpose**: Google Gemini API key for AI chat and voice functionality
- **Get your key**: https://aistudio.google.com/app/apikey
- **Status**: ✅ Required

### 2. **VITE_OPENAI_API_KEY** (Optional but Recommended)
- **Purpose**: OpenAI API key for enhanced TTS voice (Nova voice)
- **Get your key**: https://platform.openai.com/api-keys
- **Status**: ⚠️ Optional (falls back to Gemini TTS if not set)

### 3. **VITE_MAPBOX_API_KEY** (Required)
- **Purpose**: Mapbox API key for address verification and autocomplete
- **Get your key**: https://account.mapbox.com/access-tokens/
- **Status**: ✅ Required

## Setting Up GitHub Secrets

Follow these steps to add your API keys as GitHub Secrets:

### Step 1: Navigate to Repository Settings
1. Go to your GitHub repository: `https://github.com/kokodagwapo/bellaprep`
2. Click on **Settings** (top navigation bar)
3. In the left sidebar, click on **Secrets and variables** → **Actions**

### Step 2: Add Each Secret
For each API key, click **New repository secret** and add:

#### Secret 1: VITE_API_KEY
- **Name**: `VITE_API_KEY`
- **Value**: Your Gemini API key (starts with something like `AIza...`)
- Click **Add secret**

#### Secret 2: VITE_OPENAI_API_KEY
- **Name**: `VITE_OPENAI_API_KEY`
- **Value**: Your OpenAI API key (starts with `sk-...`)
- Click **Add secret**

#### Secret 3: VITE_MAPBOX_API_KEY
- **Name**: `VITE_MAPBOX_API_KEY`
- **Value**: Your Mapbox access token (starts with `pk.eyJ...`)
- Click **Add secret**

### Step 3: Verify Secrets
After adding all secrets, you should see them listed under **Repository secrets**:
- ✅ VITE_API_KEY
- ✅ VITE_OPENAI_API_KEY (optional)
- ✅ VITE_MAPBOX_API_KEY

## How It Works

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. Reads these secrets during the build process
2. Injects them as environment variables
3. Builds your application with the API keys embedded
4. Deploys to GitHub Pages

## Security Notes

⚠️ **Important Security Information:**
- These secrets are **encrypted** and only accessible during GitHub Actions workflows
- They are **never** exposed in logs or the deployed code
- Only repository collaborators with admin access can view/edit secrets
- The keys are embedded in the built JavaScript bundle (this is normal for Vite apps)
- Consider using **restricted API keys** with domain/IP restrictions if your API provider supports it

## Testing the Deployment

After setting up the secrets:
1. Push any change to the `main` branch
2. GitHub Actions will automatically trigger
3. Check the Actions tab to see the deployment progress
4. Once complete, your site will be live at: `https://kokodagwapo.github.io/bellaprep/`

## Troubleshooting

### Build Fails with "API key not found"
- Verify all secrets are correctly named (case-sensitive)
- Check that the secrets are added to the correct repository
- Ensure the workflow file has the correct secret names

### Address Autocomplete Not Working
- Verify `VITE_MAPBOX_API_KEY` is set correctly
- Check Mapbox account for usage limits
- Ensure the Mapbox token has the correct scopes

### AI Voice Not Working
- Verify `VITE_API_KEY` (Gemini) is set
- Optionally set `VITE_OPENAI_API_KEY` for better voice quality
- Check browser console for API errors

## Getting Your API Keys

### Gemini API Key
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key (starts with `AIza...`)

### OpenAI API Key
1. Visit: https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click **Create new secret key**
4. Copy the key (starts with `sk-...`)
5. ⚠️ Save it immediately - you won't see it again!

### Mapbox API Key
1. Visit: https://account.mapbox.com/access-tokens/
2. Sign in or create a free account
3. Your default public token will be shown
4. Copy the token (starts with `pk.eyJ...`)
5. For production, consider creating a restricted token

## Need Help?

If you encounter any issues:
1. Check the GitHub Actions logs in the **Actions** tab
2. Review the browser console for runtime errors
3. Verify all API keys are valid and have proper permissions

