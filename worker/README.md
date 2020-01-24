# Server-Tester-Worker

### Node.js Backend using Bull to fetch jobs from an Redis DB.

Jobs are executed via Puppeteer creating screenshots from analytic websites such as ssllabs or securityheaders to a provided website url.
Jobs are pushed to Redis DB via Server-Tester REST API.

## Routes

- /health
- /report
