# E-mail modules for FirefoxOS

*well, currenlty only SMTP client, but that's something as well*

## Running the tests

**Step 1**

Install and run the testserver (running on port 1025) with `npm`:

```bash
cd test/smtp-server
npm install
npm start
```

**Step 2**

Install the application to the FirefoxOS simulator (use the manifest file in the root directory)

**Step 3**

Open the application in the simulator. The launch page is a [nodeunit](https://github.com/caolan/nodeunit) testrunner.

## License

**MIT**