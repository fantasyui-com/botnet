module.exports = {
  data () {
    return {

      type: "deluser",
      id:"",

    }
  },
  template: `
    <form>

      <div class="form-group mb-0">
        <label for="name">Accounts</label>
      </div>

      <div v-for="account in accounts" class="form-check">
        <label class="form-check-label mb-1">
          <input class="form-check-input mr-2" type="radio" v-model="id" name="id" v-bind:value="account._id">
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
      return this.$store.getters.byType('account');
    }
  },

  methods: {
    submit (event) {
      this.$store.dispatch({
        type: this.type,
        id: this.id,
      });
      this.id = "";
      this.$store.commit('deselect', ['messages', 'message']);
    },

    reset (event) {
      this.id = "";
      this.$store.commit('deselect', ['messages', 'message']);
    },
  }
}
