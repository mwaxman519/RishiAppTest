# Direct Azure Build Trigger

The Azure deployment fix is ready but the git push timed out. Here are the direct commands to trigger the build:

## Option 1: Force Push from Terminal

```bash
cd /path/to/your/local/clone
git remote add origin https://github.com/mwaxman519/RishiAppTest.git
git push origin main --force
```

## Option 2: GitHub CLI (Recommended)

```bash
gh repo clone mwaxman519/RishiAppTest
cd RishiAppTest
# Make any small change to trigger build
echo "$(date)" > build-trigger.txt
git add .
git commit -m "Trigger Azure build with multi-platform fix"
git push origin main
```

## Option 3: GitHub Web Interface

1. Go to https://github.com/mwaxman519/RishiAppTest
2. Click "Actions" tab
3. Click "Re-run all jobs" on the latest workflow
4. Or create a new file via web interface to trigger build

## What the Fix Contains

- **Removed**: encrypt-secret.py, pyproject.toml, uv.lock (Python files causing multi-platform detection)
- **Added**: Enhanced oryx.ini with platform disabling
- **Updated**: GitHub workflow with Python/PHP cleanup step
- **Fixed**: Azure will now detect only Node.js 18.20.4

## Expected Result

Azure will successfully build and deploy all 143 API routes as Functions at:
https://yellow-rock-0a390fd10.1.azurestaticapps.net

The multi-platform detection error will be resolved.