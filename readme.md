# NPM OTA Updater
This tiny script handles the over-the-air update in case you run node.js software in embedded linux system (such as raspberry pi). It takes advantage of NPM capability to install npm module from github (private or public repo) so the setup is super easy and don't require your own back-end server to function. All you have to do is host your node software in a github repo and create a package.json for use.

## Getting Started
1) Start from a fresh new directory then run the command below.
```
git clone https://github.com/heartnetkung/npm-ota-update.git
sudo npm install
```
2) Inspect `config.json` file and change it to match your settings. If you are not sure, you can skip to step 3. The given settings will install a dummy repo. To get your token follow this [tutorial.](https://help.github.com/articles/creating-an-access-token-for-command-line-use/)
``` json
{
    "token":"<TOKEN>", 
    "package_url":"https://api.github.com/repos/<github-user>/<github-repo>/contents/package.json?ref=master",
    // for private repo
    "npm_install_url":"git+https://<token>:x-oauth-basic@github.com/<github-user>/<github-repo>.git",
    // for public repo
    "npm_install_url":"<github-user>/<github-repo>",
    "main":"app.js"
}
```
3) run the run.sh using 
```
./run.sh
```
At this step, your code will be downloaded from github and run in this machine. Later on you can run this script instead of your program and it will automatically update your software in background for you everytime the program starts. The next version will be applied next time your pragram start.

## What's Next
1) Update config.json together with the program (useful when you rename your repo)
``` json
// package.json in your github repo
{
  "name": "your-awesome-node-module",
  "author": "you <youremail@email.com>",
  "version": "1.0.5",
  "hnk_updater": {
    "token": "<TOKEN>",
    "main":"app.js"
    //anything here will replace config.json
  }
}
```
2) run `./run.sh reset` to delete all program you downloaded and start anew with what you specify in the `config.json` 



