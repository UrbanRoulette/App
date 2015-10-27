Images = new FS.Collection("images", {
  stores: [new FS.Store.FileSystem("images", {path: "~/uploads"})]
});

Images.allow({
  insert: function (userId, doc) {
    return true;
  },
  download: function (userId, doc, fields, modifier) {
    return true;
  }
});