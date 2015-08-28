var fs = require('fs'),
	npm = require('npm'),
	curl = require('curlrequest'),
	async = require('async'),
	_ = require('underscore');


var readGithubPackage = function(token, packageUrl, callback) {
	callback = callback || function() {};
	var headers = {
		'Accept': 'application/vnd.github.v3.raw'
	};
	if (token)
		headers['Authorization'] = 'token ' + token;
	curl.request({
		url: packageUrl,
		headers: headers
	}, function(err, data) {
		if (err)
			return callback(err);
		var resultJSON;
		try {
			resultJSON = JSON.parse(data);
		} catch (e) {
			return callback('cannot connect to github');
		}
		return callback(null, resultJSON);
	});
};


var versionStringToInt = function(versionString) {
	var array = versionString.split('.');
	var ans = 0;
	if (array[0])
		ans += 10000 * parseInt(array[0]);
	if (array[1])
		ans += 100 * parseInt(array[1]);
	if (array[2])
		ans += parseInt(array[2]);
	return ans;
};


var npmInstall = function(newVersion, token, npmInstallUrl, callback) {
	callback = callback || function() {};
	if (token)
		npmInstallUrl = npmInstallUrl.replace('<token>', token);
	var installDir = __dirname + '/v-' + newVersion;

	async.series([
		function(cb) {
			fs.mkdir(installDir, cb);
		},
		function(cb) {
			npm.load(function(err, npm) {
				npm.commands.install(installDir, [npmInstallUrl], function(err,
					installInfo) {
					if (err) cb(err);
					else
						cb(null, installInfo && installInfo[0]);
				});
			});
		}
	], function(err, result) {
		if (err) callback(err);
		else
			callback(null, result[1]);
	});
};


var updateShell = function(newVersion, newRunPath, callback) {
	var firstLine = ' rm -rf ';
	var secondLine = 'node updater ' + newVersion + ' &';
	var thirdLine = 'node ' + __dirname + '/' + newRunPath + '/app.js';
	var fileList = [];
	fs.readdir(__dirname, function(err, files) {
		if (err) return callback(err);
		async.each(files, function(file, eachCB) {
			if (!/^v-/.test(file))
				return eachCB();
			if (file === 'v-' + newVersion)
				return eachCB();
			if (!fs.lstatSync(__dirname + '/' + file).isDirectory())
				return eachCB();
			fileList.push(__dirname + '/' + file);
			eachCB();
		}, function(err) {
			if (err) return callback(err);
			if (fileList.length) {
				firstLine = firstLine + fileList.join(' ');
			} else {
				firstLine = '';
			}
			fs.writeFile(__dirname + '/run.sh', firstLine + '\n' + secondLine + '\n' +
				thirdLine, callback);
		});
	});
};


// main
(function() {
	if (require.main !== module)
		return;

	var config = {}, newPackage = {};
	if (!process.argv[2])
		return console.log('current version needed');
	var currentVersion = process.argv[2];
	var newFilePath = '';

	async.series([
		function(cb) {
			fs.readFile(__dirname + '/config.json', function(err, data) {
				if (err) return cb(err);
				try {
					config = JSON.parse(data);
				} catch (e) {
					return cb('config.json corrupt');
				}
				cb();
			});
		},
		function(cb) {
			console.log('hnk_updater: checking for new version');
			readGithubPackage(config.token, config.package_url, function(err, json) {
				if (err) {
					console.log('hnk_updater: connection unreachable ' + config.package_url);
					return cb(err)
				};
				newPackage = json;
				cb();
			});
		},
		function(cb) {
			console.log('hnk_updater: current version ' + currentVersion);
			console.log('hnk_updater: upstream version ' + newPackage.version);
			if (versionStringToInt(newPackage.version) <= versionStringToInt(
				currentVersion)) {
				console.log('hnk_updater: nothing to do here');
				return cb('abort: no new version');
			}
			var newConfig = _.extend({}, config, newPackage.hnk_updater);
			fs.writeFile(__dirname + '/config.json', JSON.stringify(newConfig), cb);
		},
		function(cb) {
			console.log('hnk_updater: installing new version from github');
			npmInstall(newPackage.version, config.token, config.npm_install_url,
				function(err, info) {
					newFilePath = info && info[1];
					cb.apply(null, arguments);
				});
		},
		function(cb) {
			console.log('hnk_updater: finish up installation');
			updateShell(newPackage.version, newFilePath, cb);
		}
	]);
})()
