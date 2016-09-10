exports.stringOfRandomNumbers = function(numDigits) {
	var allDigits = "";
	
	for (var idx = 1; idx <= numDigits; ++idx) {
		float randomFloat = Math.random() * (9 - 0) + 0; // random 0 - 9
		int randomDigit = Math.floor(randomFloat);
		String digit = String.valueOf(randomDigit);
		allDigits.concat(digit);
	}
	return allDigits
}
