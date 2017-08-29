// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const pkg = require(__dirname + '/package.json')
const fs = require('fs');
const path = require('path');

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter();
$(function(){ $('title').text(pkg.productName||pkg.name); });

const objectStore = require('multiprocess-store');
const chokidar = require('chokidar');
const kebabCase = require("lodash/kebabCase")

async function main(options){








let storePath = path.resolve(options.primaryStore);
const multiprocessStore = await objectStore.createStore(storePath);
window.multiprocessStore = multiprocessStore;

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


  const store = new Vuex.Store({

    plugins: [multiprocessStorePlugin],

    state: {
      local: {
        selected: {},
      },

      primary:{}

    },


    getters: {

      byType: (state, getters) => (type) => {
        return Object
        .keys(state.primary)
        .map(key=>state.primary[key])
        .filter(record => ( !(!!record.deleted)) )
        .filter(record => record.type === type)
      },

      userAccount: (state, getters) => (id) => {
        return getters.byType('account')
          .filter(account => account.id === id)[0];
       },

      userAccountList: state => {
        return state.accounts
          .filter(record => record.type === 'account')
          .filter(account => account.enabled)
      },

    },

    mutations: {

      select (state, {type, id}) {
        Vue.set(state.local.selected, type, id);
      },

      deselect (state, things) {
        things.forEach(type => Vue.set(state.local.selected, type, null))
      },

      update (state, {name, id, data}) {

        if(state[name]){
          // db exists
        }else{
          Vue.set(state, name, {});
        }


        if(state[name][id]){
          state[name][id] = data;
        }else{
          Vue.set(state[name], id, data);
        }


      },

    },

    actions: {

      async adduser ({ commit, state }, { name, address }) {

        await multiprocessStore.upsertObject({
          _id: kebabCase(address),
          type: 'account',
          name,
          address
        });

        await multiprocessStore.upsertObject({
          _id: kebabCase(address+'-inbox'),
          pid: kebabCase(address),
          type: 'mailbox',
          name: 'Inbox',
          description: `Inbox for ${address}`
        });

        await multiprocessStore.upsertObject({
          _id: kebabCase(address+'-inbox-hello'),
          pid: kebabCase(address+'-inbox'),
          type: "message",
          from: "administrator@local",
          name: "Welcome",
          deleted: false,
          text: `Welcome to the system ${address}`,
        });

      },

      async deluser ({ commit, state }, {id}) {
        let existingData = await multiprocessStore.getObject(id);
        await multiprocessStore.updateObject( Object.assign(existingData, {deleted:true}) );
      },


      async addbox ({ commit, state }, { name, pid }) {

        const {address} = await multiprocessStore.getObject(pid);

        await multiprocessStore.upsertObject({
          _id: kebabCase(pid+'-'+name),
          pid,
          type: 'mailbox',
          name,
          description: `${name} for ${address}`
        });

        await multiprocessStore.upsertObject({
          _id: kebabCase(pid+'-'+name+'-hello'),
          pid: kebabCase(pid+'-'+name),
          type: "message",
          from: "administrator@local",
          name: "Welcome",
          deleted: false,
          text: `Hey ${address}, we just created your new box.`,
        });

      },


      async poke ({ commit, state }, {name, id, data}) {
        let existingData = await multiprocessStore.getObject(id);
        await multiprocessStore.updateObject( Object.assign(existingData, data) );
        let updatedData = await multiprocessStore.getObject(id);
        store.commit('update', {name, id, data:updatedData});

      },

    }

  });




  Vue.directive('init', {
    bind: function (el,bi) {
      // placeholder function to evale the v-setup
    }
  })

  Vue.directive('setup', {
    bind: function (el,bi) {
      // placeholder function to evale the v-setup
      el.value = bi.value;
    }
  })


  //
  //
  // const app = new Vue({
  //   el: '#app',
  //   // provide the store using the "store" option.
  //   // this will inject the store instance to all child components.
  //   store,
  //
  //   methods: {
  //     poke: function (event) {
  //       store.dispatch('poke', {name:options.primaryStore, id:'foo', data:{hello:'barf'}});
  //     },
  //   },
  //   computed: {
  //
  //     dump () {
  //       return JSON.stringify(this.$store.state, null, '  ');
  //     },
  //
  //     primary () {
  //       return this.$store.state.primary
  //     },
  //
  //     accounts () {
  //       return this.$store.getters.byType('account');
  //     },
  //
  //   },
  //
  //   template: `
  //     <div class="app">
  //
  //     <button v-on:click="poke">poke foo</button>
  //
  //     <hr>
  //
  //     <pre>
  //     {{dump}}
  //     </pre>
  //
  //       <ul id="example-1">
  //         <li v-for="item in primary">
  //           id: {{ JSON.stringify( item ) }}
  //         </li>
  //       </ul>
  //
  //       <hr>
  //
  //       <ul id="example-2">
  //         <li v-for="item in accounts">
  //           id: {{ JSON.stringify( item ) }}
  //         </li>
  //       </ul>
  //
  //
  //     </div>
  //   `
  // })
  //
  //
  //









    const appAccounts = new Vue({
      el: '#app-accounts',
      // provide the store using the "store" option.
      // this will inject the store instance to all child components.
      store,

      methods: {

        isActive (account) {
          return ( this.$store.state.local.selected.account === account._id)?"active":"";
        },

        selectAccount (account) {
          store.commit('deselect', ['mailbox', 'messages', 'message']);
          store.commit('select', {type:'account', id:account._id});
        },
      },

      computed: {

        accounts () {
          return this.$store.getters.byType('account');
        },

      },

      template: `
        <div class="app-accounts mb-3">
          <div class="card">

            <div class="card-header">
              Accounts
            </div>

            <ul class="list-group list-group-flush">
              <li v-for="account in accounts" class="list-group-item p-0" v-bind:class="isActive(account)">
              <div v-on:click="selectAccount(account)" class="p-3">
              <h6>{{account.name}}</h6>
              <small>{{account.address}}</small>
              </div>
              </li>
            </ul>

          </div>
        </div>
      `
    });


    const appMailboxes = new Vue({
      el: '#app-mailboxes',
      // provide the store using the "store" option.
      // this will inject the store instance to all child components.
      store,

      methods: {

        isActive (mailbox) {

          return ( this.$store.state.local.selected.mailbox === mailbox._id)?"active":"";
        },

        // init () {
        //   console.log('INIT',this.mailboxes.length)
        //   if(this.mailboxes.length > 0){
        //     this.selectMailbox(this.mailboxes[0])
        //   }
      //  },

        selectMailbox (mailbox) {
          store.commit('deselect', ['messages', 'message']);
          store.commit('select', {type:'mailbox', id:mailbox._id});
        },
      },

      computed: {

        mailboxes () {
          return this.$store.getters.byType('mailbox').filter(mailbox=>mailbox.pid === this.$store.state.local.selected.account);
        },

      },

      template: `
        <div class="app-mailboxes mb-3">

          <div v-if="mailboxes" class="card">
            <ul class="list-group list-group-flush">
              <li v-for="mailbox in mailboxes" class="list-group-item" v-bind:class="isActive(mailbox)">

              <div v-on:click="selectMailbox(mailbox)" class="p-3">
              <h5>{{mailbox.name}}</h5>
              <small>{{mailbox.description}}</small>
              </div>

              </li>
            </ul>
          </div>
        </div>
      `
    });


    const appMessages = new Vue({
      el: '#app-messages',
      // provide the store using the "store" option.
      // this will inject the store instance to all child components.
      store,

      methods: {

        isActive (message) {

          return ( this.$store.state.local.selected.message === message._id)?"active":"";
        },

        selectMessage (message) {
          store.commit('select', {type:'message', id:message._id});
        },

      },

      computed: {

        messages () {
          return this.$store.getters.byType('message').filter(message=>message.pid === this.$store.state.local.selected.mailbox);
        },

      },

      template: `
        <div class="app-messages mb-3">

          <div v-if="messages" class="card">
            <ul class="list-group list-group-flush">
              <li v-for="message in messages" class="list-group-item" v-bind:class="isActive(message)">

              <div v-on:click="selectMessage(message)" class="p-3">
              <h6>{{message.name}}</h6>
              <small>{{message.text}}</small>
              </div>

              </li>
            </ul>
          </div>

        </div>
      `
    });



    const appMessage = new Vue({
      el: '#app-message',
      // provide the store using the "store" option.
      // this will inject the store instance to all child components.
      store,

      components: {

        'terminal': require('./message-components/terminal/index.js'),

        'adduser': require('./message-components/adduser/index.js'),
        'deluser': require('./message-components/deluser/index.js'),

        'addbox': require('./message-components/addbox/index.js'),

      },

      data: {
        form:{

        }
      },

      methods: {

        negative (message) {

        },

        positive (message) {

        },

        selectMessage (message) {
          store.commit('select', {type:'message', id:message._id});
        },
      },

      computed: {

        message () {
          return this.$store.getters.byType('message').filter(message=>message._id === this.$store.state.local.selected.message)[0];
        },

      },

      template: `
        <div class="app-message mb-3">

          <div v-if="message" class="card">
            <div class="card-body">
              <h5 class="card-title">{{message.name}}</h5>
              <h6 class="card-subtitle mb-2 text-muted mb-3"><small>from:</small> {{message.from}}</h6>
              <p class="card-text">{{message.text}}</p>
            </div>

            <div v-if="message.negative||message.positive" class="card-body">
            <hr>
            <a href="#" v-if="message.negative" v-on:click="negative(message)" class="btn btn-danger"><i class="fa fa-times fa-2x"></i></a>
            <a href="#" v-if="message.positive" v-on:click="positive(message)" class="btn btn-success float-right"><i class="fa fa-check fa-2x"></i></a>
            </div>

            <div v-if="message.component" class="card-body">
            <terminal v-if="message.component === 'terminal'"></terminal>
            <adduser v-if="message.component === 'adduser'"></adduser>
            <deluser v-if="message.component === 'deluser'"></deluser>
            <addbox v-if="message.component === 'addbox'"></addbox>
            </div>



          </div>

        </div>
      `
    });

} // main // /////////////////////////////////////////////////////////////////

main({
  // name of primary store
  primaryStore: 'primary',
});
