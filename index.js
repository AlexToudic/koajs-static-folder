var send = require('koa-send'),
    path  = require('path'),
    fs = require('fs');

module.exports = serve;

/**
 * Serve static files from `root`.
 *
 * Traverses the specified folder and serves all underlying files. Can be used for public and asset folders.
 *
 * @param {String} root
 * @return {Function}
 * @api public
 */
function serve(root, alias){
    if(!root) throw Error('Root must be defined.');
    if(typeof root !== 'string') throw TypeError('Path must be a defined string.');
    if (typeof alias == 'undefined' || alias == null) alias = root;

    var rootStat = fs.statSync(path.join(process.cwd(), root));
    if(!rootStat.isDirectory()) throw Error('Root should be a directory.');
    
    var finalFiles = walk(root, alias, root);
    
    root = fs.realpathSync(root);
    if(!root) throw Error('Root must be a valid path.');
    
    return function* staticFolder(next){
        var file = finalFiles[this.path];
        if(!file) return yield * next;
        return yield send(this, file, {root: process.cwd()});
    }
}

function walk(root, alias, directory, finalFiles) {
    var finalFiles = finalFiles || [];
    var files = fs.readdirSync(directory);
    for(var i=0; i<files.length; i++) {
        var file = files[i];
        if(!file) continue;
        file = directory + '/' + file;
        if(fs.statSync(file).isDirectory()) {
            walk(root, alias, file, finalFiles);
        }
        else {
            finalFiles[file.replace(root, alias)] = file;
        }
    }
    return finalFiles;
}