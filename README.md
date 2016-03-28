# Parse Server on managed Azure services app

This is the app that is deployed by the 'Parse Server on managed Azure services' package in the Azure marketplace.

In order to speed deployment (and deal with kerberos native module), it uses prepackaged node_modules.  Steps are as follows:
  1. install node@4.3.0, npm@3.7.3
  2. run package.ps1
    * installs production modules
    * cleans the modules of unnecessary files / folders
    * packs node_modules into node_modules.zip
  3. commit
  
On the deployment side, a custom deployment script (deploy.cmd) is used:
  1. unpacks node_modules.zip at site wwwroot
  2. runs npm install --production to ensure that all necessary packages are on the web app
  3. deletes .deployment file so that the custom deploy.cmd command is not run on future deployments


