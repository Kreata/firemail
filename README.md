# E-mail modules for FirefoxOS

*SMTP client currently only, but that's something as well*

## Running the tests

**Step 1**

Install and run the testserver (running on port 1025, so make sure this port is available) with `npm`:

```bash
cd test/smtp-server
npm install
npm start
```

NB! Since self signed certificates are not allowed, only unsecure connections are tested against this test server. For secure connection tests external server (smtp.gmail.com) is used.

**Step 2**

Install the application to the FirefoxOS simulator (use the manifest file in the root directory)

**Step 3**

Open the application in the simulator. The launch page is a [nodeunit](https://github.com/caolan/nodeunit) testrunner.

## SMTPClient

### Quirks

  * `STARTTLS` is currently not supported
  * Only `PLAIN` and `USER` authentication mechanisms are supported

## License

**MIT**