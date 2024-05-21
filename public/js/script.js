const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    
    togglePassword.addEventListener('click', function () {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    const togglePasswordLogin = document.getElementById('togglePasswordLogin');
    const passwordLogin = document.getElementById('password-login');
    
    togglePasswordLogin.addEventListener('click', function () {
        const type = passwordLogin.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordLogin.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    const cpfField = document.getElementById('cpf');
    const whatsappField = document.getElementById('whatsapp');

    VMasker(cpfField).maskPattern('999.999.999-99');
    VMasker(whatsappField).maskPattern('(99) 99999-9999');

    function validateInput(input, errorMessage, regex = null) {
        const value = input.value.trim();
        if (value === '' || (regex && !regex.test(value))) {
            input.classList.add('error');
            errorMessage.style.display = 'block';
            return false;
        } else {
            input.classList.remove('error');
            errorMessage.style.display = 'none';
            return true;
        }
    }

    function displayErrors(errors) {
        errors.forEach(error => {
            const inputElement = document.getElementById(error.param);
            const errorElement = document.getElementById(`${error.param}-error`);
            inputElement.classList.add('error');
            errorElement.style.display = 'block';
            errorElement.textContent = error.msg;
        });
    }

    document.getElementById('signup-form').addEventListener('submit', async function (event) {
        event.preventDefault();
        
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const cpf = document.getElementById('cpf');
        const institutionCode = document.getElementById('institution-code');
        const whatsapp = document.getElementById('whatsapp');
        const password = document.getElementById('password');
        
        const isNameValid = validateInput(name, document.getElementById('name-error'), /^[a-zA-Z\s]+$/);
        const isEmailValid = validateInput(email, document.getElementById('email-error'), /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        const isCpfValid = validateInput(cpf, document.getElementById('cpf-error'), /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/);
        const isInstitutionCodeValid = validateInput(institutionCode, document.getElementById('institution-code-error'));
        const isWhatsappValid = validateInput(whatsapp, document.getElementById('whatsapp-error'), /^\(\d{2}\) \d{5}\-\d{4}$/);
        const isPasswordValid = validateInput(password, document.getElementById('password-error'));

        if (isNameValid && isEmailValid && isCpfValid && isInstitutionCodeValid && isWhatsappValid && isPasswordValid) {
            try {
                const response = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome_completo: name.value,
                        email: email.value,
                        cpf: cpf.value,
                        codigo_instituicao: institutionCode.value,
                        whatsapp: whatsapp.value,
                        senha: password.value
                    })
                });
                const data = await response.json();

                if (response.ok) {
                    alert('Usuário registrado com sucesso!');
                    this.reset();
                } else {
                    displayErrors([{ param: 'codigo_instituicao', msg: 'Instituição não encontrada.' }]);
                }
            } catch (error) {
                alert('Erro ao registrar usuário. Por favor, tente novamente mais tarde.');
            }
        }
    });

    document.getElementById('login-form').addEventListener('submit', async function (event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email');
        const password = document.getElementById('password-login');
        
        const isEmailValid = validateInput(email, document.getElementById('login-email-error'), /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        const isPasswordValid = validateInput(password, document.getElementById('login-password-error'));

        if (isEmailValid && isPasswordValid) {
            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email.value,
                        senha: password.value
                    })
                });
                const data = await response.json();

                if (response.ok) {
                    alert('Login realizado com sucesso!');
                } else {
                    displayErrors([{ param: 'server', msg: data.error }]);
                }
            } catch (error) {
                alert('Erro ao fazer login. Por favor, tente novamente mais tarde.');
            }
        }
    });
});
