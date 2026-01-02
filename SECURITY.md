# Security Policy

## Security Considerations

This plugin handles sensitive data (OAuth tokens and calendar information). Please review these security considerations before use:

### 🔒 Token Storage

**Current Implementation:**
- OAuth tokens (access token, refresh token, client secret) are stored in plain text in Obsidian's `data.json` file
- File location: `.obsidian/plugins/google-calendar-static/data.json`

**Security Implications:**
- ⚠️ **Anyone with access to your vault can read these tokens**
- ⚠️ **Tokens grant read-only access to your Google Calendar**
- ⚠️ **Client Secret should be kept confidential**

**Recommendations:**
1. **Do not sync `data.json` to public repositories**
2. **Treat your vault as sensitive data**
3. **Use disk encryption** (FileVault on macOS, BitLocker on Windows)
4. **Do not share your vault** without removing the plugin data first
5. **Revoke access** in [Google Account Settings](https://myaccount.google.com/permissions) if you suspect compromise

### 🌐 OAuth Flow Security

**Known Limitations:**

1. **No CSRF Protection**: The OAuth callback does not use a `state` parameter
   - **Impact**: Potential CSRF attacks during authentication flow
   - **Mitigation**: Only authenticate when you initiate it, never click OAuth links from untrusted sources

2. **XSS in Error Messages**: OAuth error messages are displayed without sanitization
   - **Impact**: Malicious OAuth providers could inject JavaScript
   - **Mitigation**: Only use official Google OAuth (never modify Client ID to point elsewhere)

3. **Hardcoded Port**: OAuth callback uses fixed port 8080
   - **Impact**: Port conflicts if 8080 is already in use
   - **Mitigation**: Close applications using port 8080 before authenticating

### 📝 Calendar Data Handling

**What Gets Inserted:**
- Event titles, times, locations, and descriptions are inserted as-is into your notes
- No sanitization is performed on calendar event data

**Potential Issues:**
- Calendar events could contain markdown syntax that affects note rendering
- Special characters in event titles/descriptions are preserved

**This is intentional** - the plugin treats calendar data as trusted content you control.

### 🔐 Permissions

**What the Plugin Can Access:**
- ✅ Read-only access to your Google Calendar (`calendar.readonly` scope)
- ✅ Local file system (your Obsidian vault)
- ✅ Network access to Google APIs

**What the Plugin Cannot Do:**
- ❌ Modify or delete calendar events
- ❌ Access other Google services (Gmail, Drive, etc.)
- ❌ Access calendars you don't own (unless shared with you)
- ❌ Send data to third-party servers (direct Google API connection only)

### 🛡️ Best Practices

1. **Create a dedicated OAuth client** for this plugin (don't reuse credentials)
2. **Keep the plugin updated** to receive security fixes
3. **Review your Google Account permissions** periodically
4. **Use Google's "Test User" mode** to limit who can authenticate
5. **Enable 2FA** on your Google Account
6. **Monitor your Google Calendar activity** for suspicious access

### 🚨 If You Suspect a Security Issue

**For Security Vulnerabilities:**
1. **Do NOT open a public GitHub issue**
2. Email security concerns to: [Your Contact Email - Add This]
3. Include: Description, steps to reproduce, potential impact

**For Token Compromise:**
1. Immediately revoke access: https://myaccount.google.com/permissions
2. Delete `data.json` from plugin folder
3. Re-authenticate with new OAuth credentials

## Reporting a Vulnerability

This is a community plugin provided as-is. While I make reasonable efforts to maintain security:

- ⚠️ **No security guarantees are provided**
- ⚠️ **Use at your own risk**
- ⚠️ **Response time for security issues is not guaranteed**

If you discover a security vulnerability:
1. Email details to [Add Contact Email]
2. Allow reasonable time for fixes before public disclosure
3. Avoid exploiting the vulnerability beyond proof-of-concept

## Known Security Limitations

### High Priority (Should Be Fixed)
1. **Missing CSRF protection** in OAuth flow (state parameter)
2. **XSS vulnerability** in OAuth error display

### Medium Priority (User Can Mitigate)
1. Plain text token storage (Obsidian limitation - all plugins store data this way)
2. Hardcoded OAuth callback port (8080)

### Low Priority (By Design)
1. No sanitization of calendar event content (user controls their own calendar data)
2. Desktop-only plugin (Electron security context)

## Security Update Policy

- Security fixes will be prioritized when reported
- Updates will be released as new versions on GitHub
- No automatic update mechanism exists (Obsidian handles plugin updates)

## Third-Party Dependencies

This plugin relies on:
- `googleapis` - Official Google APIs Node.js client
- `google-auth-library` - Official Google authentication library
- `obsidian` - Obsidian API (provided by Obsidian app)

**Dependency Security:**
- Dependencies are locked in `package-lock.json`
- Review `npm audit` output before installing
- Dependencies are bundled in `main.js` (no runtime fetching)

## Disclaimer

This plugin is provided "as-is" without warranty of any kind. The author assumes no responsibility for:
- Data loss or corruption
- Security breaches or token compromise
- Calendar data exposure
- Any damages resulting from plugin use

**By using this plugin, you accept these risks.**

---

*Last Updated: 2026-01-02*
