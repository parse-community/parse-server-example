//Send push afterSave function in "messages" class

Parse.Cloud.afterSave("messages", function(request){
  Parse.Cloud.useMasterKey();
  var recipient = request.object.get('receiverId');

  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo("userId",recipient);
  pushQuery.first({
    success: function(object){
        Parse.Push.send({
          where: pushQuery,
          data: {
            alert: "Nueva solicitud de conexion",
            badge: "Increment",
            sound: "default"
          }
        }, {
            success: function() {
                // Push was successful
            },
            error: function(error) {
                throw "Got an error " + error.code + " : " + error.message;
            }
        });
    },
    error: function(error) {
      console.error("Got an error " + error.code + " : " + error.message);
    }
  });
});

//Send push afterSave function in "orders" class

Parse.Cloud.afterSave("orders", function(request){
  Parse.Cloud.useMasterKey();
  var member = request.object.get('memberId');

  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo("username",member);
  pushQuery.first({
    success: function(object){
        Parse.Push.send({
          where: pushQuery,
          data: {
            alert: "Order confirmation",
            //badge: "Increment",
            sound: "default"
          }
        }, {
            success: function() {
                // Push was successful
            },
            error: function(error) {
                throw "Got an error " + error.code + " : " + error.message;
            }
        });
    },
    error: function(error) {
      console.error("Got an error " + error.code + " : " + error.message);
    }
  });
});

//Charge a card after the member confirm an order
var Stripe = require('stripe');
Stripe.initialize('sk_live_APQqH6usvryT5XA7vkkXB6jy');

Parse.Cloud.define("chargeCard", function(request, response) {

  var stripeToken = request.params.cardToken;
  var orderAmount = request.params.amount;

  var charge = Stripe.Charges.create({
    amount: orderAmount * 100, // express dollars in cents 
    currency: 'eur',
    card: stripeToken
  },{
  success: function(httpResponse) {
    response.success("Charged succesfully");
  },
  error: function(httpResponse) {
    response.error("Uh oh, something went wrong");
  }
});

});
