var Relations = {

  getAll: function(contactId, cb) {
    taistApi.companyData.setCompanyKey('relations' + contactId);
    taistApi.companyData.get('relations' + contactId, function(err, relationIds) {
      cb(err, relationIds || []);
    });
  },

  add: function(id1, id2, cb) {
    this.getAll(id1, function(err, relations) {
      if (!~relations.indexOf(id2)) {
        relations.push(id2);
        this._save(id1, relations, function() {
          this.getAll(id2, function(err, relations) {
            if (!~relations.indexOf(id1)) {
              relations.push(id1);
              this._save(id2, relations, cb);
            }
          }.bind(this));
        }.bind(this));
      }
    }.bind(this));
  },

  remove: function(id1, id2, cb) {
    this.getAll(id1, function(err, relations) {
      relations.splice(relations.indexOf(id2), 1);
      this._save(id1, relations, function() {
        this.getAll(id2, function(err, relations) {
          relations.splice(relations.indexOf(id1), 1);
          this._save(id2, relations, cb);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },

  _save: function(contactId, relations, cb) {
    taistApi.companyData.set('relations' + contactId, relations, function(err) {
      err && taistApi.log('relation wasn\'t saved:');
      cb && cb(err);
    });
  }

};