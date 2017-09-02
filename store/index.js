const kebabCase = require("lodash/kebabCase")
const shortid = require('shortid');

module.exports = async function(options){

  const {multiprocessStore, multiprocessStorePlugin} = await require(__dirname + '/default/index.js')(options);

  const store = new Vuex.Store({

    plugins: [multiprocessStorePlugin],

    state: {
      local: {

        display: {
          account: false,
          mailbox: false,
          smartbox: false,
          messages: false,
          message: false,
        },

        more: {
          account: false,
          mailbox: false,
          smartbox: false,
          messages: false,
          message: false,
        },

        selected: {
          account: null,
          mailbox: null,
          smartbox: null,
          messages: null,
          message: null,
        },

      },

      primary: {}

    },


    getters: {

      byType: (state, getters) => (type) => {
        return Object
          .keys(state.primary)
          .map(key => state.primary[key])
          .filter(record => (!(!!record.deleted)))
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

      select(state, {type, id}) {
        Vue.set(state.local.selected, type, id);
      },

      deselect(state, things) {
        things.forEach(type => Vue.set(state.local.selected, type, null))
      },

      update(state, {name, id, data}) {

        if (state[name]) {
          // db exists
        } else {
          Vue.set(state, name, {});
        }


        if (state[name][id]) {
          state[name][id] = data;
        } else {
          Vue.set(state[name], id, data);
        }


      },

    },

    actions: {

      async adduser({commit, state}, {name, address}) {

        await multiprocessStore.upsertObject({
          _id: kebabCase(address),
          type: 'account',
          name,
          address
        });

        await multiprocessStore.upsertObject({
          _id: kebabCase(address + '-inbox'),
          pid: kebabCase(address),
          type: 'mailbox',
          name: 'Inbox',
          description: `Inbox for ${address}`
        });

        await multiprocessStore.upsertObject({
          _id: kebabCase(address + '-inbox-hello'),
          pid: kebabCase(address + '-inbox'),
          type: "message",
          from: "administrator@local",
          name: "Welcome",
          deleted: false,
          text: `Welcome to the system ${address}`,
        });

      },

      async deluser({commit, state}, {id}) {
        let existingData = await multiprocessStore.getObject(id);
        await multiprocessStore.updateObject(Object.assign(existingData, {
          deleted: true
        }));
      },


      async addbox({commit, state}, {name, pid}) {

        const {address} = await multiprocessStore.getObject(pid);

        await multiprocessStore.upsertObject({
          _id: kebabCase(pid + '-' + name),
          pid,
          type: 'mailbox',
          name,
          description: `${name} for ${address}`
        });

        await multiprocessStore.upsertObject({
          _id: kebabCase(pid + '-' + name + '-hello'),
          pid: kebabCase(pid + '-' + name),
          type: "message",
          from: "administrator@local",
          name: "Welcome",
          deleted: false,
          text: `Hey ${address}, we just created your new box.`,
        });

      },


      async sendmail({ commit, state }, { from, address, box, name, text, component }) {

        const account = this.getters.byType('account').filter(account => account.address === address);
        const userPid = (account[0]||{})._id;

        const inbox =  this.getters.byType('mailbox').filter(mailbox => mailbox.pid === userPid).filter(mailbox => mailbox.name === 'Inbox');
        const inboxPid = (inbox[0]||{})._id;

        await multiprocessStore.upsertObject({
          _id: kebabCase(account._id + '-' + 'message') + '-' + shortid.generate() ,
          pid: inboxPid,
          type: "message",

          from,
          name,
          tags: box.split(",").map(i=>i.trim()),
          deleted: false,
          text,
          component,
        });

        //
        // if(!mailbox){
        //
        // }
        //
        // {
        //   "_id": "alice-aol-com-inbox",
        //   "pid": "alice-aol-com",
        //   "type": "mailbox",
        //   "name": "Inbox",
        //   "description": "Inbox for alice@aol.com"
        // }


      },

      async poke({commit, state}, {name, id, data}) {
        let existingData = await multiprocessStore.getObject(id);
        await multiprocessStore.updateObject(Object.assign(existingData, data));
        let updatedData = await multiprocessStore.getObject(id);
        store.commit('update', {
          name,
          id,
          data: updatedData
        });

      },

    }

  });


return store;
}
