/**
 * Created by rayde on 12/10/2017.
 */
$('#signUp').on('click', function () {
    const token = $('#data').data('token');
    const email = $('#username').val();
    const passwordInput = $('#password');
    const confirmPasswordInput = $('#confirmPassword');
    if(passwordInput.length && confirmPasswordInput.length){
        const password = passwordInput.val();
        const confirmPassword = confirmPasswordInput.val();
        if(password != confirmPassword){
            Materialize.toast('The passwords do not match', 6000, 'red');
        }
        else {
            $('.loading-container').removeClass('hidden');
            fetch('/signUp', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    token: token
                })
            }).then(function(response) {return response.json()}).then(function(response) {
                // Redirect To Home page.
                if(response.error){
                    Materialize.toast('Error Occurred: ' + JSON.stringify(response.message == null ? response : response.message), 6000, 'red');
                }
                else {
                    console.log(response);
                    window.location.replace(response.redirect);
                }
            }, function(error) {
                Materialize.toast('Error Occurred: ' + JSON.stringify(error.message == null ? error : error.message), 6000, 'red');
            })
        }
    }
    else {
        Materialize.toast('You need to provide a password and confirm it.', 6000, 'red');
    }
});

$('#resend-invite').on('click', function(){
    const loadingContianer = $('.loading-container');
    loadingContianer.removeClass('hidden');
    const token = $('#data').data('token');
    fetch('/signUp', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(({token: token}))
    }).then(function(response) { return response.json()}).then(function(response) {
        if(response.error){
            loadingContianer.addClass('hidden');
            Materialize.toast('Something went wrong: ' + JSON.stringify(response.message), 6000, 'red');
        }
        else {
            loadingContianer.addClass('hidden');
            Materialize.toast('Successfully resent Invite Email.', 6000);
        }
    }, function(error)  {
        loadingContianer.addClass('hidden');
        Materialize.toast('Something went wrong: ' + JSON.stringify(error), 6000);
    });
});
