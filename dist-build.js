'use strict';

var browserify = require('browserify');
var fs = require('fs-extra');
var path = require('path');
var startswith = require('lodash.startswith');

var outputFile = fs.createOutputStream('dist/dist.js');

browserify()
    .add('src/index.js')
    .transform(require('browserify-css'), {
        rootDir: 'src',
        processRelativeUrl: function(relativeUrl) {

            var stripQueryStringAndHashFromPath = function(url) {
                return url.split('?')[0].split('#')[0];
            };
            var rootDir = path.resolve(process.cwd(), 'dist');
            var relativePath = stripQueryStringAndHashFromPath(relativeUrl);
            var queryStringAndHash = relativeUrl.substring(relativePath.length);

            // Copying files from '../node_modules/*/' to 'dist/vendor/*/'
            var prefix = '../node_modules/';
            if (startswith(relativePath, prefix)) {
                var vendorPath = 'vendor/' + relativePath.substring(prefix.length);
                var source = path.join(rootDir, relativePath);
                var target = path.join(rootDir, vendorPath);

                console.log('Copying file from ' + JSON.stringify(source) + ' to ' + JSON.stringify(target));
                fs.copySync(source, target);

                // Returns a new path string with original query string and hash fragments
                return vendorPath + queryStringAndHash;
            } else {
                // Need to remove the .. from assets as we want to package up in subdirectory relative to the dist.js
                var localPath = relativePath.substring('../'.length);
                console.log('Converting to local path ' + localPath);
                return localPath;
            }

        }
    })
    .transform(require('babelify'))
    .transform(require('uglifyify'))
    .bundle().pipe(outputFile);

// Now copy assets into dist
fs.copySync('assets', 'dist/assets');


