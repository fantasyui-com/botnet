// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const pkg = require(__dirname + '/package.json')
const fs = require('fs');
const path = require('path');

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter();

$(function() {
  $('title').text(pkg.productName || pkg.name);
});


async function main(options) {

  const store = await require(__dirname + '/store/index.js')(options);


  const appAccounts = new Vue({
    el: '#app-accounts',
    store,
    methods: {

      isActive(account) {
        return (this.$store.state.local.selected.account === account._id) ? "active" : "";
      },

      selectAccount(account) {
        this.$store.commit('deselect', ['mailbox', 'smartbox', 'messages', 'message']);
        this.$store.commit('select', {
          type: 'account',
          id: account._id
        });
      },
    },

    computed: {

      accounts() {
        return this.$store.getters.byType('account');
      },

    },

    template: `
        <div class="d-none app-accounts mb-3">






          <div class="card">


            <ul class="list-group list-group-flush">
              <li v-for="account in accounts" class="list-group-item p-0" v-bind:class="isActive(account)">
              <div v-on:click="selectAccount(account)" class="p-3">
              <small>{{account.name}}</small><br>
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
    store,

    methods: {

      isActive(mailbox, active = "active", inactive = "") {
        return (this.$store.state.local.selected.mailbox === mailbox._id) ? active : inactive;
      },

      // init () {
      //   console.log('INIT',this.mailboxes.length)
      //   if(this.mailboxes.length > 0){
      //     this.selectMailbox(this.mailboxes[0])
      //   }
      //  },

      selectMailbox(mailbox) {
        this.$store.commit('deselect', ['smartbox', 'messages', 'message']);
        this.$store.commit('select', {
          type: 'mailbox',
          id: mailbox._id
        });
      },

      messageCount(mailbox) {
        //const id = this.$store.getters.byType('mailbox').filter(mailbox=>mailbox.pid === mailbox._id);

        return this.$store.getters.byType('message').filter(message => message.pid === mailbox._id).length;
      },

      logout() {
        this.$store.commit('deselect', ['account', 'mailbox', 'smartbox', 'messages', 'message']);
      },

    },

    computed: {

      selectedAccountAddress() {
        const account = (this.$store.getters.byType('account').filter(account => account._id === this.$store.state.local.selected.account)[0] || {});
        let address = account.address;
        if(address && address.length > 16){
          address = address.substr(0,15) + '...';
        }
        return address;
      },


      showMore() {
        return this.$store.state.local.more.mailboxes;
      },

      mailboxes() {
        return this.$store.getters.byType('mailbox').filter(mailbox => mailbox.pid === this.$store.state.local.selected.account);
      },




    },

    template: `
        <div class="app-mailboxes mb-3">

        <div class="mb-3 clearfix">

        <button v-on:click.prevent="logout()" type="button" class="btn btn-outline-secondary btn-sm float-left"><i class="fa fa-sign-out fa-flip-horizontal"></i></button>

        <div class="dropdown float-right">
          <button class="btn btn-outline-secondary btn-sm" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {{selectedAccountAddress}}
            <i class="fa fa-cog"></i>
          </button>

          <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
            <a class="dropdown-item" href="#"><i class="fa fa-support text-muted"></i> Support</a>
            <div class="dropdown-divider"></div>
            <a v-on:click.prevent="logout()" class="dropdown-item" href="#"><i class="fa fa-sign-out text-muted"></i> Logout</a>
          </div>
        </div>

        </div>

        <div class="mb-3">

        <hr>

        </div>


        <div v-if="showMore" class="d-none card">
          <ul class="list-group list-group-flush">
            <li v-for="mailbox in mailboxes" class="list-group-item" v-bind:class="isActive(mailbox)">

            <div v-on:click="selectMailbox(mailbox)" class="p-3">
            <h5>{{mailbox.name}} - {{messageCount(mailbox)}}</h5>
            <small>{{mailbox.description}}</small>
            </div>

            </li>
          </ul>
        </div>

        <ul v-if="!showMore" class="nav nav-pills flex-column">
          <li  v-for="mailbox in mailboxes" class="nav-item hoverable">
            <a class="nav-link" v-bind:class="isActive(mailbox)" v-on:click.prevent="selectMailbox(mailbox)" href="" v-bind:title="mailbox.description">{{mailbox.name}} <span class="badge pull-right px-2 my-1" v-bind:class="isActive(mailbox, 'badge-dark', 'badge-info')">{{messageCount(mailbox)}}</span> </a>
          </li>
        </ul>

        </div>
      `
  });

  const appSmartboxes = new Vue({
    el: '#app-smartboxes',
    store,

    methods: {

      isActive(smartbox, active = "active", inactive = "") {
        return (this.$store.state.local.selected.smartbox === smartbox.name) ? active : inactive;
      },

      selectSmartbox(smartbox) {
        this.$store.commit('deselect', ['mailbox', 'smartbox', 'messages', 'message']);
        this.$store.commit('select', {
          type: 'smartbox',
          id: smartbox.name
        });
      },

      messageCount(smartbox) {
        return this.$store.getters
          .byType('message')
          .filter(message => message.tags)
          .filter(message => message.tags.indexOf(smartbox.name) !== -1).length;
      },

    },

    computed: {
      selectedAccountAddress() {
        const account = (this.$store.getters.byType('account').filter(account => account._id === this.$store.state.local.selected.account)[0] || {});
        return account.address;
      },

      smartboxes() {
        const smartboxes = [];
        this.$store.getters.byType('mailbox').filter(mailbox => mailbox.pid === this.$store.state.local.selected.account).forEach(mailbox => {
          this.$store.getters.byType('message').filter(message => message.pid === mailbox._id).forEach(message => {
            //console.log(message)
            if (message.tags) message.tags.map(tag => {

                let exists = smartboxes.filter(i => i.name == tag).length;
                //console.log(tag, exists)
                if (!exists) smartboxes.push({
                    name: tag
                  })

              })
          })
        })
        return smartboxes;
      },

      showMore() {
        return this.$store.state.local.more.mailboxes;
      },

    },

    template: `
        <div class="app-mailboxes mb-3">

        <ul class="nav nav-pills flex-column">
          <li  v-for="smartbox in smartboxes" class="nav-item hoverable">
            <a class="nav-link" v-bind:class="isActive(smartbox)" v-on:click.prevent="selectSmartbox(smartbox)" href="" v-bind:title="smartbox.description">{{smartbox.name}} <span class="badge pull-right px-2 my-1" v-bind:class="isActive(smartbox, 'badge-dark', 'badge-info')">{{messageCount(smartbox)}}</span> </a>
          </li>
        </ul>

        </div>
      `
  });


  const appMessages = new Vue({
    el: '#app-messages',
    store,

    methods: {

      isActive(message) {

        return (this.$store.state.local.selected.message === message._id) ? "active" : "";
      },

      selectMessage(message) {
        this.$store.commit('select', {
          type: 'message',
          id: message._id
        });
      },

    },

    computed: {

      messages() {
        const response = [];

        this.$store.getters.byType('message').filter(message => message.pid === this.$store.state.local.selected.mailbox).forEach(i => response.push(i))
        this.$store.getters.byType('message').filter(message => message.tags)
          //.map(i=>{ console.log(this.$store.state.local.selected.smartbox, i.tags, i.tags.indexOf(this.$store.state.local.selected.smartbox)); return i })
          .filter(message => message.tags.indexOf(this.$store.state.local.selected.smartbox) !== -1).forEach(i => response.push(i))
        return response;

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
    store,

    components: {

      'terminal': require('./message-components/terminal/index.js'),

      'adduser': require('./message-components/adduser/index.js'),
      'deluser': require('./message-components/deluser/index.js'),

      'addbox': require('./message-components/addbox/index.js'),
      'sendmail': require('./message-components/sendmail/index.js'),

    },

    data: {
      form: {

      }
    },

    methods: {

      negative(message) {},

      positive(message) {},

      selectMessage(message) {
        this.$store.commit('select', {
          type: 'message',
          id: message._id
        });
      },
    },

    computed: {

      messageIcon() {
        return `fa fa-${this.message.icon || 'envelope-open-o'} fa-2x`;
      },
      message() {
        return this.$store.getters.byType('message').filter(message => message._id === this.$store.state.local.selected.message)[0];
      },

    },

    template: `
        <div class="app-message mb-3">

          <div v-if="message" class="card">

            <div class="card-body">

            <div class="container-fluid">
              <div class="row align-items-center">

                <div class="col-4">
                  <h4 class="text-right">
                    <span class="py-2 mb-3 d-inline-block">
                      <i v-bind:class="messageIcon"></i>
                    </span>
                  </h4>
                </div>

                <div class="col-8">
                  <h4 class="text-left py-2 mb-3">
                   {{message.name}}
                  </h4>
                </div>

              </div>
            </div>







              <h6 v-if="message.from" class="card-subtitle  pb-3 text-muted mb-3"><small>from:</small> {{message.from}}</h6>

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
            <sendmail v-if="message.component === 'sendmail'"></sendmail>
            </div>



          </div>

        </div>
      `
  });









  const appIdentity = new Vue({
    el: '#app-identity',
    store,
    data: {


      user: "alice@aol.com",

    },

    methods: {

      login() {

        const account = this.$store.getters.byType('account').filter(account => account.address === this.user)[0];
        this.$store.commit('select', {
          type: 'account',
          id: account._id
        });

      },

    },

    computed: {

      display() {
        return !(this.$store.state.local.selected.account)
      },

      showPassword() {
        const account = this.$store.getters.byType('account').filter(account => account.address === this.user);
        if ((account.length === 1) && (account.password)) {
          return true;
        }
      },

      showLoginButton() {
        const account = this.$store.getters.byType('account').filter(account => account.address === this.user);
        if ((account.length === 1) && (!account.password)) {
          return true;
        }
      },

      userHelp() {
        const account = this.$store.getters.byType('account').filter(account => account.address === this.user);

        if (account.length === 1) {
          return "";
        } else {
          if (this.user) {
            return `User "${this.user}" Not found.`
          }
        }

      },
      accounts() {
        return this.$store.getters.byType('account'); //
      },

    },

    template: `
            <div class="app-identity bg-dark" v-bind:class="{'d-none':!display}" style="padding:0; margin:0; position: fixed; top:0; left:0; right:0; bottom:0;">


            <div class="card text-white bg-dark mb-3" style="margin: 15% 30%; max-width: 30rem;">
              <div class="card-header"><i class="fa fa-terminal"></i> System Login</div>
              <div class="card-body">

                <form>

                <div class="input-group">
                <div class="input-group-btn">
                  <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fa fa-user"></i>
                  </button>
                  <div class="dropdown-menu">
                    <a v-for="account in accounts" class="dropdown-item" v-on:click="user=account.address" href="#">{{account.address}}</a>
                  </div>
                </div>

                  <input type="text" class="form-control" v-model="user" id="user" aria-label="Text input with dropdown button">


                </div>
                <small class="form-text text-muted d-inline-block mb-3 mt-2">{{userHelp}}</small>


                  <div class="form-group d-none">

                    <label for="user">User</label>
                    <input type="email" class="form-control" v-model="user" id="user" aria-describedby="emailHelp" placeholder="">
                    <small id="userHelp" class="form-text text-muted">{{userHelp}}</small>

                  </div>

                  <transition name="slide-fade">

                  <div v-if="showPassword" class="form-group">
                    <label for="exampleInputPassword1">Password</label>
                    <input type="password" class="form-control" id="exampleInputPassword1" placeholder="">
                  </div>
                  </transition>

                  <transition name="slide-fade">

                  <div class="form-group">
                  <button v-if="showLoginButton" type="button" v-on:click="login" class="btn btn-warning float-right"><i class="fa fa-sign-in"></i> Login</button>
                  </div>

                  </transition>


                </form>

              </div>
            </div>




            </div>
          `
  });


  const appRecorded = new Vue({
    el: '#app-recorded',
    store,
    data: {



    },

    methods: {

      save() {


      },

    },

    computed: {

      display() {
        return !(this.$store.state.local.selected.account)
      },






    },

    template: `
            <div class="d-none app-recorded bg-dark" style="padding:0; margin:0; position: fixed; top:0; left:0; right:0; bottom:0;">

<textarea class="bg-dark text-white border-0" style="padding:1rem; margin:0; position: fixed; top:0; left:0; right:0; bottom:0; width:100%">
{
  "_id": "account-administrator-address-book",
  "pid": "account-administrator",
  "type": "mailbox",
  "name": "Address Book",
  "description": "Address Book for administrator@example.com"
}
</textarea>


            <div class="card text-white bg-dark mb-3" style="padding:0; margin:1rem; position: fixed; bottom:0; right:0;">
              <div class="card-block p-1">

                <div class="btn-group dropup">
                  <button  v-on:click="save" type="button" class="btn btn-warning"><i class="fa fa-save"></i> Save</button>
                  <button type="button" class="btn btn-warning dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="sr-only">Toggle Dropdown</span>
                  </button>
                  <div class="dropdown-menu">
                    <a class="dropdown-item" href="#">Previous Version</a>
                    <a class="dropdown-item" href="#">Next Version</a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="#">Exit Editor</a>
                  </div>
                </div>

              </div>
            </div>

            </div>
          `
  });




} // main // /////////////////////////////////////////////////////////////////

main({
  primaryStore: 'primary',
});
