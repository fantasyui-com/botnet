module.exports = {
  data () {
    return {

      type: "addbox",
      name:"",
      pid:"",

    }
  },
  template: `
    <form>

      <div class="form-group">
        <label for="name">Mailbox Name</label>
        <input v-model="name" class="form-control" id="name" placeholder="Alice's Wonderland">
      </div>

      <div class="form-group mb-0">
        <label for="name">Account</label>
      </div>

      <div v-for="account in accounts" class="form-check">
        <label class="form-check-label mb-1">
          <input class="form-check-input mr-2" type="radio" v-model="pid" name="pid" v-bind:value="account._id">
          {{account.address}}
        </label>
      </div>

      <hr>
      <button type="button" v-on:click="reset()" class="btn btn-danger"><i class="fa fa-times fa-2x"></i></button>
      <button type="button" v-on:click="submit()" class="btn btn-success float-right"><i class="fa fa-check fa-2x"></i></button>

    </form>
  `,

  computed: {
    accounts () {
      return this.$store.getters.getAllAccounts();
    }
  },

  methods: {
    submit (event) {

      this.$store.dispatch({
        type: this.type,
        name: this.name,
        pid: this.pid,
      });

      this.name = "";
      this.pid = "";

      this.$store.commit('deselect', ['messages', 'message']);
    },

    reset (event) {

      this.name = "";
      this.pid = "";

      this.$store.commit('deselect', ['messages', 'message']);
    },
  }
}
