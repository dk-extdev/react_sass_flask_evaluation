/**
 * Created by rayde on 11/4/2017.
 */
$('form').on('submit', function(e){
    e.preventDefault();
   let email = $('#email').val();
    let password = $('#password').val();
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({email: email, password: password})
    }).then(function(response) {
        return response.json();
    }).then(function(resp) {
            if(resp.error){
                Materialize.toast('Error Logging In: ' + resp.message, 4000, 'red');
            }
            else {
                Materialize.toast('Success!', 4000);
                window.location.replace(resp.redirect);
            }
        })
});