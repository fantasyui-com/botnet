module.exports = {
  data () {
    return {



        type: "sendmail",

        address:"",
        box:"",

        name:"",
        text:"",

        component:"",

    }
  },

  computed: {
    from() {
      return (this.$store.getters.byType('account').filter(account => account._id === this.$store.state.local.selected.account)[0]||{}).address;
    },
    accounts() {
      return this.$store.getters.byType('account');
    },
    count () {
      return this.$store.state.count
    },
  },

  template: `
    <form>

      <div class="form-group">
        <div class="input-group">
        <div class="input-group-btn">
          <button type="button" class="btn btn-outline-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            To
          </button>
          <div class="dropdown-menu">
            <a v-for="account in accounts" class="dropdown-item" v-on:click="address=account.address" href="#">{{account.address}}</a>
          </div>
        </div>
          <input type="text" class="form-control" v-model="address" id="address" aria-label="Text input with dropdown button">
        </div>
      </div>

      <div class="form-group">
        <label for="name">From</label>
        <input v-model="from" type="text" readonly class="form-control-plaintext" id="from" style="width: 100%;">
      </div>

      <div class="form-group">
        <label for="name">Subject</label>
        <input v-model="name" class="form-control" id="name" placeholder="Hello">
      </div>

      <div class="form-group">
        <label for="name">Box</label>
        <input v-model="box" class="form-control" id="box" placeholder="Inbox">
      </div>

      <div class="form-group">
        <label for="text">Text</label>
        <textarea v-model="text" class="form-control" id="text" rows="3"></textarea>
      </div>

      <div class="form-group">
        <label for="component">Component</label>
        <select v-model="component" class="form-control" id="component">
          <option value="">none</option>
          <option id="addbox">Add Box</option>
          <option id="adduser">Add User</option>
          <option id="contact">Contact</option>
          <option id="deluser">Delete User</option>
          <option id="terminal">Terminal</option>
        </select>
      </div>

      <hr>
      <button type="button" v-on:click="reset()" class="btn btn-danger"><i class="fa fa-times fa-2x"></i></button>
      <button type="button" v-on:click="submit()" class="btn btn-success float-right"><i class="fa fa-check fa-2x"></i></button>

    </form>
  `,

  methods: {

    submit (event) {

       this.$store.dispatch({

         type: this.type,
         from: this.from,

         address: this.address,
         box: this.box,
         name: this.name,
         text: this.text,
         component: this.component,

       });


       this.address = "";
       this.box = "";
       this.name = "";
       this.text = "";
       this.component = "";

       this.$store.commit('deselect', ['messages', 'message']);

    },

    reset (event) {


      this.address = "";
      this.box = "";
      this.name = "";
      this.text = "";
      this.component = "";

      this.$store.commit('deselect', ['messages', 'message']);
    },
  }
}
