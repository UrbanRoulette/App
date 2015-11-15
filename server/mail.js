Meteor.startup(function() {
  smtp = {
    username: 'leo@mitoo.co', // eg: server@gentlenode.com
    password: 'Jp9m39eGgG35dce', // eg: 3eeP1gtizk5eziohfervU
    server: 'smtp.gmail.com', // eg: mail.gandi.net
    port: 25
  }
  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
});