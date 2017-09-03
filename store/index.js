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

      getSelectedAccount: (state, getters) => () => {
        return getters.byType('account').filter(account => account._id === state.local.selected.account)[0];
      },

      getAllAccounts: (state, getters) => () => {
        return getters.byType('account');
      },

      getUserAccountByAddress: (state, getters) => (address) => {
        const list = getters.byType('account').filter(account => account.address === address);
        if( list.length > 0 ) return list[0];
        return null;
      },

      getSelectedMessage: (state, getters) => () => {
        /* message has a unique ID, no filtration needed */
        const list = getters.byType('message').filter(message => message._id === state.local.selected.message)
        if( list.length > 0 ) return list[0];
        return null;
      },

      getAccountMailboxes: (state, getters) => (accountId) => {
        return getters
        .byType('mailbox')
        .filter(mailbox => mailbox.pid === accountId)
      },

      getAccountMailboxByName: (state, getters) => (accountId, mailboxName) => {
        const list = getters.getAccountMailboxes(accountId)
        .filter(mailbox => mailbox.name === mailboxName);
        if( list.length > 0 ) return list[0];
        return null;
      },

      getSelectedAccountMailboxes: (state, getters) => () => {
        return getters.getAccountMailboxes(state.local.selected.account);
      },

      getAccountMessages: (state, getters) => (accountId) => {
        const list = [];
        getters.getAccountMailboxes(accountId).forEach(mailbox => {

          getters.byType('message')
          .filter(message => message.pid === mailbox._id)
          .forEach(message => {
            list.push(message);
          })

        })
        return list;
      },

      getMessagesForMailbox: (state, getters) => (mailboxId) => {
        const list = getters.getAccountMessages(state.local.selected.account).filter(message => message.pid === mailboxId)
        return list;
      },

      getMessagesForSelectedMailbox: (state, getters) => () => {
        const list = getters.getMessagesForMailbox(state.local.selected.mailbox);
        return list;
      },

      getMessagesForSelectedSmartbox: (state, getters) => () => {
        const list = getters.getAccountMessages(state.local.selected.account)
        .filter(message => message.tags !== undefined)
        .filter(message => message.tags.indexOf(state.local.selected.smartbox) !== -1)
        return list;
      },

      getSmartboxes: (state, getters) => () => {
        const list = [];
        getters.getAccountMessages(state.local.selected.account).forEach(message => {
          if (message.tags) message.tags.map(tag => {
            let exists = list.filter(i => i.name == tag).length;
            if (!exists) list.push({
              name: tag
            })
          })
        })
        return list;
      },

      getSmartboxMessagesForSmartbox: (state, getters) => (smartbox) => {
        const list = getters.getAccountMessages(state.local.selected.account)
        .filter(message => message.tags !== undefined)
        .filter(message => message.tags.indexOf(smartbox.name) !== -1)
        return list;
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

      async adduser({commit, state, getters}, {name, address}) {

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

      async deluser({commit, state, getters}, {id}) {
        let existingData = await multiprocessStore.getObject(id);
        await multiprocessStore.updateObject(Object.assign(existingData, { deleted: true }));
      },

      async addbox({commit, state, getters}, {name, pid}) {

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

      async sendmail({ commit, state, getters }, { from, address, box, name, text, component }) {

        console.info({ from, address, box, name, text, component })

        const account = getters.getUserAccountByAddress(address);
        if(!account) return;

        const inbox = getters.getAccountMailboxByName(account._id, 'Inbox')
        if(!inbox) return;

        const userPid = account._id;
        const inboxPid = inbox._id;

        const tags = [];

        if(box) {
          const split = box.split(",").map(i=>i.trim()).filter(i=>i);
          split.forEach(i=>tags.push(i))

        }

        await multiprocessStore.upsertObject({
          _id: kebabCase(userPid + '-' + 'message') + '-' + shortid.generate() ,
          pid: inboxPid,
          type: "message",
          from,
          name,
          tags,
          deleted: false,
          text,
          component,
        });

      },

      async delete({ commit, state, getters }, { id }) {
        await multiprocessStore.upsertObject({
          _id: id,
          deleted: true,
        });
      },

      async poke({commit, state, getters}, {name, id, data}) {
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
