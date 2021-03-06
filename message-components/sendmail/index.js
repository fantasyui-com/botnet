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
      return (this.$store.getters.getSelectedAccount()||{}).address;
    },
    accounts() {
      return this.$store.getters.getAllAccounts();
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
        <label for="text">Text</label>
        <textarea v-model="text" class="form-control" id="text" rows="3"></textarea>
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

         name: this.name,
         text: this.text,


       });


       this.address = "";

       this.name = "";
       this.text = "";


       this.$store.commit('deselect', ['messages', 'message']);

    },

    reset (event) {


      this.address = "";

      this.name = "";
      this.text = "";


      this.$store.commit('deselect', ['messages', 'message']);
    },
  }
}
