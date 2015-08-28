# NPM OTA Updater
This tiny script handles the over-the-air update in case you run node.js software in embedded linux system (such as raspberry pi). It takes advantage of NPM capability to install npm module from github (private or public repo) so the setup is super easy and don't require your own back-end server to function. All you have to do is host your node software in a github repo and create a package.json for use.

## Getting Started
1. Start from a fresh new directory then run the command below.
```
git clone https://github.com/heartnetkung/npm-ota-update.git
sudo npm install
```
2. create a `config.json` file in this directory with the following content. To get your token follow this [tutorial.](https://help.github.com/articles/creating-an-access-token-for-command-line-use/)
```
{
    "token":"<TOKEN>", 
    "package_url":"https://api.github.com/repos/<github-user>/<github-repo>/contents/package.json?ref=master",
    "npm_install_url":"git+https://<token>:x-oauth-basic@github.com/<github-user>/<github-repo>.git",
    "main":"app.js"
}
```
3. run the run.sh using 
```
./run.sh
```
After this step, your code will be downloaded from github and run in this machine. Later on you can run this script instead of your program and it will automatically update your software for you everytime the program starts by comparing the current version with the package.json file in your github repo.

## Example

