# Parse Server on Managed Azure Services

Your parse server is running at `https://<yoursite>.azurewebsites.net/parse`.

Your parse dashboard is running at `https://<yoursite>.azurewebsites.net/parse-dashboard`
  * username: `<appId>`
  * password: `<masterKey>`

### Developing Remotely

Use Visual Studio Online, a free web app site extension, to modify your deployed site code at `https://<yoursite>.scm.azurewebsites.net/dev`.  You may need to install VSO onto your web app via tools->Visual Studio Online. Filewatching is enabled by default, so any changes that you make to your javascript/configuration files will automatically trigger a site restart to pick up the changes.  Be careful if you deploy to the site as your remote changes may be overwritten!

### Developing Locally

You can easily interact with the deployed parse server code via git.  Clone the web app repository locally with `git clone https://<yoursite>.scm.azurewebsites.net/<yoursite>.git`.  Pushing to the remote repository will automatically trigger a deployment.  Be careful not to overwrite changes that you have made remotely with a git deployment!

If you want to setup specific configuration for your app, add it to `config.js` or `local.js`.  `local.js` changes will be ignored from git, so it's a good placed to add secrets while developing locally.

### Updating Dependencies

If you want to upgrade to a newer version of parse-server, parse-dashboard, or other modules, you can run `npm install <package>@<version>` from [kudu console](https://blogs.msdn.microsoft.com/benjaminperkins/2014/03/24/using-kudu-with-windows-azure-web-sites/).  We recommend testing these upgrades on a development instance or locally before modifying your production site.  If you want to move to the next major version of parse-server or parse-dashboard you'll need to modify your site package.json, as `^major.minor.patch` versioning only allows installing a package of the same major version.

To change the version of node or npm used on the web app, modify the `engines` property in package.json.

### Troubleshooting

Logging specific parse-server configuration:
* Verbose parse-server logging: `verbose: 'true'`
* Database driver logging (very verbose!): add `require('mongodb-core/lib/connection/logger')('dummy', { loggerLevel: 'debug' });` before you initialize parse server

To see your logs, check:
* The Logs tab of the parse dashboard
* Web App [diagnostic logging](https://azure.microsoft.com/en-us/documentation/articles/web-sites-enable-diagnostic-log/)

Useful tools:
* F12 developer tools (are the requests to parse server from the dashboard failing?)
* Postman / Fiddler (execute rest calls against parse server / intercept traffic)
* node-inspector (debug your app locally or [remotely](https://blogs.msdn.microsoft.com/waws/2016/04/07/debug-node-js-azure-mobile-apps-with-node-inspector/))

######Parse Dashboard Issues
The parse dashboard used to be located in a site extension with route `https://<yoursite>.scm.azurewebsites.net/parse-dashboard`.
It is now an express app running on the main web site at route `https://<yoursite>.azurewebsites.net/parse-dashboard`.  A username (appId) and password (masterKey) are required.
The dashboard can take a long time to load due to cold starts.

######Push Issues
The notification hub needs to be at least basic tier in order to send push notifications.

######DocDB
There have been known issues with the DocumentDB dropping mongo connections. A server restart will typically fix the problem.  We are working to resolve the problem.

### Useful Links
* App Links
  * Parse Server: `https://<yoursite>.azurewebsites.net/parse`
  * Parse Dashboard: `https://<appId>:<masterKey>@<yoursite>.azurewebsites.net/parse-dashboard`
  * Online Code Editor: `https://<yoursite>.scm.azurewebsites.net/dev`
  * Web App Git Repository: `https://<yoursite>.scm.azurewebsites.net/<yoursite>.git`
* Azure Documentation
  * [Parse Server on Managed Azure Services](https://azure.microsoft.com/en-us/marketplace/partners/microsoft/parseserver/)
  * [Blog Post](https://azure.microsoft.com/en-us/blog/announcing-the-publication-of-parse-server-with-azure-managed-services/)
* Github Repositories
  * [parse-server](https://github.com/ParsePlatform/parse-server)
  * [parse-dashboard](https://github.com/ParsePlatform/parse-dashboard)
  * [parse-server-azure-storage](https://github.com/felixrieseberg/parse-server-azure-storage)
  * [parse-server-azure-push](https://github.com/mamaso/parse-server-azure-push)
  * [parse-server-azure-config](https://github.com/mamaso/parse-server-azure-config)
  * [Deployed app](https://github.com/Azure/parse-server-example)
* Azure Infrastructure
  * [Web Apps](https://azure.microsoft.com/en-us/documentation/services/app-service/web/)
  * [DocumentDB](https://azure.microsoft.com/en-us/documentation/services/documentdb/)
  * [Storage](https://azure.microsoft.com/en-us/documentation/services/storage/)
  * [Notification Hubs](https://azure.microsoft.com/en-us/documentation/services/notification-hubs/)
