# waffle proxy 🧇

Hey there! Welcome to our proxy service that makes managing multiple waffle applications a breeze. This bad boy helps route traffic between different parts of our ecosystem while keeping everything smooth and secure.

## What's This All About?

This is a Cloudflare Worker that acts as a reverse proxy for various waffle applications. It handles routing, caching, and security so you can focus on building awesome features instead of worrying about infrastructure.

## Features

Look at all the cool stuff this proxy can do:

- Smart routing between different waffle applications
- Built-in caching for better performance
- Automatic HTML content modification for seamless integration
- CORS support out of the box
- Security headers and sanitization
- Asset optimization with custom cache controls

## Getting Started

### Prerequisites

Before diving in, make sure you have:

- Node.js installed (latest LTS version recommended)
- A Cloudflare account (you'll need this for Workers)
- Wrangler CLI installed (`npm install -g wrangler`)

### Installation

1. Clone this repo and get into it:
```bash
git clone [your-repo-url]
cd waffle-proxy
```

2. Install the dependencies:
```bash
npm install
```

3. Set up your environment:
```bash
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml with your configuration
```

### Development

Start the development server:
```bash
npm run dev
```

Deploy to production:
```bash
npm run deploy
```

## Configuration

### Proxy Routes

The proxy routes are defined in `src/proxyConfig.ts`. Here's how they work:

```typescript
export const proxyRoutes = [
  {
    path: '/marketing',
    target: 'https://dash.testeswaffle.org',
    cacheControl: 'public, max-age=3600'
  }
  // Add more routes as needed
];
```

### Environment Variables

Key configurations you'll need in your `wrangler.toml`:

- `HOME_SERVER`: Your main application server
- `ALLOWED_ORIGINS`: (Optional) List of allowed CORS origins
- `CACHE_TTL`: (Optional) Default cache duration in seconds

## Architecture

This proxy is built with:

- TypeScript for type safety and better developer experience
- Cloudflare Workers for edge computing capabilities
- Hono as the lightweight web framework

## Contributing

Found a bug? Want to add a feature? We'd love your help! Here's how you can contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

We take security seriously. The proxy includes:

- Header sanitization
- URL validation
- Content security policies
- Automatic HTTPS enforcement

## Need Help?

Having trouble? Here's how to get help:

- Check the issues on GitHub
- Reach out to the team on Slack
- Send us an email at geraldo.mazzini@waffle.com.br

## License

This project is licensed under the ISC License. See the LICENSE file for details.

---

Made with ❤️ by the waffle team
