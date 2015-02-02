var Contacts = window.Contacts = {

  list: [],

  update: function(cb) {
    jQuery.ajax(
      {
        url: '/api/v1/contacts/list?keyword=&query=&sort=recently%20viewed:asc&per_page=3000&page=1&fields=first%20name,last%20name,company%20name,parent%20company,email,phone,lead%20type,lead%20status,address,title&record_type=',
        method: 'GET',
        headers: {
          Authorization: 'Nimble token="' + options.token + '"'
        },
        success: function(data) {
          if (!data) return;
          Contacts.list = data.resources;
          this._prepare();
          cb && cb(null, Contacts.list);
          taistApi.log(Contacts.list);
        }.bind(this)
      });
  },

  _prepare: function() {
    this.list = this.list.filter(function(contact) {
      if (contact.record_type === 'person') {
        contact.full_name = contact.fields['first name'][0].value;
        if (contact.fields['last name']) {
          contact.full_name += ' ' + contact.fields['last name'][0].value;
        }
        contact.link = '#app/contacts/view?id=' + contact.id;
        return true;
      }
    });
  },

  getRelationContacts: function(relationIds) {
    var _this = this;

    return relationIds.map(function(id) {
      return _this.findById(id);
    }).filter(function(contact) {
      return !!contact;
    });
  },

  findById: function(id) {
    for (var i = 0, len = this.list.length; i < len; i++) {
      if (this.list[i].id === id) {
        return this.list[i];
      }
    }
  }

};