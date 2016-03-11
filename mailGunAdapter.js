'use strict';

var _mailgunJs = require('./node_modules/parse-server/node_modules/mailgun-js');

var _mailgunJs2 = _interopRequireDefault(_mailgunJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SimpleMailgunAdapter = function SimpleMailgunAdapter(mailgunOptions) {
	if (!mailgunOptions || !mailgunOptions.apiKey || !mailgunOptions.domain) {
		throw 'SimpleMailgunAdapter requires an API Key and domain.';
	}
	var mailgun = (0, _mailgunJs2.default)(mailgunOptions);

	var sendMail = function sendMail(_ref) {
		var to = _ref.to;
		var subject = _ref.subject;
		var text = _ref.text;

		var data = {
			from: mailgunOptions.fromAddress,
			to: to,
			subject: subject,
			text: text
		};

		return new Promise(function (resolve, reject) {
			mailgun.messages().send(data, function (err, body) {
				if (typeof err !== 'undefined') {
					reject(err);
				}
				resolve(body);
			});
		});
	};

	var sendVerificationEmail = function sendVerificationEmail(link, user, appName) {
	    var text = "Estimado(a), \n\n"+
	    "Bienvenido a GoodGreens! Para realizar tu pedido, por favor verifica tu correo electrónico haciendo click en el siguiente enlace:\n\n"+
	    link+"\n\n"+
	    "Usuario: "+user.get("email")+"\n\n"+
	    "Estamos muy ilusionados por compartir contigo gran variedad de productos que promueven un estilo de vida saludable y en armonía con ambiente. En nuestra tienda virtual www.goodgreens.cr podrás elegir más de 400 productos frescos con los que podrás satisfacer los gustos y necesidades de toda tu familia.\n\n"+
	    "Si tienes dudas sobre el proceso o retroalimentación para mejorar nuestro servicio, no dudes en contactarme.\n\n"+
	    "Saludos, \nRebeca Salazar";
	    var to = user.get("email");
	    var subject = "Favor verificar tu correo electrónico con" + appName;
	    return { text, to, subject };
	};

	var sendPasswordResetEmail = function sendPasswordResetEmail(link, user, appName) {
	    var text = "Estimado(a) "+user.get("name")+",\n\n"+
		"Haz solicitado un cambio de contraseña de tu cuenta en "+appName+"\n\n"+
		"Haz click en el siguiente enlace para cambiarla:\n\n"+
		link;
	    var to = user.get("email");
	    var subject =  'Reestablecer tu contraseña con ' + appName;
	    return { text, to, subject };
	};

	return Object.freeze({
		sendMail: sendMail,
		sendVerificationEmail: sendVerificationEmail,
		sendPasswordResetEmail: sendPasswordResetEmail
	});
};

module.exports = SimpleMailgunAdapter;