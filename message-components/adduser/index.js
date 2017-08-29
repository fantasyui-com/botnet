module.exports = {
  data () {
    return {

        type: "adduser",
        name:"",
        address:"",

    }
  },
  template: `
    <form>

      <div class="form-group">
        <label for="name">Name</label>
        <input v-model="name" class="form-control" id="name" placeholder="Manager">
      </div>

      <div class="form-group">
        <label for="address">Account Address</label>
        <input v-model="address" class="form-control" id="address" placeholder="alice@wonderland">
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

       this.$store.dispatch({
         type: this.type,
         name: this.name,
         address: this.address,
       });

       this.name = "";
       this.address = "";

       this.$store.commit('deselect', ['messages', 'message']);

    },

    reset (event) {

      this.name = "";
      this.address = "";

      this.$store.commit('deselect', ['messages', 'message']);
    },
  }
}
