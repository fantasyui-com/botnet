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
        <div class="input-group">
        <div class="input-group-btn">
          <button type="button" class="btn btn-outline-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            To
          </button>
          <div class="dropdown-menu">
            <a v-for="account in accounts" class="dropdown-item" v-on:click="user=account.address" href="#">{{account.address}}</a>
          </div>
        </div>
          <input type="text" class="form-control" v-model="user" id="user" aria-label="Text input with dropdown button">
        </div>
      </div>

      <div class="form-group">
        <label for="name">Subject</label>
        <input v-model="name" class="form-control" id="name" placeholder="Hello">
      </div>



      <div class="form-group">
        <label for="name">Box</label>
        <input v-model="box" class="form-control" id="name" placeholder="Inbox">
      </div>

      <div class="form-group">
        <label for="exampleFormControlTextarea1">Text</label>
        <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
      </div>

      <div class="form-group">
        <label for="exampleFormControlSelect1">Component</label>
        <select class="form-control" id="exampleFormControlSelect1">
          <option value="">none</option>
          <option>addbox</option>
          <option>adduser</option>
          <option>contact</option>
          <option>deluser</option>
          <option>terminal</option>
        </select>
      </div>

      <hr>
      <button type="button" v-on:click="reset()" class="btn btn-danger"><i class="fa fa-times fa-2x"></i></button>
      <button type="button" v-on:click="submit()" class="btn btn-success float-right"><i class="fa fa-check fa-2x"></i></button>

    </form>
  `,
  computed: {
    accounts() {
      return this.$store.getters.byType('account'); //
    },
    count () {
      return this.$store.state.count
    },
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
