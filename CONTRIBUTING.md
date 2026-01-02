# Contributing to Google Calendar Static

Thank you for your interest in contributing to this Obsidian plugin!

## Issues Policy

### Submitting Issues

You are welcome to submit issues on GitHub for:
- 🐛 Bug reports
- 💡 Feature requests
- 📖 Documentation improvements
- ❓ Questions about usage

**⚠️ IMPORTANT: This is a use-at-your-risk project**

- I make **no guarantees** about fixing any issues
- Response time is **not guaranteed**
- Some issues may remain open indefinitely
- The plugin is provided **as-is** without warranty

### Before Submitting an Issue

**For Bugs:**
1. Check existing issues to avoid duplicates
2. Verify you're using the latest version
3. Reproduce the bug with minimal steps
4. Include:
   - Obsidian version
   - Plugin version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)

**For Feature Requests:**
1. Search existing issues first
2. Explain the use case clearly
3. Describe why this benefits most users
4. Be understanding if the request is declined

### What NOT to Submit

- ❌ Requests for guaranteed support
- ❌ Urgent fixes (this is a hobby project)
- ❌ Issues without reproduction steps
- ❌ Security vulnerabilities (email instead - see SECURITY.md)
- ❌ Demands for features or timelines

## Pull Requests

Pull requests are welcome! However:

- ⚠️ **No guarantee of acceptance** - even quality PRs may be declined
- ⚠️ **No guarantee of review timeline** - may take weeks or months
- ⚠️ **Must match code style** - follow existing patterns
- ⚠️ **Must include explanation** - why this change is needed

### PR Guidelines

**Before Starting:**
1. Open an issue to discuss major changes first
2. Make sure the change fits the plugin's scope
3. Understand that hobby project timelines are unpredictable

**PR Requirements:**
1. Test thoroughly on your system
2. Update README if user-facing changes
3. No breaking changes to existing features
4. Follow TypeScript best practices
5. Keep changes focused and minimal

**PR Checklist:**
- [ ] Code compiles without errors (`npm run build`)
- [ ] Tested manually in Obsidian
- [ ] Updated README if needed
- [ ] Follows existing code style
- [ ] Includes clear description of changes

## Development Setup

```bash
# Clone the repository
git clone https://github.com/divydovy/obsidian-google-calendar-static.git
cd obsidian-google-calendar-static

# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build
```

### Testing Locally

1. Build the plugin: `npm run build`
2. Copy `main.js`, `manifest.json`, `styles.css` to your vault:
   ```
   /path/to/vault/.obsidian/plugins/google-calendar-static/
   ```
3. Reload Obsidian (Ctrl/Cmd + R)
4. Enable the plugin in Settings

## Code Style

- Use **TypeScript** strict mode
- Follow **existing patterns** in the codebase
- Use **meaningful variable names**
- Add **comments for complex logic**
- Keep functions **small and focused**
- Use **Obsidian API conventions**

## Project Structure

```
google-calendar-static/
├── main.ts              # Plugin entry point, commands
├── settings.ts          # Settings interface and UI
├── googleCalendar.ts    # Google Calendar API wrapper
├── oauthServer.ts       # OAuth 2.0 authentication
├── formatter.ts         # Event formatting logic
├── dateModal.ts         # Date picker modal
├── manifest.json        # Plugin metadata
└── package.json         # Dependencies
```

## Documentation

If you improve documentation:
- Keep language clear and concise
- Use examples where helpful
- Follow the existing style
- Test all instructions yourself

## Community Guidelines

- Be respectful and constructive
- Understand this is a hobby project
- Help others in discussions when you can
- Share your use cases and workflows

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- 📖 Read the [README](README.md) first
- 🔒 Security concerns? See [SECURITY.md](SECURITY.md)
- 💬 Open a GitHub issue for other questions

---

## Disclaimer

This is a personal project maintained in my spare time. I appreciate contributions and feedback, but I cannot commit to:
- Timely responses
- Implementing all suggestions
- Maintaining backward compatibility forever
- Providing support beyond what's documented

**Use at your own risk. No warranties provided.**

Thank you for understanding! 🙏
