const path = require('path');

const objectStore = require('multiprocess-store');
const chokidar = require('chokidar');

module.exports = async function(options){
let storePath = path.resolve(options.primaryLocation);
const multiprocessStore = await objectStore.createStore(storePath);
const multiprocessStorePlugin = function(store){



  var watcher = chokidar.watch(storePath, {
    depth: 1,
    ignoreInitial: true,
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  var log = console.log.bind(console);
  // Add event listeners.
  watcher
    .on('add', path => log(`add: File ${path} has been added`))
    .on('change', path => log(`change: File ${path} has been changed`))
    .on('unlink', path => log(`unlink: File ${path} has been removed`));

  // More possible events.
  watcher
    .on('change', location => {
      let relatives = path.relative(storePath, location).split(path.sep).filter(i=>i);
      if(relatives.length === 2){
        console.info(`Record Update, "${relatives[0]}" has been updated.`,relatives)

        multiprocessStore.getObject(relatives[0]).then(data => {
          console.info(`Record Data`,data)

          store.commit('update', {name:options.primaryStore, id:relatives[0], data});

        });
      }
    })
    .on('add', location => {
      let relatives = path.relative(storePath, location).split(path.sep).filter(i=>i);
      if(relatives.length === 2){
        console.info(`Record Update, "${relatives[0]}" has been updated.`,relatives)

        multiprocessStore.getObject(relatives[0]).then(data => {
          console.info(`Record Data`,data)

          store.commit('update', {name:options.primaryStore, id:relatives[0], data});

        });
      }
    })
    .on('addDir', location => {

      console.log(`addDir: Directory ${location} has been added`)
      //console.log('RELATIVE', path.relative(storePath, location))
      //console.log('BASENAME', path.basename( location))

      let relatives = path.relative(storePath, location).split(path.sep).filter(i=>i);

      //if(path.relative(storePath, location) && (path.relative(storePath, location) === path.basename(location))){
      if(relatives.length === 1){
        console.info(`New Record "${relatives[0]}" has been created.`, relatives)
      }

    })
    .on('unlinkDir', path => log(`unlinkDir: Directory ${path} has been removed`))
    .on('error', error => log(`error: Watcher error: ${error}`))
    .on('ready', () => {

      multiprocessStore.getAllObjects().then(list => {

        list.forEach(data => store.commit('update', {name:options.primaryStore, id:data._id, data}) )


      });

    })
    .on('raw', (event, path, details) => {
      log('raw: Raw event info:', event, path, details);
    });


    // socket.on('data', data => {
    //   store.commit('receiveData', data)
    // })

    store.subscribe((mutation, state) => {

      /// console.log(`vuex: store mutation of type [${mutation.type}]`, mutation.payload, state);

      if (mutation.type === 'UPDATE_DATA') {
        //socket.emit('update', mutation.payload)
      }

    });

  };




return {objectStore, storePath, multiprocessStore, multiprocessStorePlugin};

}
