const gulp = require('gulp');
const Network = require('composer-cli').Network;
const Archive = require('composer-cli').Archive;

var spawn = require('child_process').spawn;



let archiveFile = './dist/sample-network.bna';

gulp.task('default',['watch']);



// watch thr network for changes and update network
gulp.task('watch', () => {
  gulp.watch('./packages/sample-network/**/*.cto', ['create-bna','update-network']);
  gulp.watch('./packages/sample-network/**/*.js', ['create-bna','update-network']);
  gulp.watch('./packages/sample-network/**/*.acl', ['create-bna','update-network']);
});

// create the archive file
gulp.task('create-bna' , () => {
  let args = {archiveFile: archiveFile,
              sourceType: 'dir',
              sourceName: './packages/sample-network'};
  return Archive.Create(args);

} );

// update the network
gulp.task('update-network', () => {
  let args = {enrollId: 'admin'
             ,enrollSecret: 'adminpw'
             ,archiveFile: archiveFile
             ,connectionProfileName: 'hlfv1'};

   return Network.Update(args);
});

// deploy the network first time
gulp.task('deploy', ['create-bna','start'],() => {
  let args = {enrollId: 'admin'
             ,enrollSecret: 'adminpw'
             ,archiveFile: archiveFile
             ,connectionProfileName: 'hlfv1'};

   return Network.Deploy(args);
});

gulp.task('start', ['teardown'],(cb) => {
  var ls = spawn('./scripts/fabric-tools/startFabric.sh', {stdio: 'inherit'});

  ls.on('close',  (code) => {
      console.log('child process exited with code ' + code);
      cb();
  });
}
);

gulp.task('teardown', (cb) => {
  var ls = spawn('./scripts/fabric-tools/teardownFabric.sh', {stdio: 'inherit'});

  ls.on('close',  (code) => {
      console.log('child process exited with code ' + code);
      cb();
  });
}
);
