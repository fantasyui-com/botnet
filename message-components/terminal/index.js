const XRegExp = require('xregexp');

module.exports = {
  data () {
    return {

      patterns: [
        {
          type:'adduser',
          keys:['name','address'],
          test: ({name,address}={name:'Thor',address:'thor@valhalla.com'})=>`Add user <span class="badge badge-dark">${name}</span> with address <span class="badge badge-dark">${address}</span>`,
          text: 'Add user ? with address ?',
          list: [
            XRegExp(`^Add user (?<name>[a-zA-Z0-9-]{3,}) with address (?<address>[.@a-zA-Z0-9-]{1,}@[.@a-zA-Z0-9-]{1,})$`),
          ],
        },
      ],

      action: null,
      preview:"",
      command: "?",

    }
  },
  template: `
    <div>

      <div class="form-group">
        <input v-model="command" v-on:keyup="match" v-on:keyup.enter.prevent="submit" class="form-control" placeholder="Alice's Wonderland">
      </div>

      <div v-if="preview" class="alert alert-secondary" role="alert" v-html="preview"></div>

      <div v-if="help" v-for="pattern in patterns" class="alert alert-info" role="alert" v-on:click="shove(pattern)">
        {{pattern.text}}
        <hr>
        <small v-html="pattern.test()"></small>
      </div>

      <button v-if="action" type="button" v-on:click="reset()" class="btn btn-danger"><i class="fa fa-times fa-2x"></i></button>
      <button v-if="action" type="button" v-on:click="submit()" class="btn btn-success float-right"><i class="fa fa-check fa-2x"></i></button>

    </div>
  `,

  computed: {
    help () {
      return !!(this.command.match(/^\?$|^Help$/i))
    },
    accounts () {
      return this.$store.getters.byType('account');
    },

  },

  methods: {

    shove(pattern){

      this.preview = "";
      this.command = pattern.text

    },

    reset(){
       this.command = "";
       this.preview = "";
       this.action = null;
    },

    submit(){
      if(this.action) this.$store.dispatch(this.action);
    },

    match () {

      for(let i = 0; i<this.patterns.length;i++){
        const pattern = this.patterns[i];
        let match = null;

        for(let index = 0; index<pattern.list.length;index++){
          let expression = pattern.list[index];
          match = XRegExp.exec(this.command, expression);
          if(match){
            break
          }
        }
        if(match){
          const action = {
            type:pattern.type
          };
          pattern.keys.forEach(key => {
            action[key] = match[key];
          });
          console.info('ACTION DISPATCH!', action );
          this.preview = pattern.test(action)
          this.action = action;
          break;
        }else{

          this.preview = "";
          this.action = null;

        }
      };


    },




  }
}
