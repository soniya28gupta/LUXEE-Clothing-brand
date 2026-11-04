const fs = require('fs');
const path = require('path');

function fixError(err) {
  if (err && (err.code === 'EISDIR' || err.code === 'EPERM')) {
    const newErr = new Error(`EINVAL: invalid argument, readlink '${err.path || ''}'`);
    newErr.code = 'EINVAL';
    newErr.errno = -4071;
    newErr.syscall = 'readlink';
    newErr.path = err.path;
    return newErr;
  }
  return err;
}

// Patch fs.readlinkSync
const origReadlinkSync = fs.readlinkSync;
fs.readlinkSync = function (p, opt) {
  try {
    return origReadlinkSync.call(fs, p, opt);
  } catch (err) {
    throw fixError(err);
  }
};

// Patch fs.readlink
const origReadlink = fs.readlink;
fs.readlink = function (p, opt, cb) {
  const callback = typeof opt === 'function' ? opt : cb;
  const options = typeof opt === 'function' ? undefined : opt;

  return origReadlink.call(fs, p, options, function (err, linkString) {
    if (err) {
      return callback(fixError(err));
    }
    return callback(null, linkString);
  });
};

// Patch fs.promises.readlink
if (fs.promises && fs.promises.readlink) {
  const origPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function (p, opt) {
    try {
      return await origPromisesReadlink.call(fs.promises, p, opt);
    } catch (err) {
      throw fixError(err);
    }
  };
}

// Windows Node 22 500.html rename ENOENT fix
function handle500Rename(oldPath, newPath) {
  if (
    typeof oldPath === 'string' &&
    typeof newPath === 'string' &&
    (oldPath.includes('500.html') || newPath.includes('500.html'))
  ) {
    try {
      fs.mkdirSync(path.dirname(newPath), { recursive: true });
      fs.writeFileSync(
        newPath,
        '<!DOCTYPE html><html><head><title>500</title></head><body>500 - Internal Server Error</body></html>',
        'utf8'
      );
      return true;
    } catch (e) {
      // ignore
    }
  }
  return false;
}

// Patch fs.promises.rename
if (fs.promises && fs.promises.rename) {
  const origPromisesRename = fs.promises.rename;
  fs.promises.rename = async function (oldPath, newPath) {
    try {
      return await origPromisesRename.call(fs.promises, oldPath, newPath);
    } catch (err) {
      if (err && err.code === 'ENOENT' && handle500Rename(oldPath, newPath)) {
        return;
      }
      throw err;
    }
  };
}

// Patch fs.rename
const origRename = fs.rename;
fs.rename = function (oldPath, newPath, cb) {
  return origRename.call(fs, oldPath, newPath, function (err) {
    if (err && err.code === 'ENOENT' && handle500Rename(oldPath, newPath)) {
      return cb(null);
    }
    return cb(err);
  });
};

// Patch fs.renameSync
const origRenameSync = fs.renameSync;
fs.renameSync = function (oldPath, newPath) {
  try {
    return origRenameSync.call(fs, oldPath, newPath);
  } catch (err) {
    if (err && err.code === 'ENOENT' && handle500Rename(oldPath, newPath)) {
      return;
    }
    throw err;
  }
};

console.log('[Node 22 Windows Fix] fs.readlink & rename 500.html patches applied');
