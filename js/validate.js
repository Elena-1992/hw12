let Validator = (function () {

    let _createMessage = function (message, settings) {
        for (let key in settings) {
            message = message.replace('%' + key + '%', settings[key])
        }
        return message
    }

    let _extend = function (out) {
        out = out || {}

        for (let i = 1; i < arguments.length; i++) {
            let obj = arguments[i]

            if (!obj)
                continue

            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object')
                        out[key] = _extend(out[key], obj[key])
                    else
                        out[key] = obj[key]
                }
            }
        }

        return out;
    }

    let regExps = {
        email: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
        phoneNumber: /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/,
        name: /[A-Za-z]{2,20}/,
        password: /[A-Za-z]{2,20}/
    }

    let messages = {
        required: 'This field is required',
        min: 'This field should contain at least %rule% characters',
        max: 'This field should not contain more than %rule% characters',
        match: 'This field shold countain a valid %rule%'
    }

    let Validate = function (element, options) {
        let defaults = {
            regExps: regExps,
            messages: messages
        }
        this.options = _extend({}, defaults, options)
        this.element = element
        this.regExps = regExps
    }

    let fn = Validate.prototype

    fn.validate = function () {
        let isValid = true

        this.value = this.element.value.trim()
        this.length = this.value.length;

        for (let rule in this.options.rules) {
            let param = this.options.rules[rule]

            if (!this[rule](param)) {
                isValid = false
                this.message = _createMessage(this.options.messages[rule], {rule: param, data: this.value})
                this.options.onError.call(this)
                return false
                break;

            }
        }

        if (isValid) {
            this.options.onSuccess.call(this);
            return true
        }
    }

    fn.required = function () {
        return this.length > 0
    }
    fn.min = function (param) {
        return this.length >= param
    }
    fn.max = function (param) {
        return this.length <= param
    }
    fn.match = function (param) {
        return this.regExps[param].test(this.value)
    }
    fn.nameUsr = function() {
        return userName
    }
    fn.namePas = function() {
        return userPassword
    }
    return {
        init: Validate,
        fn: fn
    }
})()

let onError = function () {
    let parentNode = this.element.parentNode
    parentNode.classList.add('has-error')
    parentNode.classList.remove('has-success')
    parentNode.querySelector('.help-block').textContent = 'Error: ' + this.message
    document.getElementById('reg-validate').disabled = true
    document.getElementById('validate').disabled = true
    return false
}

let onSuccess = function () {
    let parentNode = this.element.parentNode
    parentNode.classList.add('has-success')
    parentNode.classList.remove('has-error')
    parentNode.querySelector('.help-block').textContent = 'Your data is valid.'
    document.getElementById('reg-validate').disabled = false
    document.getElementById('validate').disabled = false
    return true
}

let emailInput = new Validator.init(document.getElementById('reg-email'), {
    rules: {
        required: true,
        min: 5,
        max: 20,
        match: 'email'
    },
    messages: {
        required: 'This field is required!',
        min: 'This field must contain at least %rule% characters. The value %data% does not match',
        max: 'This field must contain a maximum of %rule% characters. The value of %data% is not appropriate',
        match: 'This field must contain an email address. The value %data% does not match'
    },
    onError: onError,
    onSuccess: onSuccess
})

let passwordInput = new Validator.init(document.getElementById('reg-password'), {
    rules: {
        required: true,
        match: "password"
    },
    messages: {
        required: 'This field is required!',
        match: 'The password must be "qwerty" for example.  "%data%" - this password is not entered correctly'
    },
    onError: onError,
    onSuccess: onSuccess
})

let nameInput = new Validator.init(document.getElementById('reg-name'), {
    rules: {
        required: true,
        match: 'name'
    },
    messages: {
        required: 'This field is required!',
        match: 'The name must be at least 2 characters and not more than 20 characters.',
    },
    onError: onError,
    onSuccess: onSuccess
})

let phoneInput = new Validator.init(document.getElementById('reg-number'), {
    rules: {
        required: true,
        match: 'phoneNumber'
    },
    messages: {
        required: 'This field is required!',
        match: 'Incorrect phone number. Enter in the format 8 927 1234 234'
    },
    onError: onError,
    onSuccess: onSuccess
})

Validator.fn.password = function () {
    return this.value.toLowerCase()
}

let validateBtn = document.getElementById('reg-validate')
let validateButton = document.getElementById('validate')

validateBtn.addEventListener('click', function (e) {
    e.preventDefault()
    let success = true
    if (emailInput.validate() == false) {
        success = false
    }
    if (passwordInput.validate() == false) {
        success = false
    }
    if (nameInput.validate() == false) {
        success = false
    }
    if (phoneInput.validate() == false) {
        success = false
    }
    if (success) {
        document.getElementById('reg-validate').disabled = false
        if (typeof(Storage) !== "undefined") {
            console.log('localStorage Success')
            localStorage.setItem("email", emailInput.value)
            localStorage.setItem("password", passwordInput.value)
            localStorage.setItem("name", nameInput.value)
            localStorage.setItem("phone", phoneInput.value)
        } else {
            console.log('Sorry! No Web Storage support..')
        }
    }
}, false)

let userName = localStorage.getItem('name')
console.log(userName)
let userPassword = localStorage.getItem('password')
console.log(userPassword)

let nameLogin = new Validator.init(document.getElementById('name'), {
    rules: {
        required: true,
        nameUsr: userName
    },
    messages: {
        required: 'This field is required!',
        nameUsr: 'There is no such name, try again'
    },
    onError: onError,
    onSuccess: onSuccess
})

let passLogin = new Validator.init(document.getElementById('password'), {
    rules: {
        required: true,
        namePas: userPassword
    },
    messages: {
        required: 'This field is required!',
        namePas: 'Incorrect password'
    },
    onError: onError,
    onSuccess: onSuccess
})

validateButton.addEventListener('click', function (e) {
    e.preventDefault()
    let success = true
    if (nameLogin.validate() == false) {
        success = false
    }
    if (passLogin.validate() == false) {
        success = false
    }
    if (success) {
        document.getElementById('validate').disabled = false
        console.log('Success')
    }
}, false)

let blurName = document.getElementById("reg-name")
blurName.addEventListener("blur", function (e) {
    nameInput.validate()
}, false)

let blurNum = document.getElementById("reg-number")
blurNum.addEventListener("blur", function (e) {
    phoneInput.validate()
}, false)

let blurMail = document.getElementById("reg-email")
blurMail.addEventListener("blur", function (e) {
    emailInput.validate()
}, false)

let blurPass = document.getElementById("reg-password")
blurPass.addEventListener("blur", function (e) {
    passwordInput.validate()
}, false)

let blurNameUser = document.getElementById("name")
blurNameUser.addEventListener("blur", function (e) {
   nameLogin.validate()
}, false)

let blurPassword = document.getElementById("password")
blurPassword.addEventListener("blur", function (e) {
    passLogin.validate()
}, false)

//localStorage.clear();