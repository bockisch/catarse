var ProjectPaginatedContentView = ProjectContentView.extend({
  initialize: function(){
    $('#loading').waypoint('destroy')
    _.bindAll(this, "render", "update", "nextPage", "waypoint", "successCreate", "errorCreate")
    this.setOptions()
    this.selectLink()
    this.render()
    $('#loading img').show()
    this.collection.page = 1
    this.collection.bind("refresh", this.update)
    this.collection.fetch()
    $('#loading').waypoint(this.waypoint, {offset: "100%"})
  },
  events: {
    "click [type=submit]": "createItem",
    "click #show_formatting_tips": "showFormattingTips"
  },
  waypoint: function(event, direction){
    $('#loading').waypoint('remove')
    if(direction == "down")
      this.nextPage()
  },
  nextPage: function(){
    if(!this.collection.isEmpty()) {
      $('#loading img').show()
      this.collection.nextPage()
    }
  },
  showFormattingTips: function(event){
    event.preventDefault()
    this.$('#show_formatting_tips').hide()
    this.$('#formatting_tips').slideDown()
  },
  render: function() {
    $(this.el).html(Mustache.to_html(this.template.html(), this.collection))
    if(this.$('input[type=text],textarea').length > 0)
      this.$('input[type=text],textarea')[0].focus()
    return this
  },
  update: function(){
    $('#loading img').hide()
    if(!this.collection.isEmpty()) {
      this.collection.each(function(model){
        var listItem = $('<li>')
        this.$('#collection_list').append(listItem)
        new this.modelView({el: listItem, model: model, contentView: this})        
      }, this)
    } else if(this.collection.page == 1) {
      $(this.el).append(this.emptyText)
    }
    $('#loading').waypoint(this.waypoint, {offset: "100%"})
    return this
  },
  createItem: function(event){
    event.preventDefault()
    var fields = {}
    var fieldName = ""
    this.$('input,textarea').each(function(){
      fieldName = /^\w+\[(\w+)\]$/.exec($(this).attr('name'))
      if(fieldName){
        fieldName = fieldName[1]
        fields[fieldName] = $(this).val()
      }
    })
    this.$('[type=submit]').attr('disabled', true)
    var comment = new this.collection.model(fields)
    // TODO validations on the models and checking error here
    comment.save(comment.attributes, {success: this.successCreate, error: this.errorCreate})
  },
  successCreate: function(model, response){
    this.$('[type=submit]').attr('disabled', false)
    this.$('input[type=text],textarea').val("")
    this.$('input[type=text],textarea')[0].focus()
    var countTag = this.link.find('.count')
    var count = parseInt((/^\((\d+)\)$/.exec(countTag.html()))[1])
    countTag.html("(" + (count + 1) + ")")
    var listItem = $('<li>')
    this.$('#collection_list').prepend(listItem)
    new this.modelView({el: listItem, model: model, contentView: this})
  },
  errorCreate: function(model, response){
    this.$('[type=submit]').attr('disabled', false)
    this.$('input[type=text],textarea')[0].focus()
    alert("Ooops! Ocorreu um erro ao salvar seu comentário. Por favor, tente novamente.")
  }
})