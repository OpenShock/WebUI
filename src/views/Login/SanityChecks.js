class SanityChecks {

	checkUsername(username) {
		let arr = [];

		if (username.length < 3) arr.push("Minimum length of 3 characters");
		if (username.length > 32) arr.push("Maximum length of 32 characters");
		if (!username.match(/^[a-zA-Z0-9/.!'_-]*$/)) arr.push("Illegal character used");

		return arr;
	}

	checkEmail(email) {
		let arr = [];

		
		if (email.length > 64) arr.push("Maximum length of 64 characters");
		if (!email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) arr.push("Email is not valid")
		if (email.length < 5) arr.push("Minimum length of 5 characters");

		return arr;
	}

	checkPassword(password) {
		let arr = [];

		if (password.length <= 12) arr.push("Minimum length of 12 characters");
		if (password.length >= 256) arr.push("Maximum length of 256 characters");
		if(!this.hasLowerCase(password)) arr.push("One lowercase character");
		if(!this.hasUpperCase(password)) arr.push("One uppercase character");
		if(!this.hasNumber(password)) arr.push("One number");
		if(!this.hasSpecial(password)) arr.push("One special character");

		return arr;
	}

	hasLowerCase(str) {
		return (/[a-z]/.test(str));
	}

	hasUpperCase(str) {
		return (/[A-Z]/.test(str));
	}

	hasNumber(str) {
		return (/[0-9]/.test(str));
	}

	hasSpecial(str) {
		return (/[@#$%/.!'_-]/.test(str));
	}
}

export default new SanityChecks();
