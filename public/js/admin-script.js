document.addEventListener('DOMContentLoaded', function () {
    const toggleAdminPassword = document.getElementById('toggleAdminPassword');
    const adminPassword = document.getElementById('admin-password');

    toggleAdminPassword.addEventListener('click', function () {
        const type = adminPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        adminPassword.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    function displayErrors(errors) {
        errors.forEach(error => {
            const inputElement = document.getElementById(error.param);
            const errorElement = document.getElementById(`${error.param}-error`);
            inputElement.classList.add('error');
            errorElement.style.display = 'block';
            errorElement.textContent = error.msg;
        });
    }

    document.getElementById('admin-login-form').addEventListener('submit', async function (event) {
        event.preventDefault();
        
        const email = document.getElementById('admin-email');
        const password = document.getElementById('admin-password');

        const isEmailValid = email.value.trim() !== '';
        const isPasswordValid = password.value.trim() !== '';

        if (isEmailValid && isPasswordValid) {
            try {
                const response = await fetch('http://localhost:3000/api/admin/login', {
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
                    alert('Login administrativo realizado com sucesso!');
                    window.location.href = '/api/admin/dashboard';
                } else {
                    displayErrors([{ param: 'server', msg: data.error }]);
                }
            } catch (error) {
                alert('Erro ao fazer login administrativo. Por favor, tente novamente mais tarde.');
            }
        }
    });
});
