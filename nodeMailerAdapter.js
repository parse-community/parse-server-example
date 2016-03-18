'use strict';

var nodemailer = require("nodemailer");

var SimpleNodeMailerAdapter = function SimpleNodeMailerAdapter(nodeMailerOptions) {
	if (!nodeMailerOptions || !nodeMailerOptions.email || !nodeMailerOptions.password) {
		throw 'NodeMailerAdapter requires an email and password.';
	}

	var sendMail = function sendMail(_ref) {
		var smtpTransport = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: nodeMailerOptions.email,
				pass: nodeMailerOptions.password
			}
		});

		var to = _ref.to;
		var subject = _ref.subject;
		var text = _ref.text;

		var data = {
			from: nodeMailerOptions.fromAddress,
			to: to,
			subject: subject
		};

		if( _ref.text ) {
			data.text= _ref.text;
		} else {
			data.html= _ref.html;
		}

		return new Promise(function (resolve, reject) {
			smtpTransport.sendMail(data, function ( err, body ) {
	            if (err) {
	            	reject(err);
	            } else {
					resolve(body);
	            }
	        });
		});
	};

	var sendVerificationEmail = function sendVerificationEmail(options) {
	    var text = "Estimado(a) "+options.user.get("name")+",\n\n"+"Bienvenido a GoodGreens! Para realizar tu pedido, por favor verifica tu correo electrónico haciendo click en el siguiente enlace:\n\n"+options.link+"\n\n"+"Usuario: "+options.user.get("email")+"\n\n"+"Estamos muy ilusionados por compartir contigo gran variedad de productos que promueven un estilo de vida saludable y en armonía con ambiente. En nuestra tienda virtual www.goodgreens.cr podrás elegir más de 400 productos frescos con los que podrás satisfacer los gustos y necesidades de toda tu familia.\n\n"+"Si tienes dudas sobre el proceso o retroalimentación para mejorar nuestro servicio, no dudes en contactarme.\n\n"+"Saludos, \nRebeca Salazar";
	    var to = options.user.get("email");
	    var subject = "Favor verificar tu correo electrónico con " + options.appName;
	    return sendMail({ text: text, to: to, subject: subject });
	};

	var sendPasswordResetEmail = function sendPasswordResetEmail(options) {
	    var text = "Estimado(a) "+options.user.get("name")+",\n\n"+"Haz solicitado un cambio de contraseña de tu cuenta en "+options.appName+"\n\n"+"Haz click en el siguiente enlace para cambiarla:\n\n"+options.link;
	    var to = options.user.get("email");
	    var subject =  "Reestablecer tu contraseña con " + options.appName;
	    return sendMail({ text: text, to: to, subject: subject });
	};

	return Object.freeze({
		sendMail: sendMail,
		sendVerificationEmail: sendVerificationEmail,
		sendPasswordResetEmail: sendPasswordResetEmail
	});
};

module.exports = SimpleNodeMailerAdapter;