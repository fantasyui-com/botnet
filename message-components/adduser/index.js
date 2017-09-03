const bcrypt = require('bcryptjs');

module.exports = {
  data () {
    return {

        type: "adduser",
        name:"",
        address:"",
        password:"",

    }
  },
  template: `
    <form>

      <div class="form-group">
        <label for="name">Name</label>
        <input v-model="name" class="form-control" id="name" placeholder="Alice Kingsleigh">
      </div>

      <div class="form-group">
        <label for="address">Account Address</label>
        <input v-model="address" class="form-control" id="address" placeholder="alice@wonderland">
      </div>

      <div class="form-group">
        <label for="address">Password</label>
        <input type="password" v-model="password" class="form-control" id="password">
      </div>

      <hr>
      <button type="button" v-on:click="reset()" class="btn btn-danger"><i class="fa fa-times fa-2x"></i></button>
      <button type="button" v-on:click="submit()" class="btn btn-success float-right"><i class="fa fa-check fa-2x"></i></button>

    </form>
  `,
  computed: {
    count () {
      return this.$store.state.count
    }
  },
  methods: {

    submit (event) {

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(this.password, salt);

       this.$store.dispatch({
         type: this.type,
         name: this.name,
         address: this.address,
         password: hash,
       });

       this.name = "";
       this.address = "";
       this.password = "";

       this.$store.commit('deselect', ['messages', 'message']);

    },

    reset (event) {

      this.name = "";
      this.address = "";
      this.password = "";

      this.$store.commit('deselect', ['messages', 'message']);
    },
  }
}
